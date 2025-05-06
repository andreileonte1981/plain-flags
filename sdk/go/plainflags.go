package plainflags

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type PlainFlags struct {
	flagStates map[string]FlagState
	config     PlainFlagsConfig
}

type DoneResult struct {
	Done bool
	Err  error
}

func (pf *PlainFlags) IsOn(flagName string, defaultValue bool, context *map[string]string) bool {
	flagState, ok := pf.flagStates[flagName]

	if !ok {
		fmt.Printf("Flag %v not in local cache, using default\n", flagName)

		return defaultValue
	}

	return isTurnedOnInContext(flagState, context)
}

func (pf *PlainFlags) Init(initCh chan DoneResult) {
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
			fmt.Printf("Error updating flag state: %v\n", updateResult.Err)
		}

		if pf.config.PollInterval > 0 {
			time.Sleep(pf.config.PollInterval)
		}
	}
}

func (pf *PlainFlags) UpdateState(result chan DoneResult) {
	defer func() {
		if r := recover(); r != nil {
			result <- DoneResult{Done: false, Err: fmt.Errorf("panicked while updating feature flag state: %v", r)}
		}
	}()

	url := fmt.Sprintf("%v/api/sdk", pf.config.ServiceUrl)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		result <- DoneResult{Done: false, Err: err}
		return
	}

	req.Header.Add("x-api-key", pf.config.ApiKey)

	client := &http.Client{Timeout: pf.config.Timeout}

	resp, err := client.Do(req)

	if err != nil {
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
		result <- DoneResult{Done: false, Err: err}
		return
	}

	fmt.Println("Plain Flags state updated")

	if result != nil {
		result <- DoneResult{Done: true, Err: nil}
	}
}

func NewPlainFlags(config PlainFlagsConfig) PlainFlags {
	return PlainFlags{
		flagStates: make(map[string]FlagState),
		config:     config,
	}
}
