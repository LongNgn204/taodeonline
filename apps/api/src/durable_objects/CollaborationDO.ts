

// Durable Object class for handling WebSocket connections
export class CollaborationDO {
    state: DurableObjectState;
    sessions: Map<WebSocket, any>;

    constructor(state: DurableObjectState) {
        this.state = state;
        this.sessions = new Map();
    }

    async fetch(request: Request) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        // @ts-ignore - WebSocketPair is a Cloudflare global
        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        this.handleSession(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    handleSession(webSocket: WebSocket) {
        // Accept the WebSocket connection
        webSocket.accept();
        this.sessions.set(webSocket, { joined: Date.now() });

        webSocket.addEventListener('message', async (msg) => {
            try {
                // Broadcast message to all other connected clients
                this.broadcast(msg.data, webSocket);
            } catch (err) {
                webSocket.close(1011, 'Network Error');
            }
        });

        webSocket.addEventListener('close', () => {
            this.sessions.delete(webSocket);
        });

        webSocket.addEventListener('error', () => {
            this.sessions.delete(webSocket);
        });
    }

    broadcast(message: any, sender: WebSocket) {
        for (const [client] of this.sessions) {
            if (client !== sender && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }
}

