import { SocketStateUpdateConfig } from "./update-policy"
import Updates from "./updates";
import SocketClient from "../utils/socket-client";
import { sleep } from "../utils/sleep";

export default class SocketUpdates extends Updates {
    private client?: SocketClient

    async init(config: SocketStateUpdateConfig) {
        try {
            this.client = new SocketClient(
                config.serviceUrl,
                (...args) => this.log(...args),
                (...args) => this.error(...args),
                (data: any) => { this.setFlagStates(data) }
            )

            for (let i = 0; i < 10; i++) {
                if (this.client.connected()) {
                    break
                }
                await sleep(1000)
                if (!this.client.connected()) {
                    this.log("Waiting for connection...")
                }
            }
            if (!this.client.connected()) {
                this.error("Connection takes longer than 10s...")
            }
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
