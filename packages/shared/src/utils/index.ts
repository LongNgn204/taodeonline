// Chú thích: Utility functions dùng chung
export * from './examForm.js';

// Generate ID ngắn gọn (dùng nanoid pattern)
export function generateId(prefix?: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let id = '';
    for (let i = 0; i < 12; i++) {
        id += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return prefix ? `${prefix}_${id}` : id;
}

// Format ngày giờ ISO
export function isoNow(): string {
    return new Date().toISOString();
}

// Ước tính số tokens từ text (rough estimate: 1 token ≈ 4 chars tiếng Việt)
export function estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
}

// Sanitize text để tránh injection
export function sanitizeText(text: string): string {
    return text.replace(/[<>]/g, '').trim();
}

// Truncate text với ellipsis
export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

// Parse JSON an toàn
export function safeJsonParse<T>(json: string, fallback: T): T {
    try {
        return JSON.parse(json) as T;
    } catch {
        return fallback;
    }
}

// Delay util cho retry logic
export function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry với exponential backoff
export async function retry<T>(
    fn: () => Promise<T>,
    options: { maxRetries?: number; delayMs?: number } = {}
): Promise<T> {
    const { maxRetries = 3, delayMs = 500 } = options;
    let lastError: Error | undefined;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await fn();
        } catch (e) {
            lastError = e instanceof Error ? e : new Error(String(e));
            if (i < maxRetries - 1) {
                await delay(delayMs * Math.pow(2, i));
            }
        }
    }

    throw lastError;
}
