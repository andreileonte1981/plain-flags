import WebSocket from "ws"
import { sleep } from "./sleep"

export default class SocketClient {
    private ws?: WebSocket

    private lastPongTime = 0
    private pinging = true
    private trying = false

    // TODO: make these params
    private readonly PING_FREQ = 1500
    private readonly WORRY_TIME = 5000

    constructor(
        private url: string,
        private apiKey: string,
        private log: (...args: any) => void,
        private error: (...args: any) => void,
        private onData: (data: any) => void
    ) {
        this.connect()
    }

    connected() { return this.ws?.readyState === WebSocket.OPEN }

    private connect() {
        this.ws = new WebSocket(this.url, { headers: { "x-api-key": this.apiKey } })

        this.ws.on("error", this.error)

        this.ws.on("message", (data: any) => {
            const decoded = data.toString()
            const message = JSON.parse(decoded)

            if (message.fs) {
                this.log(`Updated flag state: ${JSON.stringify(message.fs, undefined, 2)}`)
                this.onData(message.fs)
            }
            else if (message.error) {
                this.error(`error`, message.error)
            }
        })

        this.waitConnection()
    }

    private async waitConnection() {
        let attempt = 0
        this.trying = true
        while (this.ws?.readyState === WebSocket.CONNECTING && this.trying) {
            this.log(`Waiting to connect. Attempt ${++attempt}`)
            await sleep(1000)
        }

        if (this.ws?.readyState === WebSocket.OPEN) {
            this.log("Connected")
            this.startPings()
            return
        }

        if (this.ws?.readyState === WebSocket.CLOSED || this.ws?.readyState === WebSocket.CLOSING) {
            this.error("Connection closed")
            this.connect()
        }
    }

    private async startPings() {
        this.pinging = true
        this.lastPongTime = Date.now()
        this.ws?.on("pong", () => {
            // console.log("pong")
            this.lastPongTime = Date.now()
        })

        while (this.pinging) {
            this.ws?.ping()
            // console.log("ping")

            await sleep(this.PING_FREQ)

            if (Date.now() - this.lastPongTime > this.WORRY_TIME) {
                this.pinging = false

                this.error(`Connection unresponsive for more than ${this.WORRY_TIME} ms`)

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
            this.pinging = false
            this.trying = false
            this.log("closing")
            this.ws?.close()
        }
        catch (error) {
            this.error("Error closing the connection.", error)
            this.ws?.terminate()
        }
    }
}
