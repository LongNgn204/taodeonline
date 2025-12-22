// Chú thích: L2 - Lesson Plan API routes
// Kế hoạch bài dạy AI-powered với policy context

import { Hono } from 'hono';
import type { Env } from '../types.js';
import { nanoid } from 'nanoid';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface LessonPlanSection {
    phase: string;
    duration: number;
    activities: string[];
    materials?: string[];
    notes?: string;
}

interface LessonPlan {
    id: string;
    title: string;
    subject: string;
    grade: number;
    topic: string;
    duration: number;
    objectives: string[];
    sections: LessonPlanSection[];
    assessment: {
        type: string;
        criteria: string[];
    };
    sources?: string[];
    createdAt: string;
}

// ===== API Endpoints =====

/**
 * GET /lessonplans
 * List lesson plans của user
 */
app.get('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const limit = parseInt(c.req.query('limit') || '20');
    const offset = parseInt(c.req.query('offset') || '0');

    const result = await c.env.DB.prepare(`
        SELECT id, title, subject, grade, topic, duration, created_at
        FROM lesson_plans
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
    `)
        .bind(user.id, limit, offset)
        .all();

    return c.json({
        lessonPlans: result.results || [],
        pagination: { limit, offset },
    });
});

/**
 * GET /lessonplans/:id
 * Get single lesson plan
 */
app.get('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    const result = await c.env.DB.prepare(`
        SELECT * FROM lesson_plans WHERE id = ? AND user_id = ?
    `)
        .bind(id, user.id)
        .first();

    if (!result) {
        return c.json({ error: 'not_found' }, 404);
    }

    return c.json({
        lessonPlan: {
            ...result,
            sections: JSON.parse(result.sections_json as string || '[]'),
            objectives: JSON.parse(result.objectives_json as string || '[]'),
            assessment: JSON.parse(result.assessment_json as string || '{}'),
        },
    });
});

/**
 * POST /lessonplans
 * Save a new lesson plan
 */
app.post('/', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<LessonPlan>();
    const id = nanoid(12);

    await c.env.DB.prepare(`
        INSERT INTO lesson_plans (
            id, user_id, title, subject, grade, topic, duration,
            objectives_json, sections_json, assessment_json, sources_json,
            created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `)
        .bind(
            id,
            user.id,
            body.title,
            body.subject,
            body.grade,
            body.topic,
            body.duration,
            JSON.stringify(body.objectives || []),
            JSON.stringify(body.sections || []),
            JSON.stringify(body.assessment || {}),
            JSON.stringify(body.sources || [])
        )
        .run();

    return c.json({ id, message: 'Lesson plan saved' }, 201);
});

/**
 * DELETE /lessonplans/:id
 */
app.delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const id = c.req.param('id');

    await c.env.DB.prepare(`
        DELETE FROM lesson_plans WHERE id = ? AND user_id = ?
    `)
        .bind(id, user.id)
        .run();

    return c.json({ message: 'Deleted' });
});

export { app as lessonPlanRoutes };
export default app;
