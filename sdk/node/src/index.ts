import { Client } from "./client";
import Constrainer from "./constrainer";
import { FlagState } from "./flag-state";
import { ManualStateUpdateConfig, PollStateUpdateConfig, SocketStateUpdateConfig, StateUpdateConfig } from "./update-policy";
import ReconnectingWebSocket from 'reconnecting-websocket'
import WS from "ws"

export default class PlainFlags {
    private client?: Client
    private ws?: ReconnectingWebSocket

    private flagStates: { [flagName: string]: FlagState } = {}

    /**
     * @param stateUpdateConfig Configuration for getting feature flag state updates
     * @param logCallback Custom method of your choice to log regular messages. Default console.log. Set to null to mute.
     * @param errorCallback Custom method of your choice to log errors. Default console.error. Set to null to mute.
     */
    constructor(
        private readonly stateUpdateConfig:
            StateUpdateConfig,

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
        catch (error) {
            this.error(`Flag name ${flagName} state query failed`, error)

            return defaultValue
        }
    }

    /**
     * Initializes the Plain Flags sdk
     * 
     * @param apiKey - must be the same as configured on the flag state backend service
     * @param pollInterval - if positive, the app will poll the service for updated flag state every interval, in milliseconds
     */
    async init() {
        try {
            switch (this.stateUpdateConfig.policy) {
                case "manual": {
                    const config = this.stateUpdateConfig as ManualStateUpdateConfig
                    this.client = new Client(
                        config.apiKey,
                        config.serviceUrl)

                    this.log(
                        `Feature flags HTTP client initialized.` +
                        ` Call 'updateState' when you want a recent state of your features`
                    )

                    this.flagStates = (await this.client.get(`/api/sdk`)).data

                    this.log(`Feature flags state updated from service`)
                    this.log(this.flagStates)
                    break
                }

                case "poll": {
                    const config = this.stateUpdateConfig as PollStateUpdateConfig
                    this.client = new Client(
                        config.apiKey,
                        config.serviceUrl)

                    this.log(`Feature flags HTTP client initialized.` +
                        ` Will poll for updated feature state every ${config.pollInterval} milliseconds`
                    )

                    this.flagStates = (await this.client.get(`/api/sdk`)).data

                    this.log(`Feature flags state updated from service`)
                    this.log(this.flagStates)

                    this.startPolling(config.pollInterval, this.client)
                    break;
                }

                case "ws": {
                    const config = this.stateUpdateConfig as SocketStateUpdateConfig
                    this.ws = new ReconnectingWebSocket(
                        config.serviceUrl, [], { WebSocket: WS, debug: false }
                    )

                    this.ws.addEventListener("message", (event) => {
                        this.log(`Updated feature states received:`)
                        this.flagStates = JSON.parse(event.data)
                        this.log(this.flagStates)
                    })
                    break
                }
            }
        }
        catch (error) {
            this.error(`Feature flags initialization error`, error)
        }
    }

    /**
     * Stops the updates.
     * 
     * Call this only if you initialized with the "ws" update policy.
     */
    stopUpdates() {
        this.ws?.close()
    }

    async updateState() {
        if (!this.client) { return }

        this.flagStates = (await this.client.get(`/api/sdk`)).data

        this.log(`Feature flags state updated from service`)
        this.log(this.flagStates)
    }

    private startPolling(pollInterval: number, client: Client) {
        setInterval(async () => {
            try {
                this.flagStates = (await client.get(`/api/sdk`)).data

                this.log(`Feature flags state updated from service`)
                this.log(this.flagStates)
            }
            catch (error) {
                this.error(
                    `Had a problem polling for flag states. Next poll in ${pollInterval * 1000} seconds`,
                    error
                )
            }
        }, pollInterval).unref()
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