// Chú thích: AI Hub API routes
// Endpoints cho khóa học, tài liệu và coach tips

import { Hono } from 'hono';
import type { Env } from '../types';

type Variables = {
    userId?: string;
    user?: { id: string; email: string } | null;
};

const aiHub = new Hono<{ Bindings: Env; Variables: Variables }>();

// Lấy danh sách khóa học với progress của user
aiHub.get('/courses', async (c) => {
    const user = c.get('user');
    const userId = user?.id;
    const db = c.env.DB;

    try {
        // Lấy tất cả khóa học active
        const coursesResult = await db
            .prepare(`
                SELECT 
                    c.id,
                    c.title,
                    c.description,
                    c.category,
                    c.difficulty,
                    c.duration_minutes,
                    c.order_index,
                    p.progress_percent as progressPercent,
                    p.completed_at as completedAt
                FROM ai_hub_courses c
                LEFT JOIN ai_hub_progress p ON c.id = p.course_id AND p.user_id = ?
                WHERE c.is_active = 1
                ORDER BY c.order_index ASC
            `)
            .bind(userId || '')
            .all();

        return c.json({ courses: coursesResult.results || [] });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return c.json({ courses: [] });
    }
});

// Lấy chi tiết khóa học
aiHub.get('/courses/:id', async (c) => {
    const courseId = c.req.param('id');
    const user = c.get('user');
    const userId = user?.id;
    const db = c.env.DB;

    try {
        const course = await db
            .prepare(`
                SELECT 
                    c.*,
                    p.progress_percent as progressPercent,
                    p.current_section as currentSection,
                    p.completed_at as completedAt
                FROM ai_hub_courses c
                LEFT JOIN ai_hub_progress p ON c.id = p.course_id AND p.user_id = ?
                WHERE c.id = ?
            `)
            .bind(userId || '', courseId)
            .first();

        if (!course) {
            return c.json({ error: 'Course not found' }, 404);
        }

        return c.json({ course });
    } catch (error) {
        console.error('Error fetching course:', error);
        return c.json({ error: 'Failed to fetch course' }, 500);
    }
});

// Cập nhật progress khóa học
aiHub.post('/courses/:id/progress', async (c) => {
    const courseId = c.req.param('id');
    const user = c.get('user');
    const userId = user?.id;
    const db = c.env.DB;

    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const body = await c.req.json<{
            currentSection?: number;
            progressPercent?: number;
            completed?: boolean;
        }>();

        const now = new Date().toISOString();
        const completedAt = body.completed ? now : null;

        // Upsert progress
        await db
            .prepare(`
                INSERT INTO ai_hub_progress (id, user_id, course_id, current_section, progress_percent, completed_at, last_accessed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(user_id, course_id) DO UPDATE SET
                    current_section = COALESCE(?, current_section),
                    progress_percent = COALESCE(?, progress_percent),
                    completed_at = COALESCE(?, completed_at),
                    last_accessed_at = ?
            `)
            .bind(
                `progress_${userId}_${courseId}`,
                userId,
                courseId,
                body.currentSection || 0,
                body.progressPercent || 0,
                completedAt,
                now,
                body.currentSection,
                body.progressPercent,
                completedAt,
                now
            )
            .run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Error updating progress:', error);
        return c.json({ error: 'Failed to update progress' }, 500);
    }
});

// Lấy danh sách tài liệu
aiHub.get('/resources', async (c) => {
    const category = c.req.query('category');
    const db = c.env.DB;

    try {
        let query = 'SELECT * FROM ai_hub_resources';
        const params: string[] = [];

        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }

        query += ' ORDER BY created_at DESC';

        const result = await db.prepare(query).bind(...params).all();

        return c.json({ resources: result.results || [] });
    } catch (error) {
        console.error('Error fetching resources:', error);
        return c.json({ resources: [] });
    }
});

// Lấy coach tips theo context
aiHub.get('/coach-tips', async (c) => {
    const context = c.req.query('context');
    const db = c.env.DB;

    if (!context) {
        return c.json({ tips: [] });
    }

    try {
        const result = await db
            .prepare(`
                SELECT id, tip_title, tip_content, tip_type
                FROM ai_hub_coach_tips
                WHERE trigger_context = ? AND is_active = 1
                ORDER BY priority ASC
            `)
            .bind(context)
            .all();

        return c.json({ tips: result.results || [] });
    } catch (error) {
        console.error('Error fetching coach tips:', error);
        return c.json({ tips: [] });
    }
});

// Lấy user progress overview
aiHub.get('/my-progress', async (c) => {
    const user = c.get('user');
    const userId = user?.id;
    const db = c.env.DB;

    if (!userId) {
        return c.json({ error: 'Unauthorized' }, 401);
    }

    try {
        const result = await db
            .prepare(`
                SELECT 
                    COUNT(DISTINCT p.course_id) as coursesStarted,
                    COUNT(DISTINCT CASE WHEN p.completed_at IS NOT NULL THEN p.course_id END) as coursesCompleted,
                    AVG(COALESCE(p.progress_percent, 0)) as averageProgress
                FROM ai_hub_progress p
                WHERE p.user_id = ?
            `)
            .bind(userId)
            .first();

        return c.json({
            progress: {
                coursesStarted: result?.coursesStarted || 0,
                coursesCompleted: result?.coursesCompleted || 0,
                averageProgress: Math.round(Number(result?.averageProgress) || 0),
            },
        });
    } catch (error) {
        console.error('Error fetching progress:', error);
        return c.json({ error: 'Failed to fetch progress' }, 500);
    }
});

export default aiHub;
