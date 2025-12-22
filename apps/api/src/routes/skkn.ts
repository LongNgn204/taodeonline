// Chú thích: L3 - SKKN (Sáng kiến kinh nghiệm) API routes
// Quản lý sáng kiến kinh nghiệm cho giáo viên

import { Hono } from 'hono';
import type { Env } from '../types.js';
import { nanoid } from 'nanoid';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface SkknSection {
    title: string;
    content: string;
}

interface SkknRequest {
    title: string;
    category: string;
    subject?: string;
    grade?: number;
    abstract: string;
    sections: SkknSection[];
    evidence?: string[];
}

// ===== API Endpoints =====

/**
 * GET /skkn
 * List SKKN của user
 */
app.get('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const status = c.req.query('status');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    let whereClause = 'WHERE user_id = ?';
    const params: (string | number)[] = [user.id];

    if (status) {
        whereClause += ' AND status = ?';
        params.push(status);
    }

    const result = await c.env.DB.prepare(`
        SELECT id, title, category, subject, grade, abstract, status, created_at, updated_at
        FROM skkn
        ${whereClause}
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?
    `)
        .bind(...params, limit, offset)
        .all();

    return c.json({
        items: result.results || [],
        pagination: { limit, offset },
    });
});

/**
 * GET /skkn/:id
 */
app.get('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    const result = await c.env.DB.prepare(`
        SELECT * FROM skkn WHERE id = ? AND user_id = ?
    `)
        .bind(id, user.id)
        .first();

    if (!result) {
        return c.json({ error: 'not_found' }, 404);
    }

    return c.json({
        skkn: {
            ...result,
            content: JSON.parse(result.content_json as string || '{}'),
            evidence: JSON.parse(result.evidence_json as string || '[]'),
        },
    });
});

/**
 * POST /skkn
 * Create new SKKN
 */
app.post('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<SkknRequest>();
    const id = nanoid(12);

    await c.env.DB.prepare(`
        INSERT INTO skkn (
            id, user_id, title, category, subject, grade, abstract,
            content_json, evidence_json, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', datetime('now'), datetime('now'))
    `)
        .bind(
            id,
            user.id,
            body.title,
            body.category,
            body.subject || null,
            body.grade || null,
            body.abstract,
            JSON.stringify({ sections: body.sections }),
            JSON.stringify(body.evidence || [])
        )
        .run();

    return c.json({ id, message: 'SKKN created' }, 201);
});

/**
 * PUT /skkn/:id
 * Update SKKN
 */
app.put('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');
    const body = await c.req.json<Partial<SkknRequest> & { status?: string }>();

    // Build dynamic update query
    const updates: string[] = ['updated_at = datetime(\'now\')'];
    const params: (string | number | null)[] = [];

    if (body.title) {
        updates.push('title = ?');
        params.push(body.title);
    }
    if (body.category) {
        updates.push('category = ?');
        params.push(body.category);
    }
    if (body.abstract) {
        updates.push('abstract = ?');
        params.push(body.abstract);
    }
    if (body.sections) {
        updates.push('content_json = ?');
        params.push(JSON.stringify({ sections: body.sections }));
    }
    if (body.evidence) {
        updates.push('evidence_json = ?');
        params.push(JSON.stringify(body.evidence));
    }
    if (body.status) {
        updates.push('status = ?');
        params.push(body.status);
    }

    params.push(id, user.id);

    await c.env.DB.prepare(`
        UPDATE skkn SET ${updates.join(', ')} WHERE id = ? AND user_id = ?
    `)
        .bind(...params)
        .run();

    return c.json({ message: 'Updated' });
});

/**
 * DELETE /skkn/:id
 */
app.delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    await c.env.DB.prepare(`
        DELETE FROM skkn WHERE id = ? AND user_id = ?
    `)
        .bind(id, user.id)
        .run();

    return c.json({ message: 'Deleted' });
});

/**
 * POST /skkn/:id/submit
 * Submit SKKN for review
 */
app.post('/:id/submit', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    await c.env.DB.prepare(`
        UPDATE skkn SET status = 'submitted', updated_at = datetime('now')
        WHERE id = ? AND user_id = ? AND status = 'draft'
    `)
        .bind(id, user.id)
        .run();

    return c.json({ message: 'Submitted for review' });
});

export { app as skknRoutes };
export default app;
