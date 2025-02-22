import WebSocket, { WebSocketServer } from 'ws';
import { latestFlagState } from './logic/flag-logic/flag-state';

/**
 * This broadcasts the latest state of flags to all connected clients.
 */
export class StateBroadcaster {
    private static server: WebSocket.Server;

    static async init() {
        this.server = new WebSocketServer({ port: +(process.env.WS_SERVER_PORT || 8081) });

        this.server.on('connection', async (ws: WebSocket, req) => {
            if (req.headers["x-api-key"] !== process.env.APIKEY) {
                console.error(`Auth failed ${req.headers["sec-websocket-key"]}`)
                ws.send(`{"error": "auth failed"}`)
                ws.close()
            }

            ws.on("open", async () => {
                console.log('Client connected')
                const state = await latestFlagState()

                ws.send(JSON.stringify({ fs: state }), { binary: false })
            })

            ws.on('close', () => {
                console.log('Client disconnected')
            });
        });
    }

    static async broadcastState() {
        console.log(`broadcasting state`)
        const state = await latestFlagState()
        this.server.clients.forEach(
            async (client) => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ fs: state }), { binary: false })
                }
            })
    }
}
