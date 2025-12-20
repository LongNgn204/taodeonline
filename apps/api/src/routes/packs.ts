import { Hono } from 'hono';
import { generateId, isoNow } from '@exam-matrix/shared';
import type { Env } from '../types.js';

const packs = new Hono<{ Bindings: Env }>();

// GET /packs
packs.get('/', async (c) => {
    const user = c.get('user');
    // Allow public or own packs
    const result = await c.env.DB.prepare(
        'SELECT * FROM policy_packs WHERE is_public = 1 OR owner_id = ?'
    ).bind(user?.id || '').all();

    return c.json({ packs: result.results || [] });
});

// POST /packs
packs.post('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({})) as any;
    const { name, mode, scope, is_public } = body;

    const id = generateId('pack');
    await c.env.DB.prepare(
        'INSERT INTO policy_packs (id, name, mode, scope, owner_id, is_public, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, name, mode, scope || null, user.id, is_public ? 1 : 0, isoNow()).run();

    return c.json({ success: true, packId: id });
});

// GET /packs/:id/resolve
packs.get('/:id/resolve', async (c) => {
    const packId = c.req.param('id');

    // 1. Get pack items (policies) mapped by precedence
    const items = await c.env.DB.prepare(
        `SELECT p.*, ppi.precedence, ppi.override_strategy 
         FROM policy_packs pp
         JOIN policy_pack_items ppi ON pp.id = ppi.pack_id
         JOIN policies p ON ppi.policy_id = p.id
         WHERE pp.id = ?
         ORDER BY ppi.precedence ASC`
    ).bind(packId).all();

    if (!items.results || items.results.length === 0) {
        return c.json({ rules: {} });
    }

    // 2. Simplistic Merge Logic (Override by precedence)
    let mergedRules: any = {};
    const evidenceMap: any = {};

    for (const item of items.results) {
        const rules = JSON.parse(item.rules_json as string || '{}');
        const evidence = JSON.parse(item.evidence_json as string || '{}');

        // Deep merge or shallow merge depending on strategy
        // Here we just do shallow merge for strict overrides
        mergedRules = { ...mergedRules, ...rules };

        // Accumulate evidence
        Object.assign(evidenceMap, evidence);
    }

    return c.json({
        resolved_rules: mergedRules,
        evidence_map: evidenceMap,
        source_policies: items.results.map((i: any) => i.id)
    });
});

export { packs as packRoutes };
