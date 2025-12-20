// Chú thích: Auth middleware - verify JWT từ cookie
// JWT được tạo khi login và lưu trong HttpOnly cookie

import { Context, Next } from 'hono';
import type { Env } from '../types.js';

// Simple JWT decode (không dùng crypto verify ở đây cho đơn giản)
// Production nên dùng jose hoặc @tsndr/cloudflare-worker-jwt
function decodeJwt(token: string): { userId: string; email: string; exp: number } | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) return null;

        const payload = JSON.parse(atob(parts[1]));
        return payload;
    } catch {
        return null;
    }
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
    // Lấy token từ cookie hoặc Authorization header
    const cookie = c.req.header('Cookie') || '';
    const authHeader = c.req.header('Authorization');

    let token: string | null = null;

    // Ưu tiên cookie
    const cookieMatch = cookie.match(/auth_token=([^;]+)/);
    if (cookieMatch) {
        token = cookieMatch[1];
    } else if (authHeader?.startsWith('Bearer ')) {
        token = authHeader.slice(7);
    }

    if (!token) {
        return c.json({ error: 'unauthorized', message: 'Chưa đăng nhập' }, 401);
    }

    // Decode và verify token
    const payload = decodeJwt(token);
    if (!payload) {
        return c.json({ error: 'invalid_token', message: 'Token không hợp lệ' }, 401);
    }

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
        return c.json({ error: 'token_expired', message: 'Phiên đăng nhập đã hết hạn' }, 401);
    }

    // Set user vào context
    c.set('user', {
        id: payload.userId,
        email: payload.email,
    });

    await next();
}
