

// Types for our collaboration state
export type UserPresence = {
    id: string;
    name: string;
    color: string;
    cursor: { x: number; y: number } | null;
};

// Mock service to simulate WebSocket connection for now
// In real prod, this would connect to wss://api.example.com/collab/connect/:examId
export class CollaborationService {
    listeners: Set<(users: UserPresence[]) => void> = new Set();
    mockUsers: UserPresence[] = [];
    interval: any;

    constructor() {
        this.mockUsers = [
            { id: 'u1', name: 'Thầy Hùng', color: '#EF4444', cursor: { x: 100, y: 100 } },
            { id: 'u2', name: 'Cô Lan', color: '#3B82F6', cursor: { x: 200, y: 300 } },
        ];
    }

    connect(examId: string) {
        console.log(`Connecting to collaboration room for exam ${examId}`);
        // Simulate real-time updates
        this.interval = setInterval(() => {
            this.mockUsers = this.mockUsers.map(u => ({
                ...u,
                cursor: {
                    x: (u.cursor?.x || 0) + (Math.random() - 0.5) * 50,
                    y: (u.cursor?.y || 0) + (Math.random() - 0.5) * 50,
                }
            }));
            this.notify();
        }, 1000);
    }

    disconnect() {
        clearInterval(this.interval);
    }

    subscribe(callback: (users: UserPresence[]) => void) {
        this.listeners.add(callback);
        // Initial data
        callback(this.mockUsers);
        return () => this.listeners.delete(callback);
    }

    notify() {
        this.listeners.forEach(cb => cb(this.mockUsers));
    }
}

export const collabService = new CollaborationService();
