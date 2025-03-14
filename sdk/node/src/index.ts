import Constrainer from "./constrainer";
import {
    StateUpdateConfig
} from "./update-policy/update-policy";
import ManualUpdates from "./update-policy/manual-updates";
import Updates, { FlagStates } from "./update-policy/updates";
import PollUpdates from "./update-policy/poll-updates";

export default class PlainFlags {
    private updates?: Updates

    private flagStates: FlagStates = {}

    /**
     * @param stateUpdateConfig Configuration for getting feature flag state updates
     * 
     * @param logCallback Custom method of your choice to log regular messages.
     * Default console.log. Set to null to mute.
     * 
     * @param errorCallback Custom method of your choice to log errors.
     * Default is console.error. Set to null to mute.
     */
    constructor(
        private readonly stateUpdateConfig:
            StateUpdateConfig,

        private logCallback: ((...args: any) => void) | null = console.log,

        private errorCallback: ((...args: any) => void) | null = console.error,
    ) {
        switch (this.stateUpdateConfig.policy) {
            case "manual": {
                this.updates = new ManualUpdates(
                    (...args) => this.log(...args),
                    (...args) => this.error(...args),
                    (flagStates: FlagStates) => { this.flagStates = flagStates }
                )
                break
            }

            case "poll": {
                this.updates = new PollUpdates(
                    (...args) => this.log(...args),
                    (...args) => this.error(...args),
                    (flagStates: FlagStates) => { this.flagStates = flagStates }
                )
                break;
            }
        }
    }

    /**
     * @param flagName - name of your feature
     * @param defaultValue - what to return on failure to query state
     * @param context - what and who this is, as defined in the Constraints page in the dashboard
     * 
     * @example
     * if (plainFlags.isOn("MyFeature", false, { userId: getCurrentUserId() })) {
     *   ...feature code here...
     * }
     * 
     * @returns the state of the named feature for the context, or the default value
     */
    isOn(
        flagName: string,
        defaultValue: boolean = false,
        context?: { [key: string]: string }
    ): boolean {
        /**
         * Protect all public calls against crashes
         */
        try {
            if (!this.flagStates[flagName]) {
                this.error(`Flag name ${flagName} not in local cache`)
                return defaultValue
            }

            return Constrainer.isTurnedOn(
                this.flagStates[flagName],
                context
            )
        }
        catch (error) {
            this.error(`Flag name ${flagName} state query failed`, error)

            return defaultValue
        }
    }

    /**
     * Initializes the Plain Flags SDK
     */
    async init() {
        try {
            await this.updates?.init(this.stateUpdateConfig)
        }
        catch (error) {
            this.error(`Feature flags initialization error`, error)
        }
    }

    /**
     * Requests an updated state of your features.
     */
    async updateState() {
        this.flagStates = await this.updates?.updateState() || {};
    }

    private log(...args: any) {
        try {
            if (this.logCallback) {
                this.logCallback(args)
            }
        }
        catch (error) { }
    }

    private error(...args: any) {
        try {
            if (this.errorCallback) {
                this.errorCallback(args)
            }
        }
        catch (error) { }
    }
}