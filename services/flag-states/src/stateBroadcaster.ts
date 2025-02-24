import WebSocket, { WebSocketServer } from 'ws';
import { latestFlagState } from './logic/flag-logic/flag-state';
import { FastifyBaseLogger } from 'fastify';

/**
 * This broadcasts the latest state of flags to all connected clients.
 */
export class StateBroadcaster {
    private static server: WebSocket.Server
    private static log: FastifyBaseLogger

    static async init(log: FastifyBaseLogger) {
        this.log = log
        this.server = new WebSocketServer({ port: +(process.env.WS_SERVER_PORT || 8081) })

        this.server.on('connection', async (ws: WebSocket, req) => {
            if (req.headers["x-api-key"] !== process.env.APIKEY) {
                this.log.error(`Auth failed ${req.headers["sec-websocket-key"]}`)
                ws.send(`{"error": "auth failed"}`)
                ws.close()
            }

            ws.on('close', () => {
                this.log.info('Client disconnected')
            });

            ws.on("error", (err) => { this.log.error(err) })

            this.log.info('Client connected')
            this.log.info(`${this.server.clients.size} clients`)
            const state = await latestFlagState()

            ws.send(JSON.stringify({ fs: state }), { binary: false })
        });
    }

    static async broadcastState() {
        this.log.info(`Broadcasting state`)
        const state = await latestFlagState()
        this.server.clients.forEach(
            async (client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ fs: state }), { binary: false })
                }
            })
    }
}
