package plainflags

import "time"

type PlainFlagsConfig struct {
	// Where your instance of PlainFlags state service can be reached
	ServiceUrl string

	Timeout time.Duration
	ApiKey  string

	// Set to 0 for manual updates only
	PollInterval time.Duration
}
