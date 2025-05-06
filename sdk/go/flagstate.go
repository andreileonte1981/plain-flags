package plainflags

type FlagState struct {
	IsOn        bool `json:"isOn"`
	Constraints []struct {
		Key    string   `json:"key"`
		Values []string `json:"values"`
	} `json:"constraints"`
}
