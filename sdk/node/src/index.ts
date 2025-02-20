import { Client } from "./client";
import Constrainer from "./constrainer";
import { FlagState } from "./flag-state";
import { ManualStateUpdateConfig, PollStateUpdateConfig, SocketStateUpdateConfig, StateUpdateConfig } from "./update-policy/update-policy";
import ReconnectingWebSocket, { ErrorEvent } from 'reconnecting-websocket'
import WS from "ws"
import { sleep } from "./sleep";

export default class PlainFlags {
    private client?: Client
    private ws?: ReconnectingWebSocket

    private flagStates: { [flagName: string]: FlagState } = {}

    /**
     * @param stateUpdateConfig Configuration for getting feature flag state updates
     * 
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
     * Initializes the Plain Flags sdk
     */
    async init() {
        try {
            switch (this.stateUpdateConfig.policy) {
                case "manual": {
                    await this.initManualUpdates()
                    break
                }

                case "poll": {
                    await this.initPollingUpdates()
                    break;
                }

                case "ws": {
                    await this.initWebSocketUpdates()
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
        try {
            this.ws?.close()
        }
        catch (error) {
            this.error("Error closing the ws connection", error)
        }
    }

    async updateState() {
        try {
            if (!this.client) { return }

            this.flagStates = (await this.client.get(`/api/sdk`)).data

            this.log(`Feature flags state updated from service`)
            this.log(this.flagStates)
        }
        catch (error) {
            this.error("Error updating state", error)
        }
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

    private async initManualUpdates() {
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
    }

    private async initPollingUpdates() {
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
    }

    private async initWebSocketUpdates() {
        const config = this.stateUpdateConfig as SocketStateUpdateConfig
        this.ws = new ReconnectingWebSocket(
            config.serviceUrl, [], {
            WebSocket: WS,
            debug: false,
            connectionTimeout: 50000
        }
        )

        for (let i = 0; i < 100; i++) {
            if (this.ws.readyState !== ReconnectingWebSocket.OPEN) {
                await sleep(100)
            }
        }

        if (this.ws.readyState !== ReconnectingWebSocket.OPEN) {
            this.error("Taking very long to connect to the feature state service, will keep trying.")
        }

        this.ws.addEventListener("message", (event) => {
            this.log(`Updated feature states received:`)
            this.flagStates = JSON.parse(event.data)
            this.log(this.flagStates)
        })

        this.ws.addEventListener("open", () => { this.log("Connected to feature state service") })

        this.ws.addEventListener("error", (event: ErrorEvent) => {
            this.error("Error communicating to feature state service", event.message)
        })
    }
}