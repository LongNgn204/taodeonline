import { Hono } from 'hono';
import { generateId, isoNow } from '@exam-matrix/shared';
import type { Env } from '../types.js';
import { ValidatorRegistry } from '@exam-matrix/core';

const examsV2 = new Hono<{ Bindings: Env }>();

// POST /exams-v2/generate-spec
// Step 1: Generate Spec from Blueprint + Pack
examsV2.post('/generate-spec', async (c) => {
    const body = await c.req.json().catch(() => ({})) as any;
    const { mode, subject, blueprintId, packId } = body;

    // 1. Load Blueprint
    const bp = await c.env.DB.prepare('SELECT blueprint_json FROM exam_blueprints WHERE id = ?').bind(blueprintId).first();
    if (!bp) return c.json({ error: 'blueprint_not_found' }, 404);

    // 2. Load Pack Rules (Resolved) -- simulation
    console.log('Loading pack rules for:', packId);
    // call internal logic or just query

    // 3. Stub Spec Generation
    const spec = {
        mode,
        subject,
        slots: JSON.parse(bp.blueprint_json as string).sections.map((s: any) => ({
            id: s.id,
            section: s.title,
            topic: "TBD", // To be filled by AI
            question_type: s.question_type
        }))
    };

    return c.json({ spec });
});

// POST /exams-v2/validate
examsV2.post('/validate', async (c) => {
    const body = await c.req.json().catch(() => ({})) as any;
    const { examId, examContent, specMode } = body; // specMode from exam.mode

    // Load validator
    try {
        const validator = ValidatorRegistry.get(specMode || 'GRADUATION_2025');
        const result = await validator.validateContent(examContent); // Needs partial/full content check

        // Save report
        await c.env.DB.prepare(
            'INSERT INTO compliance_reports (id, exam_id, validator_version, result, issues_json, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).bind(generateId('rep'), examId, 'v1', result.isValid ? 'pass' : 'fail', JSON.stringify(result.errors), isoNow()).run();

        return c.json(result);
    } catch (e: any) {
        return c.json({ error: e.message }, 400);
    }
});

export { examsV2 as examRoutesV2 };
