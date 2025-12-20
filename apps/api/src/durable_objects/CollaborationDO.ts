
import { DurableObject } from "cloudflare:workers";

interface SessionState {
    matrix: any;
    peers: Peer[];
}

interface Peer {
    socketId: string; // We'll just use random UUID or something if we could, but DO doesn't track socket ID natively easy, so we rely on obj ref
    user: {
        id: string;
        name: string;
        email: string;
    };
    color: string;
    joinedAt: number;
}

export class CollaborationDO extends DurableObject {
    sessions: Map<WebSocket, Peer>;
    state: DurableObjectState;
    matrix: any | null;

    constructor(state: DurableObjectState, env: Env) {
        super(state, env);
        this.state = state;
        this.sessions = new Map();
        this.matrix = null;

        // Restore state if needed
        this.state.blockConcurrencyWhile(async () => {
            const storedMatrix = await this.state.storage.get("matrix");
            if (storedMatrix) {
                this.matrix = storedMatrix;
            }
        });
    }

    async fetch(request: Request) {
        const upgradeHeader = request.headers.get('Upgrade');
        if (!upgradeHeader || upgradeHeader !== 'websocket') {
            return new Response('Expected Upgrade: websocket', { status: 426 });
        }

        const webSocketPair = new WebSocketPair();
        const [client, server] = Object.values(webSocketPair);

        this.handleSession(server);

        return new Response(null, {
            status: 101,
            webSocket: client,
        });
    }

    handleSession(webSocket: WebSocket) {
        webSocket.accept();

        // Send current state immediately (matrix)
        if (this.matrix) {
            webSocket.send(JSON.stringify({
                type: 'MATRIX_UPDATE',
                payload: this.matrix
            }));
        }

        webSocket.addEventListener('message', async (msg) => {
            try {
                const data = JSON.parse(msg.data as string);

                switch (data.type) {
                    case 'JOIN':
                        // Register peer
                        const peer: Peer = {
                            socketId: Math.random().toString(36).substring(7), // Temp ID
                            user: data.payload.user,
                            color: data.payload.color,
                            joinedAt: Date.now()
                        };
                        this.sessions.set(webSocket, peer);
                        this.broadcastPeers();
                        break;

                    case 'MATRIX_UPDATE':
                        // Update state
                        this.matrix = data.payload;
                        // Persist
                        this.state.storage.put("matrix", this.matrix);
                        // Broadcast to others
                        this.broadcast(JSON.stringify({
                            type: 'MATRIX_UPDATE',
                            payload: this.matrix
                        }), webSocket);
                        break;

                    default:
                        // Generic broadcast
                        this.broadcast(msg.data as string, webSocket);
                }

            } catch (err) {
                console.error('DO Error', err);
            }
        });

        webSocket.addEventListener('close', () => {
            this.sessions.delete(webSocket);
            this.broadcastPeers();
        });

        webSocket.addEventListener('error', () => {
            this.sessions.delete(webSocket);
            this.broadcastPeers();
        });
    }

    broadcast(message: string, sender?: WebSocket) {
        for (const [client] of this.sessions) {
            if (client !== sender && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        }
    }

    broadcastPeers() {
        const peersList = Array.from(this.sessions.values());
        const msg = JSON.stringify({
            type: 'PEERS_UPDATE',
            payload: peersList
        });

        for (const [client] of this.sessions) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(msg);
            }
        }
    }
}
