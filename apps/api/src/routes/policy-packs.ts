// Chú thích: CRUD API cho Policy Packs
// Quản lý policy packs với versioning

import { Hono } from 'hono';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface PolicyPack {
    id: string;
    name: string;
    version: string;
    mode: string;
    scope?: string;
    grade_range?: string;
    subjects?: string;
    based_on_regulation_ids: string;
    resolved_rules_json: string;
    merge_conflicts_json?: string;
    policy_text?: string;
    schema_hints_json?: string;
    status: 'active' | 'deprecated' | 'draft';
    is_default: number;
    created_at: string;
    updated_at: string;
}

// ===== API Endpoints =====

/**
 * GET /policy-packs - List policy packs
 */
app.get('/', async (c) => {
    const mode = c.req.query('mode');
    const status = c.req.query('status') || 'active';

    let query = 'SELECT * FROM policy_packs WHERE 1=1';
    const params: string[] = [];

    if (status !== 'all') {
        query += ' AND status = ?';
        params.push(status);
    }

    if (mode) {
        query += ' AND mode = ?';
        params.push(mode);
    }

    query += ' ORDER BY is_default DESC, name ASC, version DESC';

    const result = await c.env.DB.prepare(query)
        .bind(...params)
        .all<PolicyPack>();

    // Parse JSON fields
    const packs = (result.results || []).map(p => ({
        ...p,
        basedOnRegulationIds: JSON.parse(p.based_on_regulation_ids || '[]'),
        resolvedRules: JSON.parse(p.resolved_rules_json || '{}'),
        mergeConflicts: p.merge_conflicts_json ? JSON.parse(p.merge_conflicts_json) : [],
        schemaHints: p.schema_hints_json ? JSON.parse(p.schema_hints_json) : null,
    }));

    return c.json({
        policyPacks: packs,
        total: packs.length,
    });
});

/**
 * GET /policy-packs/default/:mode - Get default pack for mode
 */
app.get('/default/:mode', async (c) => {
    const mode = c.req.param('mode');

    const pack = await c.env.DB.prepare(`
        SELECT * FROM policy_packs 
        WHERE mode = ? AND is_default = 1 AND status = 'active'
        ORDER BY version DESC
        LIMIT 1
    `).bind(mode).first<PolicyPack>();

    if (!pack) {
        return c.json({ error: 'no_default_pack' }, 404);
    }

    return c.json({
        policyPack: {
            ...pack,
            basedOnRegulationIds: JSON.parse(pack.based_on_regulation_ids || '[]'),
            resolvedRules: JSON.parse(pack.resolved_rules_json || '{}'),
            policyText: pack.policy_text,
        },
    });
});

/**
 * GET /policy-packs/:id - Get pack detail
 */
app.get('/:id', async (c) => {
    const id = c.req.param('id');

    const pack = await c.env.DB.prepare(
        'SELECT * FROM policy_packs WHERE id = ?'
    ).bind(id).first<PolicyPack>();

    if (!pack) {
        return c.json({ error: 'not_found' }, 404);
    }

    return c.json({
        policyPack: {
            ...pack,
            basedOnRegulationIds: JSON.parse(pack.based_on_regulation_ids || '[]'),
            resolvedRules: JSON.parse(pack.resolved_rules_json || '{}'),
            mergeConflicts: pack.merge_conflicts_json ? JSON.parse(pack.merge_conflicts_json) : [],
            schemaHints: pack.schema_hints_json ? JSON.parse(pack.schema_hints_json) : null,
        },
    });
});

/**
 * POST /policy-packs - Create new pack (Admin only)
 */
app.post('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<{
        name: string;
        version: string;
        mode: string;
        basedOnRegulationIds: string[];
        resolvedRules: Record<string, unknown>;
        policyText?: string;
        schemaHints?: unknown;
        isDefault?: boolean;
    }>();

    if (!body.name || !body.version || !body.mode || !body.basedOnRegulationIds) {
        return c.json({ error: 'missing_required_fields' }, 400);
    }

    const id = `pack-${body.mode}-${body.version}`.replace(/\./g, '-');
    const now = new Date().toISOString();

    await c.env.DB.prepare(`
        INSERT INTO policy_packs (
            id, name, version, mode, based_on_regulation_ids,
            resolved_rules_json, policy_text, schema_hints_json,
            status, is_default, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active', ?, ?, ?, ?)
    `).bind(
        id,
        body.name,
        body.version,
        body.mode,
        JSON.stringify(body.basedOnRegulationIds),
        JSON.stringify(body.resolvedRules),
        body.policyText || null,
        body.schemaHints ? JSON.stringify(body.schemaHints) : null,
        body.isDefault ? 1 : 0,
        now,
        now,
        user.id
    ).run();

    console.info('[policy-packs] created', { id, name: body.name });

    return c.json({ id, success: true }, 201);
});

/**
 * PUT /policy-packs/:id/activate - Set as default for mode
 */
app.put('/:id/activate', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    // Get pack to know its mode
    const pack = await c.env.DB.prepare(
        'SELECT mode FROM policy_packs WHERE id = ?'
    ).bind(id).first<{ mode: string }>();

    if (!pack) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Deactivate other defaults for same mode
    await c.env.DB.prepare(
        'UPDATE policy_packs SET is_default = 0 WHERE mode = ?'
    ).bind(pack.mode).run();

    // Set this pack as default
    await c.env.DB.prepare(
        'UPDATE policy_packs SET is_default = 1, updated_at = ? WHERE id = ?'
    ).bind(new Date().toISOString(), id).run();

    console.info('[policy-packs] activated as default', { id, mode: pack.mode });

    return c.json({ success: true });
});

/**
 * PUT /policy-packs/:id/deprecate - Deprecate pack
 */
app.put('/:id/deprecate', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    await c.env.DB.prepare(`
        UPDATE policy_packs 
        SET status = 'deprecated', is_default = 0, updated_at = ? 
        WHERE id = ?
    `).bind(new Date().toISOString(), id).run();

    console.info('[policy-packs] deprecated', { id });

    return c.json({ success: true });
});

export { app as policyPacksRoutes };
export default app;
