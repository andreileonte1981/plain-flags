import { Client } from "../client"
import { PollStateUpdateConfig } from "./update-policy"
import Updates from "./updates";

export default class PollUpdates extends Updates {
    private client?: Client;

    async init(config: PollStateUpdateConfig) {
        this.client = new Client(
            config.apiKey,
            config.serviceUrl)

        this.log(`Feature flags HTTP client initialized.` +
            ` Will poll for updated feature state every ${config.pollInterval} milliseconds`
        )

        const flagStates = (await this.client.get(`/api/sdk`)).data

        this.log(`Feature flags state updated from service`)
        this.log(flagStates)

        this.setFlagStates(flagStates)

        this.startPolling(config.pollInterval, this.client)
    }

    private startPolling(pollInterval: number, client: Client) {
        setInterval(async () => {
            try {
                const flagStates = (await client.get(`/api/sdk`)).data

                this.log(`Feature flags state updated from service`)
                this.log(flagStates)

                this.setFlagStates(flagStates)
            }
            catch (error) {
                this.error(
                    `Had a problem polling for flag states. Next poll in ${pollInterval * 1000} seconds`,
                    error
                )
            }
        }, pollInterval).unref()
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