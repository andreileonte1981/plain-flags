import { FlagState } from "../flag-state";
import { StateUpdateConfig } from "./update-policy";

export type FlagStates = { [flagName: string]: FlagState }

export default class Updates {
    constructor(
        protected log: (...args: any) => void,
        protected error: (...args: any) => void,
        protected setFlagStates: (flagStates: FlagStates) => void
    ) { }

    async init(config: StateUpdateConfig) { }

    stopUpdates() { }

    updateState() { }
}
