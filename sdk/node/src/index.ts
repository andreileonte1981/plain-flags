import { Client } from "./client/client";

export default class PlainFlags {
    private client?: Client;
    private flagStates: {[flagName: string]: boolean} = {};

    /**
     * @param serviceUrl The url for the feature flags REST API
     * @param logCallback Custom method of your choice to log regular messages. Default console.log. Set to undefined to mute.
     * @param errorCallback Custom method of your choice to log errors. Default console.error. Set to undefined to mute.
     */
    constructor(
        private readonly serviceUrl: string,

        private logCallback: ((...args: any) => void) | undefined =
            (...args) => {
                console.log(args)
            },

        private errorCallback: ((...args: any) => void) | undefined =
            (...args) => {
                console.error(args)
            },
    ) { }

    isOn(flagName: string): boolean {
        return this.flagStates[flagName] || false
    }

    async init() {
        try {
            this.client = new Client(this.serviceUrl)

            this.log(`Feature flags HTTP client initialized`)

            // TODO: version the library and the service, send library version here to ensure compatibility is at least managed.
            this.flagStates = (await this.client.get(`/api/sdk`)).data

            this.log(`Feature flags state updated from service`)
            this.log(this.flagStates)
        }
        catch (error) {
            this.error(`Feature flags initialization error`, error)
        }
    }

    private log(...args: any) {
        if (this.logCallback) {
            this.logCallback(args)
        }
    }

    private error(...args: any) {
        if (this.errorCallback) {
            this.errorCallback(args)
        }
    }
}
