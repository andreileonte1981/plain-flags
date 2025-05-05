package main

import "fmt"

func userToken(client Client) string {
	userEmail := saltUniqued("gouser") + "@mail.com"
	password := "pass01"

	client.post(
		"/api/users",
		map[string]any{
			"email":    userEmail,
			"password": password},
		"")

	respLogin, _, _ := client.post(
		"/api/users/login",
		map[string]any{
			"email":    userEmail,
			"password": password},
		"")

	return fmt.Sprintf("%v", respLogin["token"])
}
