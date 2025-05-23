module github.com/andreileonte1981/plain-flags/tests

go 1.24.2

require (
	github.com/google/uuid v1.6.0
	github.com/joho/godotenv v1.5.1
	github.com/stretchr/testify v1.10.0
)

require (
	github.com/andreileonte1981/plain-flags/sdk/go/plainflags v0.0.0-00010101000000-000000000000 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)

replace github.com/andreileonte1981/plain-flags/sdk/go/plainflags => ../../../sdk/go
