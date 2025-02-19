import WebSocket from 'ws'

export class StateSubscriber {
    static async init() {
        const ws = new WebSocket('ws://localhost:8080', {   // TODO configure url and port
            perMessageDeflate: false
        });

        ws.on("message", function message(data) {
            console.log(`ws message received:`)
            console.debug(data)
        })

    }
}
