import ReconnectingWebSocket, { CloseEvent, ErrorEvent } from 'reconnecting-websocket'
import WS from "ws"
import { SocketStateUpdateConfig } from "./update-policy"
import Updates from "./updates";
import { sleep } from "../sleep";

export default class SocketUpdates extends Updates {
    private ws?: ReconnectingWebSocket

    async init(config: SocketStateUpdateConfig) {
        this.ws = new ReconnectingWebSocket(
            config.serviceUrl, [], {
            WebSocket: WS,
            debug: false,
            connectionTimeout: 50000
        })

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
            const flagStates = JSON.parse(event.data)
            this.log(flagStates)

            this.setFlagStates(flagStates)
        })

        this.ws.addEventListener("open", () => { this.log("Connected to feature state service") })

        this.ws.addEventListener("close", (event: CloseEvent) => {
            this.log("Connection closed: ", event.reason)
        })

        this.ws.addEventListener("error", (event: ErrorEvent) => {
            this.error("Error communicating to feature state service: ", event.message)
        })
    }

    stopUpdates() {
        try {
            this.ws?.close()
        }
        catch (error) {
            this.error("Error closing the ws connection", error)
        }
    }
}