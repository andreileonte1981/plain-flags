//go:build !test
// +build !test

package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

type Client struct {
	baseUrl string
	apiKey  string
}

func (client Client) post(url string, payload any, token string) (map[string]any, int, error) {
	body, err := json.Marshal(&payload)

	if err != nil {
		fmt.Println("Error making JSON body from payload:", err)
		return nil, -1, err
	}

	req, err := http.NewRequest("POST", client.baseUrl+url, bytes.NewBuffer(body))

	if err != nil {
		fmt.Println("Error creating POST request:", err)
		return nil, -1, err
	}

	req.Header.Set("Content-Type", "application/json; charset=UTF-8")

	if token != "" {
		req.Header.Add("Authorization", "Bearer "+token)
	}

	httpClient := &http.Client{Timeout: time.Second * 20}

	resp, err := httpClient.Do(req)

	if err != nil {
		fmt.Println("Error sending request:", err)
		return nil, -1, err
	}

	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)

	if err != nil {
		fmt.Println("Error reading response body:", err)
		return nil, -1, err
	}

	data := make(map[string]any)

	if err := json.Unmarshal(respBody, &data); err != nil {
		fmt.Println("Error unmarshalling response body JSON:", err)
		return nil, -1, err
	}

	return data, resp.StatusCode, nil
}

func NewClient() Client {
	return Client{
		baseUrl: "http://127.0.0.1:5000",
		apiKey:  "orpefei0-9834ytu120fcvnjt23-09484urtfmj",
	}
}
