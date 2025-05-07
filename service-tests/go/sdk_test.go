package main

import (
	"fmt"
	"os"
	"testing"
	"time"

	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"

	"github.com/andreileonte1981/plain-flags-go-sdk/plainflags"
)

func TestSdk(t *testing.T) {
	err := godotenv.Load()

	if err != nil {
		fmt.Printf("Error loading .env file: %s\n", err)
		t.FailNow()
	}

	t.Run("Turning on a flag will show it as on in the SDK after initialization", func(t *testing.T) {
		t.Parallel()

		client := NewClient()

		token := userToken(client)

		flagName := saltUniqued("tgo-o")

		createResp, statusCodeCreate, err := client.post("/api/flags", map[string]any{"name": flagName}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCodeCreate)
		id := fmt.Sprintf("%v", createResp["id"])

		_, statusCodeTurnOn, err := client.post("/api/flags/turnon", map[string]any{"id": id}, token)

		assert.Nil(t, err)
		assert.Equal(t, 200, statusCodeTurnOn)

		featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
			ServiceUrl:   os.Getenv("SERVICE_URL"),
			Timeout:      time.Second * 20,
			ApiKey:       os.Getenv("APIKEY"),
			PollInterval: 0,
		}, nil, nil)

		time.Sleep(time.Millisecond * 1200)

		initialized := make(chan plainflags.DoneResult, 1)

		go featureFlags.Init(initialized)

		r := <-initialized
		assert.Nil(t, r.Err)

		assert.True(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be on in SDK cache")
	})

	t.Run("Turning on a flag will show it as on in the SDK after a manual state update", func(t *testing.T) {
		t.Parallel()

		client := NewClient()

		token := userToken(client)

		flagName := saltUniqued("tgo-m")

		createResp, statusCodeCreate, err := client.post("/api/flags", map[string]any{"name": flagName}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCodeCreate)
		id := fmt.Sprintf("%v", createResp["id"])

		featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
			ServiceUrl:   os.Getenv("SERVICE_URL"),
			Timeout:      time.Second * 20,
			ApiKey:       os.Getenv("APIKEY"),
			PollInterval: 0,
		}, nil, nil)

		time.Sleep(time.Millisecond * 1200)

		initialized := make(chan plainflags.DoneResult, 1)
		go featureFlags.Init(initialized)
		r := <-initialized
		assert.Nil(t, r.Err)

		assert.False(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be off in SDK cache before update")

		_, statusCodeTurnOn, err := client.post("/api/flags/turnon", map[string]any{"id": id}, token)

		assert.Nil(t, err)
		assert.Equal(t, 200, statusCodeTurnOn)

		time.Sleep(time.Millisecond * 1200)

		updated := make(chan plainflags.DoneResult, 1)
		go featureFlags.UpdateState(updated)
		u := <-updated

		assert.Nil(t, u.Err)
		assert.True(t, u.Done)

		assert.True(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be on in SDK cache after update")
	})

	t.Run("The SDK polls for updates at the specified interval", func(t *testing.T) {
		t.Parallel()

		client := NewClient()

		token := userToken(client)

		flagName := saltUniqued("tgo-p")

		createResp, statusCodeCreate, err := client.post("/api/flags", map[string]any{"name": flagName}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCodeCreate)
		id := fmt.Sprintf("%v", createResp["id"])

		featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
			ServiceUrl:   os.Getenv("SERVICE_URL"),
			Timeout:      time.Second * 20,
			ApiKey:       os.Getenv("APIKEY"),
			PollInterval: time.Second,
		}, nil, nil)

		time.Sleep(time.Millisecond * 1200)

		initialized := make(chan plainflags.DoneResult, 1)
		go featureFlags.Init(initialized)
		r := <-initialized
		assert.Nil(t, r.Err)

		time.Sleep(time.Millisecond * 200)

		assert.False(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be off in SDK cache before update")

		_, statusCodeTurnOn, err := client.post("/api/flags/turnon", map[string]any{"id": id}, token)

		assert.Nil(t, err)
		assert.Equal(t, 200, statusCodeTurnOn)

		time.Sleep(time.Millisecond * 1200)

		assert.True(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be on in SDK cache after poll interval")

		_, statusCodeTurnOff, err := client.post("/api/flags/turnoff", map[string]any{"id": id}, token)

		assert.Nil(t, err)
		assert.Equal(t, 200, statusCodeTurnOff)

		time.Sleep(time.Millisecond * 1200)

		assert.False(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be on in SDK cache after poll interval")
	})

	t.Run("A constrained activated flag will be on only for the constrained context", func(t *testing.T) {
		t.Parallel()

		client := NewClient()

		token := userToken(client)

		flagName := saltUniqued("tgo-c")

		createResp, statusCodeCreate, err := client.post("/api/flags", map[string]any{"name": flagName}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCodeCreate)
		flagId := fmt.Sprintf("%v", createResp["id"])

		_, statusCodeTurnOn, err := client.post("/api/flags/turnon", map[string]any{"id": flagId}, token)

		assert.Nil(t, err)
		assert.Equal(t, 200, statusCodeTurnOn)

		userConstraintResp, statusCode, err := client.post("/api/constraints", map[string]any{
			"description":          saltUniqued("tgo-cu"),
			"key":                  "user",
			"commaSeparatedValues": "John, Steve",
		}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCode)
		userConstraintId := fmt.Sprintf("%v", userConstraintResp["id"])

		brandConstraintResp, statusCode, err := client.post("/api/constraints", map[string]any{
			"description":          saltUniqued("tgo-cb"),
			"key":                  "brand",
			"commaSeparatedValues": "Initech, Acme",
		}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCode)
		brandConstraintId := fmt.Sprintf("%v", brandConstraintResp["id"])

		client.post("/api/constraints/link", map[string]any{"flagId": flagId, "constraintId": userConstraintId}, token)
		client.post("/api/constraints/link", map[string]any{"flagId": flagId, "constraintId": brandConstraintId}, token)

		featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
			ServiceUrl:   os.Getenv("SERVICE_URL"),
			Timeout:      time.Second * 20,
			ApiKey:       os.Getenv("APIKEY"),
			PollInterval: 0,
		}, nil, nil)

		time.Sleep(time.Millisecond * 1200)

		initialized := make(chan plainflags.DoneResult, 1)
		go featureFlags.Init(initialized)
		r := <-initialized
		assert.Nil(t, r.Err)

		assert.True(t, featureFlags.IsOn(flagName, false, &map[string]string{
			"user": "John", "brand": "Initech",
		}), "Expected true for complete context match")

		assert.False(t, featureFlags.IsOn(flagName, false, &map[string]string{
			"user": "Dave", "brand": "Initech",
		}), "Expected false for partial context match")

		assert.False(t, featureFlags.IsOn(flagName, false, &map[string]string{
			"user": "John", "brand": "TBC",
		}), "Expected false for partial context match")

		assert.True(t, featureFlags.IsOn(flagName, false, &map[string]string{
			"region": "Elbonia",
		}), "Expected true for irrelevant context")
	})
}
