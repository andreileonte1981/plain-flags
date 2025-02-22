import WebSocket, { WebSocketServer } from 'ws';
import { latestFlagState } from './logic/flag-logic/flag-state';

/**
 * This broadcasts the latest state of flags to all connected clients.
 */
export class StateBroadcaster {
    private static server: WebSocket.Server;

    static async init() {
        this.server = new WebSocketServer({ port: +(process.env.WS_SERVER_PORT || 8081) });

        this.server.on('connection', (ws: WebSocket) => {
            console.log('New client connected')

            ws.send(JSON.stringify({ ch: "Hi" }), { binary: false });

            (ws as any).pending = true

            ws.on("message", async (data) => {
                const decoded = data.toString();
                if (decoded === process.env.APIKEY) {
                    delete (ws as any).pending

                    console.log("Client authenticated")
                    const state = await latestFlagState()

                    ws.send(JSON.stringify({ fs: state }), { binary: false })
                }
                else {
                    delete (ws as any).pending

                    ws.send("Auth failed")
                    ws.close()

                    console.log(`Client authentication failed: ${ws.url}`)
                }
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
                if (!(client as any).pending) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({ fs: state }), { binary: false })
                    }
                }
            })
    }
}
