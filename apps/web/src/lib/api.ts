// Chú thích: API client wrapper
// Detect môi trường: dev dùng proxy Vite, production gọi thẳng Worker

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV
    ? '/api' // Dev: Vite proxy sẽ rewrite và forward đến localhost:8787
    : 'https://exam-matrix-api.stu725114073.workers.dev'); // Production: Worker API

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async request(path: string, options: RequestInit = {}): Promise<Response> {
        const url = `${this.baseUrl}${path}`;

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        return fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Gửi cookies
        });
    }

    async get(path: string): Promise<Response> {
        return this.request(path, { method: 'GET' });
    }

    async post(path: string, body?: unknown): Promise<Response> {
        return this.request(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async put(path: string, body?: unknown): Promise<Response> {
        return this.request(path, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }

    async delete(path: string): Promise<Response> {
        return this.request(path, { method: 'DELETE' });
    }

    // Upload file với progress (không dùng JSON)
    async uploadFile(path: string, file: ArrayBuffer): Promise<Response> {
        const url = `${this.baseUrl}${path}`;
        return fetch(url, {
            method: 'PUT',
            body: file,
            credentials: 'include',
        });
    }
}

export const api = new ApiClient(API_BASE);
