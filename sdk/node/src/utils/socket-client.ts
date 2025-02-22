import WebSocket from "ws"
import { sleep } from "./sleep"

export default class SocketClient {
    private ws?: WebSocket

    private lastPongTime = 0
    private trying = true

    // TODO: make these params
    private readonly PING_FREQ = 1500
    private readonly WORRY_TIME = 5000

    constructor(
        private url: string,
        private log: (...args: any) => void,
        private error: (...args: any) => void,
        private onData: (data: any) => void
    ) {
        this.connect()
    }

    private connect() {
        this.ws = new WebSocket(this.url, {})

        this.ws.on("error", this.error)

        this.ws.on("message", (data: any) => {
            const decoded = data.toString()

            this.onData(JSON.parse(decoded))
        })

        this.waitConnection()
    }

    private async waitConnection() {
        let attempt = 0
        while (this.ws?.readyState !== WebSocket.OPEN) {
            this.log(`Waiting to connect. Attempt ${++attempt}`)
            await sleep(1000)
        }
        this.log("Connected")
        this.startPings()
    }

    private async startPings() {
        this.trying = true
        this.lastPongTime = Date.now()
        this.ws?.on("pong", () => { this.lastPongTime = Date.now() })

        while (this.trying) {
            this.ws?.ping()

            await sleep(this.PING_FREQ)

            if (Date.now() - this.lastPongTime > this.WORRY_TIME) {
                this.trying = false

                this.error(`Connection unresponsive for more than ${this.WORRY_TIME}`)

                try {
                    this.ws?.close()
                }
                catch (error) {
                    this.error(`Error closing existing connection`)
                    this.ws?.terminate()
                }

                this.connect()

                return
            }
        }
    }

    disconnect() {
        try {
            this.trying = false;
            this.ws?.close()
        }
        catch (error) {
            this.error("Error closing the connection.", error)
            this.ws?.terminate()
        }
    }
}
