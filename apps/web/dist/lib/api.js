// Chú thích: API client wrapper
const API_BASE = '/api';
class ApiClient {
    baseUrl;
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }
    async request(path, options = {}) {
        const url = `${this.baseUrl}${path}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };
        return fetch(url, {
            ...options,
            headers,
            credentials: 'include', // Gửi cookies
        });
    }
    async get(path) {
        return this.request(path, { method: 'GET' });
    }
    async post(path, body) {
        return this.request(path, {
            method: 'POST',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async put(path, body) {
        return this.request(path, {
            method: 'PUT',
            body: body ? JSON.stringify(body) : undefined,
        });
    }
    async delete(path) {
        return this.request(path, { method: 'DELETE' });
    }
    // Upload file với progress (không dùng JSON)
    async uploadFile(path, file) {
        const url = `${this.baseUrl}${path}`;
        return fetch(url, {
            method: 'PUT',
            body: file,
            credentials: 'include',
        });
    }
}
export const api = new ApiClient(API_BASE);
//# sourceMappingURL=api.js.map