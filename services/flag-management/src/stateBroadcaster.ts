import WebSocket, { WebSocketServer } from 'ws';

export class StateBroadcaster {
    private static server: WebSocket.Server;

    static async init() {
        this.server = new WebSocketServer({ port: 8080 });  // TODO configure port in .env and compose file

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
                    client.send("stateUpdate", { binary: false })  // TODO send actual complete flag state
                }
            })
    }
}
