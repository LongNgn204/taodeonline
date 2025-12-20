// Chú thích: Question Bank API routes
// CRUD cho ngân hàng câu hỏi và tìm kiếm

import { Hono } from 'hono';
import type { Env } from '../types.js';

type Variables = {
    userId?: string;
    user?: { id: string; email: string } | null;
};

const questionBank = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /question-bank - Tìm kiếm và lọc câu hỏi
questionBank.get('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const db = c.env.DB;
    const subject = c.req.query('subject');
    const grade = c.req.query('grade');
    const topic = c.req.query('topic');
    const level = c.req.query('level');
    const type = c.req.query('type');
    const search = c.req.query('search');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');

    try {
        let query = 'SELECT * FROM question_bank WHERE user_id = ?';
        const params: (string | number)[] = [user.id];

        if (subject) {
            query += ' AND subject = ?';
            params.push(subject);
        }
        if (grade) {
            query += ' AND grade = ?';
            params.push(parseInt(grade));
        }
        if (topic) {
            query += ' AND topic LIKE ?';
            params.push(`%${topic}%`);
        }
        if (level) {
            query += ' AND level = ?';
            params.push(level);
        }
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        if (search) {
            query += ' AND content_json LIKE ?';
            params.push(`%${search}%`);
        }

        query += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const result = await db.prepare(query).bind(...params).all();

        // Get total count
        let countQuery = 'SELECT COUNT(*) as total FROM question_bank WHERE user_id = ?';
        const countParams: (string | number)[] = [user.id];
        if (subject) { countQuery += ' AND subject = ?'; countParams.push(subject); }
        if (grade) { countQuery += ' AND grade = ?'; countParams.push(parseInt(grade)); }
        if (topic) { countQuery += ' AND topic LIKE ?'; countParams.push(`%${topic}%`); }
        if (level) { countQuery += ' AND level = ?'; countParams.push(level); }
        if (type) { countQuery += ' AND type = ?'; countParams.push(type); }

        const countResult = await db.prepare(countQuery).bind(...countParams).first<{ total: number }>();

        return c.json({
            questions: result.results || [],
            total: countResult?.total || 0,
            limit,
            offset,
        });
    } catch (error) {
        console.error('Error fetching question bank:', error);
        return c.json({ error: 'Failed to fetch questions' }, 500);
    }
});

// POST /question-bank - Thêm câu hỏi mới
questionBank.post('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const db = c.env.DB;

    try {
        const body = await c.req.json<{
            subject: string;
            grade: number;
            topic?: string;
            unit?: string;
            level: string;
            type: string;
            contentJson: string;
            answerKey?: string;
            sourceBook?: string;
            sourcePage?: string;
            tags?: string[];
        }>();

        const questionId = `qb_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const now = new Date().toISOString();

        await db
            .prepare(`
                INSERT INTO question_bank (id, user_id, subject, grade, topic, unit, level, type, content_json, answer_key, source_book, source_page, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                questionId,
                user.id,
                body.subject,
                body.grade,
                body.topic || null,
                body.unit || null,
                body.level,
                body.type,
                body.contentJson,
                body.answerKey || null,
                body.sourceBook || null,
                body.sourcePage || null,
                now,
                now
            )
            .run();

        // Add tags
        if (body.tags && body.tags.length > 0) {
            for (const tag of body.tags) {
                await db
                    .prepare('INSERT OR IGNORE INTO question_tags (question_id, tag) VALUES (?, ?)')
                    .bind(questionId, tag)
                    .run();
            }
        }

        return c.json({ success: true, questionId }, 201);
    } catch (error) {
        console.error('Error creating question:', error);
        return c.json({ error: 'Failed to create question' }, 500);
    }
});

// GET /question-bank/:id - Lấy chi tiết câu hỏi
questionBank.get('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const questionId = c.req.param('id');
    const db = c.env.DB;

    try {
        const question = await db
            .prepare('SELECT * FROM question_bank WHERE id = ? AND user_id = ?')
            .bind(questionId, user.id)
            .first();

        if (!question) {
            return c.json({ error: 'not_found' }, 404);
        }

        // Get tags
        const tagsResult = await db
            .prepare('SELECT tag FROM question_tags WHERE question_id = ?')
            .bind(questionId)
            .all<{ tag: string }>();

        return c.json({
            question,
            tags: (tagsResult.results || []).map(t => t.tag),
        });
    } catch (error) {
        console.error('Error fetching question:', error);
        return c.json({ error: 'Failed to fetch question' }, 500);
    }
});

// PUT /question-bank/:id - Cập nhật câu hỏi
questionBank.put('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const questionId = c.req.param('id');
    const db = c.env.DB;

    try {
        // Verify ownership
        const existing = await db
            .prepare('SELECT id FROM question_bank WHERE id = ? AND user_id = ?')
            .bind(questionId, user.id)
            .first();

        if (!existing) {
            return c.json({ error: 'not_found' }, 404);
        }

        const body = await c.req.json<{
            topic?: string;
            unit?: string;
            level?: string;
            contentJson?: string;
            answerKey?: string;
            sourceBook?: string;
            tags?: string[];
        }>();

        const updates: string[] = ['updated_at = ?'];
        const params: (string | null)[] = [new Date().toISOString()];

        if (body.topic !== undefined) { updates.push('topic = ?'); params.push(body.topic); }
        if (body.unit !== undefined) { updates.push('unit = ?'); params.push(body.unit); }
        if (body.level !== undefined) { updates.push('level = ?'); params.push(body.level); }
        if (body.contentJson !== undefined) { updates.push('content_json = ?'); params.push(body.contentJson); }
        if (body.answerKey !== undefined) { updates.push('answer_key = ?'); params.push(body.answerKey); }
        if (body.sourceBook !== undefined) { updates.push('source_book = ?'); params.push(body.sourceBook); }

        params.push(questionId);

        await db
            .prepare(`UPDATE question_bank SET ${updates.join(', ')} WHERE id = ?`)
            .bind(...params)
            .run();

        // Update tags
        if (body.tags) {
            await db.prepare('DELETE FROM question_tags WHERE question_id = ?').bind(questionId).run();
            for (const tag of body.tags) {
                await db
                    .prepare('INSERT OR IGNORE INTO question_tags (question_id, tag) VALUES (?, ?)')
                    .bind(questionId, tag)
                    .run();
            }
        }

        return c.json({ success: true });
    } catch (error) {
        console.error('Error updating question:', error);
        return c.json({ error: 'Failed to update question' }, 500);
    }
});

// DELETE /question-bank/:id
questionBank.delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const questionId = c.req.param('id');
    const db = c.env.DB;

    try {
        await db.prepare('DELETE FROM question_tags WHERE question_id = ?').bind(questionId).run();
        await db.prepare('DELETE FROM question_bank WHERE id = ? AND user_id = ?').bind(questionId, user.id).run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Error deleting question:', error);
        return c.json({ error: 'Failed to delete question' }, 500);
    }
});

// POST /question-bank/import-from-exam - Import câu hỏi từ đề thi
questionBank.post('/import-from-exam', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const db = c.env.DB;

    try {
        const body = await c.req.json<{
            examId: string;
            questionIds?: string[];  // If empty, import all
        }>();

        // Get exam
        const exam = await db
            .prepare('SELECT exam_json, library_id FROM exams WHERE id = ? AND user_id = ?')
            .bind(body.examId, user.id)
            .first<{ exam_json: string; library_id: string }>();

        if (!exam || !exam.exam_json) {
            return c.json({ error: 'Exam not found or has no questions' }, 404);
        }

        // Get library info
        const library = await db
            .prepare('SELECT subject, grade FROM libraries WHERE id = ?')
            .bind(exam.library_id)
            .first<{ subject: string; grade: number }>();

        const examData = JSON.parse(exam.exam_json);
        const now = new Date().toISOString();
        let importedCount = 0;

        for (const section of examData.sections || []) {
            for (const question of section.questions || []) {
                // Skip if questionIds provided and this question not in list
                if (body.questionIds && body.questionIds.length > 0 && !body.questionIds.includes(question.id)) {
                    continue;
                }

                const questionId = `qb_${Date.now()}_${Math.random().toString(36).slice(2)}_${importedCount}`;

                await db
                    .prepare(`
                        INSERT INTO question_bank (id, user_id, subject, grade, topic, level, type, content_json, answer_key, created_at, updated_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    `)
                    .bind(
                        questionId,
                        user.id,
                        library?.subject || '',
                        library?.grade || 0,
                        question.topicId || null,
                        question.level,
                        question.type,
                        JSON.stringify(question),
                        question.answerKey,
                        now,
                        now
                    )
                    .run();

                importedCount++;
            }
        }

        return c.json({ success: true, importedCount });
    } catch (error) {
        console.error('Error importing questions:', error);
        return c.json({ error: 'Failed to import questions' }, 500);
    }
});

export default questionBank;
