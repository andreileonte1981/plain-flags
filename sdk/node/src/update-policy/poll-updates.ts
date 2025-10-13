import { Client } from "../utils/client"
import { PollStateUpdateConfig } from "./update-policy"
import Updates from "./updates";

export default class PollUpdates extends Updates {
    private client?: Client
    private polling = false
    private pollHandle: any
    private logUpdatesOnPoll: boolean = false

    async init(config: PollStateUpdateConfig) {
        this.client = new Client(
            config.apiKey,
            config.serviceUrl,
            config.timeout
        )

        this.logUpdatesOnPoll = config.logStateUpdatesOnPoll

        this.log(`Feature flags HTTP client initialized.` +
            ` Will poll for updated feature state every ${config.pollInterval} milliseconds`
        )

        const flagStates = (await this.client.get(`/api/sdk`)).data

        this.log(`Feature flags state updated from service`)
        this.log(flagStates)

        this.setFlagStates(flagStates)

        this.startPolling(config.pollInterval, this.client)
    }

    private async startPolling(pollInterval: number, client: Client) {
        this.polling = true

        try {
            const flagStates = (await client.get(`/api/sdk`)).data

            if (this.logUpdatesOnPoll) {
                this.log(`Feature flags state updated from service`)
                this.log(flagStates)
            }

            this.setFlagStates(flagStates)
        }
        catch (error) {
            this.error(
                `Had a problem polling for flag states. Next poll in ${pollInterval / 1000} seconds`,
                error
            )
        }
        finally {
            if (!this.polling) {
                if (this.pollHandle) {
                    clearTimeout(this.pollHandle)
                }
                return
            }

            this.pollHandle = setTimeout(() => {
                this.startPolling(pollInterval, client)
            }, pollInterval).unref()
        }
    }

    stopUpdates(): void {
        this.polling = false
    }

    async updateState() {
        try {
            if (!this.client) { return }

            const flagStates = (await this.client.get(`/api/sdk`)).data

            this.log(`Feature flags state updated from service`)
            this.log(flagStates)

            return flagStates
        }
        catch (error) {
            this.error("Error updating state", error)
        }
    }
}