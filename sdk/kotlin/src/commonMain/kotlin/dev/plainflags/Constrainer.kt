package dev.plainflags

internal object Constrainer {
    fun isTurnedOn(flag: FlagState, context: Map<String, String>): Boolean {
        if (!flag.isOn) {
            return false
        }

        if (context.isEmpty()) {
            return true
        }

        if (flag.constraints.isEmpty()) {
            return true
        }

        for ((contextKey, contextValue) in context) {
            for (constraint in flag.constraints) {
                if (constraint.key == contextKey && contextValue !in constraint.values) {
                    return false
                }
            }
        }

        return true
    }
}
