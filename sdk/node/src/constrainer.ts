import { FlagState } from "./flag-state";

export default class Constrainer {
    static isTurnedOn(
        flag: FlagState,
        context?: { [key: string]: string }
    ): boolean {
        if(!flag.isOn) {
            return false
        }

        if(!context){
            return true
        }

        if(flag.constraints.length === 0) {
            return true
        }

        // All context keys need to be unconstrained by the flag's constraints
        for(const key in context) {
            const value = context[key]

            // Any matching value from constraints to the context value is fine
            for(const constraint of flag.constraints) {
                if(key === constraint.key) {
                    let match = false
                    for(const v of constraint.values) {
                        if(v === value) {
                            match = true
                            break
                        }
                    }
                    if(!match) {
                        return false
                    }
                }
            }
        }

        return true
    }
}
