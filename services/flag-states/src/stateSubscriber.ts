import ReconnectingWebSocket from 'reconnecting-websocket'
import WS from "ws"
import { StateBroadcaster } from './stateBroadcaster'

export class StateSubscriber {
    static async init() {
        const ws = new ReconnectingWebSocket(
            process.env.MANAGEMENT_WS || `ws://localhost:8080`, [], { WebSocket: WS }
        )

        ws.addEventListener("message", (data) => {
            console.log(`ws message received`)

            /**
             * Requires a pause to read updated state from DB
             */
            setTimeout(() => {
                StateBroadcaster.broadcastState()
            }, 100)
        })
    }
}
