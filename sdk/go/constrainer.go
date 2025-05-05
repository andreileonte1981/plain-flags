package plainflags

func isTurnedOnInContext(flag FlagState, context *map[string]string) bool {
	if !flag.IsOn {
		return false
	}

	if context == nil {
		return true
	}

	if len(flag.Constraints) == 0 {
		return true
	}

	// All context keys need to be unconstrained by the flag's constraints
	for key, value := range *context {
		for _, constraint := range flag.Constraints {
			if key == constraint.Key {
				var match = false

				// Any matching value from constraints to the context value is fine
				for _, v := range constraint.Values {
					if v == value {
						match = true
						break
					}
				}

				if !match {
					return false
				}
			}
		}
	}

	return true
}
