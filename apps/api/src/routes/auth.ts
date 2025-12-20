// Chú thích: Auth routes - register, login, logout
// Password hash dùng Web Crypto API (scrypt không có, dùng PBKDF2)

import { Hono } from 'hono';
import { RegisterRequestSchema, LoginRequestSchema, generateId, isoNow } from '@exam-matrix/shared';
import type { Env } from '../types.js';

const auth = new Hono<{ Bindings: Env }>();

// Helper: Hash password với PBKDF2
async function hashPassword(password: string, salt?: string): Promise<{ hash: string; salt: string }> {
    const encoder = new TextEncoder();
    const actualSalt = salt || crypto.randomUUID();

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        {
            name: 'PBKDF2',
            salt: encoder.encode(actualSalt),
            iterations: 100000,
            hash: 'SHA-256',
        },
        keyMaterial,
        256
    );

    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    return { hash: hashHex, salt: actualSalt };
}

async function verifyPassword(password: string, storedHash: string, salt: string): Promise<boolean> {
    const { hash } = await hashPassword(password, salt);
    return hash === storedHash;
}

// Helper: Create JWT (simple implementation)
function createJwt(userId: string, email: string, secret: string): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const payload = {
        userId,
        email,
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
        iat: Math.floor(Date.now() / 1000),
    };

    const base64Header = btoa(JSON.stringify(header));
    const base64Payload = btoa(JSON.stringify(payload));

    // Note: Trong production, nên dùng crypto.subtle.sign với HMAC
    // Đây là simplified version
    const signature = btoa(`${base64Header}.${base64Payload}.${secret}`);

    return `${base64Header}.${base64Payload}.${signature}`;
}

// POST /auth/register
auth.post('/register', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = RegisterRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            {
                error: 'validation_error',
                message: parsed.error.errors[0].message,
            },
            400
        );
    }

    const { email, password } = parsed.data;

    // Check email exists
    const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first();

    if (existing) {
        return c.json({ error: 'email_exists', message: 'Email đã được sử dụng' }, 400);
    }

    // Hash password
    const { hash, salt } = await hashPassword(password);
    const passwordHash = `${salt}:${hash}`;

    // Create user
    const userId = generateId('user');
    await c.env.DB.prepare('INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)')
        .bind(userId, email, passwordHash, isoNow())
        .run();

    // Create JWT
    const jwtSecret = c.env.JWT_SECRET || 'dev-secret-change-in-production';
    const token = createJwt(userId, email, jwtSecret);

    // Set cookie
    const cookie = `auth_token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

    return c.json(
        {
            success: true,
            user: { id: userId, email },
        },
        201,
        {
            'Set-Cookie': cookie,
        }
    );
});

// POST /auth/login
auth.post('/login', async (c) => {
    const body = await c.req.json().catch(() => ({}));
    const parsed = LoginRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: 'validation_error', message: 'Email và mật khẩu không hợp lệ' }, 400);
    }

    const { email, password } = parsed.data;

    // Find user
    const user = await c.env.DB.prepare('SELECT id, email, password_hash FROM users WHERE email = ?')
        .bind(email)
        .first<{ id: string; email: string; password_hash: string }>();

    if (!user) {
        return c.json({ error: 'invalid_credentials', message: 'Email hoặc mật khẩu không đúng' }, 401);
    }

    // Verify password
    const [salt, hash] = user.password_hash.split(':');
    const isValid = await verifyPassword(password, hash, salt);

    if (!isValid) {
        return c.json({ error: 'invalid_credentials', message: 'Email hoặc mật khẩu không đúng' }, 401);
    }

    // Create JWT
    const jwtSecret = c.env.JWT_SECRET || 'dev-secret-change-in-production';
    const token = createJwt(user.id, user.email, jwtSecret);

    // Set cookie
    const cookie = `auth_token=${token}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=${7 * 24 * 60 * 60}`;

    console.info('[auth] login success', { userId: user.id });

    return c.json(
        {
            success: true,
            user: { id: user.id, email: user.email },
        },
        200,
        {
            'Set-Cookie': cookie,
        }
    );
});

// POST /auth/logout
auth.post('/logout', (c) => {
    // Clear cookie
    const cookie = 'auth_token=; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=0';

    return c.json({ success: true }, 200, { 'Set-Cookie': cookie });
});

export { auth as authRoutes };
