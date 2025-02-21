import WebSocket, { WebSocketServer } from 'ws';

/**
 * This broadcasts to all flag-states services that flag state has changed.
 */
export class StateBroadcaster {
    private static server: WebSocket.Server;

    static async init() {
        this.server = new WebSocketServer({ port: +(process.env.WS_SERVER_PORT || 8080) });

        this.server.on('connection', (ws) => {
            console.log('New client connected')

            ws.on('close', () => {
                console.log('Client disconnected')
            });
        });
    }

    static async broadcastState() {
        this.server.clients.forEach(
            function each(client) {
                if (client.readyState === WebSocket.OPEN) {
                    client.send("stateUpdate", { binary: false })
                }
            })
    }
}
