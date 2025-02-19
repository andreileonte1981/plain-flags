import ReconnectingWebSocket from 'reconnecting-websocket'
import WS from "ws"

export class StateSubscriber {
    static async init() {
        const ws = new ReconnectingWebSocket(
            process.env.MANAGEMENT_WS || `ws://localhost:8080`, [], { WebSocket: WS }
        )

        ws.addEventListener("message", function message(data) {
            console.log(`ws message received:`)
            console.debug(data)
        })
    }
}
