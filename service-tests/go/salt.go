package main

import (
	"fmt"

	"github.com/google/uuid"
)

func saltUniqued(s string) string {
	randomString := uuid.NewString()

	uniqued := fmt.Sprintf("%v%v", s, randomString)

	return uniqued
}
