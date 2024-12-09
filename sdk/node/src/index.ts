import { Client } from "./client";
import Constrainer from "./constrainer";
import { FlagState } from "./flag-state";

export default class PlainFlags {
    private interval?: NodeJS.Timeout;
    private client?: Client;
    private flagStates: { [flagName: string]: FlagState } = {};

    /**
     * @param serviceUrl The url for the feature flags REST API
     * @param logCallback Custom method of your choice to log regular messages. Default console.log. Set to null to mute.
     * @param errorCallback Custom method of your choice to log errors. Default console.error. Set to null to mute.
     */
    constructor(
        private readonly serviceUrl: string,

        private logCallback: ((...args: any) => void) | null =
            (...args) => {
                console.log(args)
            },

        private errorCallback: ((...args: any) => void) | null =
            (...args) => {
                console.error(args)
            },
    ) { }

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
        catch(error) {
            this.error(`Flag name ${flagName} state query failed`, error)

            return defaultValue;
        }
    }

    async init(apiKey: string, pollInterval = 30000) {
        try {
            this.client = new Client(apiKey, this.serviceUrl)

            this.log(`Feature flags HTTP client initialized`)

            // TODO: version the library and the service, send library version here to ensure compatibility is at least managed.
            this.flagStates = (await this.client.get(`/api/sdk`)).data

            this.log(`Feature flags state updated from service`)
            this.log(this.flagStates)

            this.startPolling(pollInterval, this.client);
        }
        catch (error) {
            this.error(`Feature flags initialization error`, error)
        }
    }

    stopUpdates() {
        if (this.interval) {
            clearInterval(this.interval)
        }
    }

    private startPolling(pollInterval: number, client: Client) {
        this.interval = setInterval(async () => {
            try {
                this.flagStates = (await client.get(`/api/sdk`)).data
            }
            catch (error) {
                this.error(
                    `Had a problem polling for flag states. Next poll in ${pollInterval * 1000} seconds`,
                    error
                )
            }
        }, pollInterval)
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