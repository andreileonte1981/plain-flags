import WebSocket, { WebSocketServer } from 'ws';
import { latestFlagState } from './logic/flag-logic/flag-state';

/**
 * This broadcasts the latest state of flags to all connected clients.
 */
export class StateBroadcaster {
    private static server: WebSocket.Server;

    static async init() {
        this.server = new WebSocketServer({ port: +(process.env.WS_SERVER_PORT || 8081) });

        this.server.on('connection', (ws) => {
            console.log('New client connected')

            ws.on('close', () => {
                console.log('Client disconnected')
            });
        });
    }

    static async broadcastState() {
        console.log(`broadcasting state`)
        this.server.clients.forEach(
            async function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    const state = await latestFlagState()
                    client.send(JSON.stringify(state), { binary: false })
                }
            })
    }
}
