// Chú thích: Curriculum outcomes routes - tra cứu CTGDPT 2018

import { Hono } from 'hono';
import type { Env } from '../types.js';
import type { CurriculumOutcome } from '@exam-matrix/shared';

const curriculumOutcomes = new Hono<{ Bindings: Env }>();

// GET /curriculum-outcomes?subject=...&grade=...&topics=...
curriculumOutcomes.get('/', async (c) => {
    const subject = c.req.query('subject');
    const gradeRaw = c.req.query('grade');
    const topicsRaw = c.req.query('topics');

    if (!subject || !gradeRaw) {
        return c.json({ error: 'validation_error', message: 'subject và grade là bắt buộc' }, 400);
    }

    const grade = Number(gradeRaw);
    if (!Number.isInteger(grade)) {
        return c.json({ error: 'validation_error', message: 'grade phải là số nguyên' }, 400);
    }

    const topics = topicsRaw
        ? topicsRaw
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [];

    let query =
        'SELECT id, subject, grade, topic, outcome, unit, created_at as createdAt FROM curriculum_outcomes WHERE subject = ? AND grade = ?';
    const params: (string | number)[] = [subject, grade];

    if (topics.length > 0) {
        const placeholders = topics.map(() => '?').join(', ');
        query += ` AND topic IN (${placeholders})`;
        params.push(...topics);
    }

    query += ' ORDER BY topic ASC, unit ASC';

    const result = await c.env.DB.prepare(query).bind(...params).all<CurriculumOutcome>();

    return c.json({ outcomes: result.results || [] });
});

export { curriculumOutcomes as curriculumOutcomesRoutes };
