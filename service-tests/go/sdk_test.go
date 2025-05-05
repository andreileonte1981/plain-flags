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
			ServiceUrl: os.Getenv("SERVICE_URL"),
			Timeout:    time.Second * 20,
			ApiKey:     os.Getenv("APIKEY"),
		})

		time.Sleep(time.Millisecond * 1200)

		featureFlags.Init()

		assert.True(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be on in SDK cache")
	})

	t.Run("Turning on a flag will show it as on in the SDK after a manual state update", func(t *testing.T) {
		t.Parallel()

		client := NewClient()

		token := userToken(client)

		flagName := saltUniqued("tgo-o")

		createResp, statusCodeCreate, err := client.post("/api/flags", map[string]any{"name": flagName}, token)

		assert.Nil(t, err)
		assert.Equal(t, 201, statusCodeCreate)
		id := fmt.Sprintf("%v", createResp["id"])

		featureFlags := plainflags.NewPlainFlags(plainflags.PlainFlagsConfig{
			ServiceUrl: os.Getenv("SERVICE_URL"),
			Timeout:    time.Second * 20,
			ApiKey:     os.Getenv("APIKEY"),
		})

		time.Sleep(time.Millisecond * 1200)

		featureFlags.Init()

		assert.False(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be off in SDK cache before update")

		_, statusCodeTurnOn, err := client.post("/api/flags/turnon", map[string]any{"id": id}, token)

		assert.Nil(t, err)
		assert.Equal(t, 200, statusCodeTurnOn)

		time.Sleep(time.Millisecond * 1200)

		go featureFlags.UpdateState()

		time.Sleep(time.Millisecond * 200)

		assert.True(t, featureFlags.IsOn(flagName, false, nil), "Expected flag to be on in SDK cache after update")
	})
}
