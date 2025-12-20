
import { Hono } from 'hono';
import { generateId, isoNow, safeJsonParse } from '@exam-matrix/shared';
import type { Env } from '../types';

const community = new Hono<{ Bindings: Env }>();

// GET /community/matrices - List shared matrices with filters
community.get('/matrices', async (c) => {
    const user = c.get('user');
    // Allow public access or require login? Let's require login for now to prevent abuse
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const subject = c.req.query('subject');
    const grade = c.req.query('grade');
    const limit = parseInt(c.req.query('limit') || '20');

    let query = 'SELECT * FROM shared_matrices WHERE 1=1';
    const params: any[] = [];

    if (subject) {
        query += ' AND subject = ?';
        params.push(subject);
    }
    if (grade) {
        query += ' AND grade = ?';
        params.push(grade);
    }

    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(limit);

    const { results } = await c.env.DB.prepare(query).bind(...params).all();

    return c.json({ matrices: results });
});

// POST /community/matrices - Share a matrix
community.post('/matrices', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json();
    const { matrixId, title, description, subject, grade } = body;

    if (!matrixId) return c.json({ error: 'missing_matrix_id' }, 400);

    // Get original matrix
    const original = await c.env.DB.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?')
        .bind(matrixId, user.id)
        .first<{ matrix_json: string }>();

    if (!original) return c.json({ error: 'not_found' }, 404);

    const id = generateId('share');

    await c.env.DB.prepare(
        'INSERT INTO shared_matrices (id, user_id, original_matrix_id, title, description, subject, grade, matrix_json, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
        .bind(id, user.id, matrixId, title, description || '', subject || '', grade || '', original.matrix_json, isoNow())
        .run();

    return c.json({ success: true, id });
});

// POST /community/matrices/:id/import - Import to my library
community.post('/matrices/:id/import', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const shareId = c.req.param('id');
    const shared = await c.env.DB.prepare('SELECT * FROM shared_matrices WHERE id = ?').bind(shareId).first<any>();

    if (!shared) return c.json({ error: 'not_found' }, 404);

    // Create new exam from shared matrix
    const newExamId = generateId('exam');
    const title = `Copy of ${shared.title}`;

    await c.env.DB.prepare(
        'INSERT INTO exams (id, user_id, title, subject, grade, matrix_json, created_at, updated_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    )
        .bind(newExamId, user.id, title, shared.subject, shared.grade, shared.matrix_json, isoNow(), isoNow(), 'draft')
        .run();

    // Increment download count
    await c.env.DB.prepare('UPDATE shared_matrices SET downloads = downloads + 1 WHERE id = ?').bind(shareId).run();

    return c.json({ success: true, examId: newExamId });
});

export { community as communityRoutes };
