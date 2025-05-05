package plainflags

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type FlagState struct {
	IsOn        bool `json:"isOn"`
	Constraints []struct {
		Key    string   `json:"key"`
		Values []string `json:"values"`
	} `json:"constraints"`
}

type PlainFlagsConfig struct {
	// Where your instance of PlainFlags state service can be reached
	ServiceUrl string
	Timeout    time.Duration
	ApiKey     string
}

type PlainFlags struct {
	flagStates map[string]FlagState
	config     PlainFlagsConfig
}

func (pf *PlainFlags) IsOn(flagName string, defaultValue bool, context *map[string]string) bool {
	flagState, ok := pf.flagStates[flagName]

	if !ok {
		fmt.Printf("Flag %v not in local cache, using default\n", flagName)

		return defaultValue
	}

	return isTurnedOnInContext(flagState, context)
}

func (pf *PlainFlags) Init() {
	pf.UpdateState()
}

func (pf *PlainFlags) UpdateState() {
	url := fmt.Sprintf("%v/api/sdk", pf.config.ServiceUrl)

	req, err := http.NewRequest("GET", url, nil)

	if err != nil {
		fmt.Println("Error creating request:", err)
		return
	}

	req.Header.Add("x-api-key", pf.config.ApiKey)

	client := &http.Client{Timeout: pf.config.Timeout}

	resp, err := client.Do(req)

	if err != nil {
		fmt.Println("Error sending request:", err)
		return
	}

	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)

	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}

	if err := json.Unmarshal(body, &pf.flagStates); err != nil {
		fmt.Println("Error unmarshalling response body JSON:", err)
		return
	}

	fmt.Println("Plain Flags state updated")
}

func NewPlainFlags(config PlainFlagsConfig) PlainFlags {
	return PlainFlags{
		flagStates: make(map[string]FlagState),
		config:     config,
	}
}
