// Chú thích: Type definitions cho Cloudflare bindings và Hono context

export interface Env {
    // D1 Database
    DB: D1Database;

    // R2 Bucket
    R2: R2Bucket;

    // KV Namespace
    KV: KVNamespace;

    // Environment variables
    ENVIRONMENT: string;
    JWT_SECRET?: string;
}

// Extended Hono context với user info
declare module 'hono' {
    interface ContextVariableMap {
        user: {
            id: string;
            email: string;
        } | null;
    }
}
