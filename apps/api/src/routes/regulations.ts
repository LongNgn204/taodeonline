// Chú thích: CRUD API cho Regulations
// Admin endpoints để quản lý văn bản pháp lý

import { Hono } from 'hono';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface Regulation {
    id: string;
    code: string;
    title: string;
    type: 'TT' | 'CV' | 'HD' | 'QD' | 'NQ';
    issuer: string;
    scope?: string;
    mode?: string;
    issued_date?: string;
    effective_from?: string;
    effective_to?: string;
    summary?: string;
    source_url?: string;
    rules_json?: string;
    status: 'active' | 'deprecated' | 'draft';
    priority: number;
    created_at: string;
    updated_at: string;
}

// ===== API Endpoints =====

/**
 * GET /regulations - List all regulations
 */
app.get('/', async (c) => {
    const mode = c.req.query('mode');
    const status = c.req.query('status') || 'active';

    let query = 'SELECT * FROM regulations WHERE 1=1';
    const params: string[] = [];

    if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
    }

    if (mode) {
        query += ' AND mode = ?';
        params.push(mode);
    }

    query += ' ORDER BY priority ASC, effective_from DESC';

    const result = await c.env.DB.prepare(query)
        .bind(...params)
        .all<Regulation>();

    return c.json({
        regulations: result.results || [],
        total: result.results?.length || 0,
    });
});

/**
 * GET /regulations/:id - Get regulation detail
 */
app.get('/:id', async (c) => {
    const id = c.req.param('id');

    const regulation = await c.env.DB.prepare(
        'SELECT * FROM regulations WHERE id = ?'
    )
        .bind(id)
        .first<Regulation>();

    if (!regulation) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Parse rules_json nếu có
    let rules = null;
    if (regulation.rules_json) {
        try {
            rules = JSON.parse(regulation.rules_json);
        } catch {
            // Ignore parse error
        }
    }

    return c.json({
        regulation: {
            ...regulation,
            rules,
        },
    });
});

/**
 * POST /regulations - Create new regulation (Admin only)
 */
app.post('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    // TODO: Check admin role

    const body = await c.req.json<Partial<Regulation>>();

    if (!body.code || !body.title || !body.type) {
        return c.json({ error: 'missing_required_fields' }, 400);
    }

    const id = body.id || body.code.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
        INSERT INTO regulations (
            id, code, title, type, issuer, scope, mode,
            issued_date, effective_from, effective_to,
            summary, source_url, rules_json, status, priority,
            created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
        id,
        body.code,
        body.title,
        body.type,
        body.issuer || 'MOE',
        body.scope || null,
        body.mode || null,
        body.issued_date || null,
        body.effective_from || null,
        body.effective_to || null,
        body.summary || null,
        body.source_url || null,
        body.rules_json || null,
        body.status || 'draft',
        body.priority || 10,
        now,
        now,
        user.id
    ).run();

    console.info('[regulations] created', { id, code: body.code });

    return c.json({ id, success: true }, 201);
});

/**
 * PUT /regulations/:id - Update regulation (Admin only)
 */
app.put('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json<Partial<Regulation>>();
    const now = new Date().toISOString();

    // Build update query dynamically
    const updates: string[] = ['updated_at = ?'];
    const params: (string | number | null)[] = [now];

    const fields = [
        'code', 'title', 'type', 'issuer', 'scope', 'mode',
        'issued_date', 'effective_from', 'effective_to',
        'summary', 'source_url', 'rules_json', 'status', 'priority'
    ];

    for (const field of fields) {
        if (field in body) {
            updates.push(`${field} = ?`);
            params.push((body as Record<string, unknown>)[field] as string | number | null);
        }
    }

    params.push(id);

    await c.env.DB.prepare(`
        UPDATE regulations SET ${updates.join(', ')} WHERE id = ?
    `).bind(...params).run();

    console.info('[regulations] updated', { id });

    return c.json({ id, success: true });
});

/**
 * DELETE /regulations/:id - Delete regulation (Admin only)
 */
app.delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    // Soft delete - set status to deprecated
    await c.env.DB.prepare(
        "UPDATE regulations SET status = 'deprecated', updated_at = ? WHERE id = ?"
    ).bind(new Date().toISOString(), id).run();

    console.info('[regulations] soft deleted', { id });

    return c.json({ success: true });
});

export { app as regulationsRoutes };
export default app;
