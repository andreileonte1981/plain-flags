package plainflags

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type PlainFlags struct {
	flagStates    map[string]FlagState
	config        PlainFlagsConfig
	infoFunction  func(string, ...any)
	errorFunction func(string, ...any)
}

type DoneResult struct {
	Done bool
	Err  error
}

// Returns true if the specified feature flag is turned on.
//
// If the context is nil, the value is the same as set in the PlainFlags dashboard app.
//
// For constrained features, pass the current context like in this example:
//
//	if(pf.IsOn("My feaature", false, &map[string]string{
//		"user": getCurrentUser(), "brand": getCurrentBrand(),
//	}))
//
// Match "user" and "brand" with the keys you edited in the dashboard.
//
// The functions getCurrentUser() and getCurrentBrand() are fictitious
// examples of how your software might know the current user and brand for this case.
func (pf *PlainFlags) IsOn(flagName string, defaultValue bool, context *map[string]string) bool {
	flagState, ok := pf.flagStates[flagName]

	if !ok {
		pf.error("Flag %v not in local cache, using default\n", flagName)

		return defaultValue
	}

	return isTurnedOnInContext(flagState, context)
}

// Initializes the PlainFlags instance.
//
// If PollInterval is set to 0, the state will be updated as soon as Done is present in the channel argument.
//
// Example:
//
//	initialized := make(chan plainflags.DoneResult)
//
//	go featureFlags.Init(initialized)
//
//	r := <-initialized
func (pf *PlainFlags) Init(initCh chan DoneResult) {
	defer func() {
		if r := recover(); r != nil {
			initCh <- DoneResult{Done: false, Err: fmt.Errorf("panicked while initializing feature flags: %v", r)}
		}
	}()

	updateCh := make(chan DoneResult)

	if pf.config.PollInterval == 0 {
		go pf.UpdateState(updateCh)

		updateResult := <-updateCh

		if initCh != nil {
			initCh <- updateResult
		}

		return
	}

	go pf.startPolling()

	initCh <- DoneResult{Done: true, Err: nil}
}

func (pf *PlainFlags) startPolling() {
	updateCh := make(chan DoneResult)

	for {
		go pf.UpdateState(updateCh)

		updateResult := <-updateCh

		if updateResult.Err != nil {
			pf.error("Error updating flag state: %v\n", updateResult.Err)
		}

		if pf.config.PollInterval > 0 {
			time.Sleep(pf.config.PollInterval)
		}
	}
}

// Requests up to date feature flag state from the PlainFlags state service.
//
// If your PlainFlags instance is configured with a positive PollInterval value, it will be called automatically.
//
// State will finish updating when the channel argument contains Done: true.
//
// Example:
//
//	updated := make(chan plainflags.DoneResult)
//
//	go featureFlags.UpdateState(updated)
//
//	u := <-updated
func (pf *PlainFlags) UpdateState(result chan DoneResult) {
	defer func() {
		if r := recover(); r != nil {
			err := fmt.Errorf("panicked while updating feature flag state: %v", r)
			pf.error("Error updating flag state: %v\n", err)

			result <- DoneResult{Done: false, Err: err}
		}
	}()

	url := fmt.Sprintf("%v/api/sdk", pf.config.ServiceUrl)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		pf.error("Error updating flag state: %v\n", err)

		result <- DoneResult{Done: false, Err: err}
		return
	}

	req.Header.Add("x-api-key", pf.config.ApiKey)

	client := &http.Client{Timeout: pf.config.Timeout}

	resp, err := client.Do(req)

	if err != nil {
		pf.error("Error updating flag state: %v\n", err)

		result <- DoneResult{Done: false, Err: err}
		return
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		result <- DoneResult{Done: false, Err: err}
		return
	}

	if err := json.Unmarshal(body, &pf.flagStates); err != nil {
		pf.error("Error updating flag state: %v\n", err)

		result <- DoneResult{Done: false, Err: err}
		return
	}

	pf.info("Plain Flags state has updated")

	if result != nil {
		result <- DoneResult{Done: true, Err: nil}
	}
}

func (pf *PlainFlags) info(msg string, args ...any) {
	if pf.infoFunction != nil {
		pf.infoFunction(msg, args...)
	}
}

func (pf *PlainFlags) error(msg string, args ...any) {
	if pf.errorFunction != nil {
		pf.errorFunction(msg, args...)
	}
}

// Creates a PlainFlags instance
//
// config: PlainFlagsConfig - configure your PlainFlags instance
//
// infoFunction: func(string, ...any) - pass nil to mute logs, or a logger info function such as log.Printf
//
// errorFunction: func(string, ...any) - pass nil to mute logged errors, or a logger error function such as log.Printf
//
// Example:
//
//	 featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
//		ServiceUrl:   os.Getenv("SERVICE_URL"),
//		Timeout:      time.Second * 20,
//		ApiKey:       os.Getenv("APIKEY"),
//		PollInterval: 0,		// 0 means no polling, call UpdateState() manually when you choose
//	}, log.Printf, log.Printf)
func NewPlainFlags(
	config PlainFlagsConfig,
	infoFunction func(string, ...any),
	errorFunction func(string, ...any),
) PlainFlags {
	return PlainFlags{
		flagStates:    make(map[string]FlagState),
		config:        config,
		infoFunction:  infoFunction,
		errorFunction: errorFunction,
	}
}
