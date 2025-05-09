import { Client } from "../utils/client"
import { ManualStateUpdateConfig } from "./update-policy"
import Updates from "./updates";

export default class ManualUpdates extends Updates {
    private client?: Client;

    async init(config: ManualStateUpdateConfig) {
        this.client = new Client(
            config.apiKey,
            config.serviceUrl,
            config.timeout
        )

        this.log(
            `Feature flags HTTP client initialized.`
        )

        const flagStates = (await this.client.get(`/api/sdk`)).data

        this.log(`Feature flags state updated from service`)
        this.log(flagStates)

        this.setFlagStates(flagStates)
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