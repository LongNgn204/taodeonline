import { Hono } from 'hono';
import { generateId, isoNow } from '@exam-matrix/shared';
import type { Env } from '../types.js';
import { BLUEPRINT_MATH_2025, BLUEPRINT_ENGLISH_2025 } from '@exam-matrix/core';

const blueprints = new Hono<{ Bindings: Env }>();

// GET /blueprints
blueprints.get('/', async (c) => {
    const mode = c.req.query('mode');
    const subject = c.req.query('subject');

    let query = 'SELECT * FROM exam_blueprints WHERE 1=1';
    const params: string[] = [];

    if (mode) {
        query += ' AND mode = ?';
        params.push(mode);
    }
    if (subject) {
        query += ' AND subject = ?';
        params.push(subject);
    }

    const result = await c.env.DB.prepare(query).bind(...params).all();
    return c.json({ blueprints: result.results || [] });
});

// POST /blueprints/init-defaults (Admin/Dev helper)
blueprints.post('/init-defaults', async (c) => {
    const defaults = [BLUEPRINT_MATH_2025, BLUEPRINT_ENGLISH_2025];

    for (const bp of defaults) {
        const exists = await c.env.DB.prepare('SELECT id FROM exam_blueprints WHERE id = ?').bind(bp.id).first();
        if (!exists) {
            await c.env.DB.prepare(
                'INSERT INTO exam_blueprints (id, mode, subject, blueprint_json, created_at) VALUES (?, ?, ?, ?, ?)'
            ).bind(bp.id, bp.mode, bp.subject, JSON.stringify(bp), isoNow()).run();
        }
    }

    return c.json({ success: true, count: defaults.length });
});

export { blueprints as blueprintRoutes };
