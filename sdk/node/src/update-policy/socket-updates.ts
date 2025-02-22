import { SocketStateUpdateConfig } from "./update-policy"
import Updates from "./updates";
import SocketClient from "../utils/socket-client";

export default class SocketUpdates extends Updates {
    private client?: SocketClient

    async init(config: SocketStateUpdateConfig) {
        try {
            this.client = new SocketClient(
                config.serviceUrl,
                this.log,
                this.error,
                (data: any) => { this.setFlagStates(data) }
            )
        }
        catch (error) {
            this.error(error)
        }
    }

    stopUpdates() {
        try {
            this.client?.disconnect()
        }
        catch (error) {
            this.error("Error closing the WebSocket connection", error)
        }
    }
}
