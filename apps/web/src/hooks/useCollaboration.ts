
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './useAuth';

export interface Peer {
    socketId: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
    color: string;
}

export interface CollaborationState {
    connected: boolean;
    peers: Peer[];
    lastMessage: any | null;
}

const PEER_COLORS = [
    '#EF4444', // Red 500
    '#F59E0B', // Amber 500
    '#10B981', // Emerald 500
    '#3B82F6', // Blue 500
    '#8B5CF6', // Violet 500
    '#EC4899', // Pink 500
];

export const useCollaboration = (examId: string) => {
    const { user } = useAuth();
    const [connected, setConnected] = useState(false);
    const [peers, setPeers] = useState<Peer[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        if (!examId || !user) return;

        // Protocol: ws:// or wss:// depending on environment
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        // Dev: localhost:8787, Prod: exam-matrix-api...
        // For local dev, we might be on port 5173 talking to 8787
        // Logic to determine API host
        let apiHost = 'localhost:8787';

        // If VITE_API_URL is defined, parse it
        const envApiUrl = import.meta.env.VITE_API_URL;
        if (envApiUrl) {
            try {
                const url = new URL(envApiUrl);
                apiHost = url.host;
            } catch (e) {
                console.error('Invalid VITE_API_URL', envApiUrl);
            }
        } else if (window.location.hostname !== 'localhost') {
            // Fallback: assume API is on relative path or same domain if not localhost
            apiHost = window.location.host;
        }

        const wsUrl = `${protocol}//${apiHost}/collab/connect/${examId}`;

        console.log('[Collab] Connecting to', wsUrl);
        const ws = new WebSocket(wsUrl);
        socketRef.current = ws;

        ws.onopen = () => {
            console.log('[Collab] Connected');
            setConnected(true);

            // Identify self
            ws.send(JSON.stringify({
                type: 'JOIN',
                payload: {
                    user: {
                        id: user.id,
                        name: user.email.split('@')[0],
                        email: user.email
                    },
                    color: PEER_COLORS[Math.floor(Math.random() * PEER_COLORS.length)]
                }
            }));
        };

        ws.onmessage = (event) => {
            try {
                const msg = JSON.parse(event.data);

                if (msg.type === 'PEERS_UPDATE') {
                    setPeers(msg.payload);
                } else if (msg.type === 'MATRIX_UPDATE') {
                    setLastMessage(msg);
                } else if (msg.type === 'BROADCAST') {
                    setLastMessage(msg.payload);
                }
            } catch (e) {
                console.error('[Collab] Message parse error', e);
            }
        };

        ws.onclose = () => {
            console.log('[Collab] Disconnected');
            setConnected(false);
            setPeers([]);
        };

        ws.onerror = (err) => {
            console.error('[Collab] Error', err);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [examId, user]);

    const sendMessage = useCallback((type: string, payload: any) => {
        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            socketRef.current.send(JSON.stringify({ type, payload }));
        }
    }, []);

    return { connected, peers, lastMessage, sendMessage };
};
