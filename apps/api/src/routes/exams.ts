// Chú thích: Exam routes - tạo ma trận, sinh đề, CRUD
// Đây là core của hệ thống - kết nối AI agents

import { Hono } from 'hono';
import {
    GenerateMatrixRequestSchema,
    GenerateExamRequestSchema,
    SaveExamRequestSchema,
    generateId,
    isoNow,
    safeJsonParse,
} from '@exam-matrix/shared';
import type { Matrix, ExamContent, CurriculumOutcome } from '@exam-matrix/shared';
import type { Env } from '../types.js';
import { generateMatrix, validateMatrix } from '../agents/matrix-agent.js';
import { generateExam } from '../agents/exam-agent.js';
import { generateExamVersions } from '../services/ExamVersionGenerator.js';

const exams = new Hono<{ Bindings: Env }>();

// GET /exams - Danh sách exams
exams.get('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const libraryId = c.req.query('libraryId');

    let query = 'SELECT * FROM exams WHERE user_id = ?';
    const params: string[] = [user.id];

    if (libraryId) {
        query += ' AND library_id = ?';
        params.push(libraryId);
    }

    query += ' ORDER BY updated_at DESC';

    const stmt = c.env.DB.prepare(query);
    const result = await stmt.bind(...params).all();

    return c.json({ exams: result.results || [] });
});

// GET /exams/:id - Chi tiết exam
exams.get('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');

    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?')
        .bind(examId, user.id)
        .first();

    if (!exam) {
        return c.json({ error: 'not_found' }, 404);
    }

    return c.json({ exam });
});

// POST /exams/generate-matrix - Sinh ma trận từ AI
exams.post('/generate-matrix', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({}));
    const parsed = GenerateMatrixRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: 'validation_error', message: parsed.error.errors[0].message }, 400);
    }

    const { libraryId, scope, numTopics, provider, model, apiKey, useCurriculum } = parsed.data;

    // Verify library ownership
    const library = await c.env.DB.prepare(
        'SELECT * FROM libraries WHERE id = ? AND user_id = ?'
    )
        .bind(libraryId, user.id)
        .first<{ subject: string; grade: number; duration_minutes: number }>();

    if (!library) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Get chunks from library's documents for context
    const chunksResult = await c.env.DB.prepare(
        `SELECT dc.id, dc.title_hint, dc.text FROM doc_chunks dc
     JOIN documents d ON dc.document_id = d.id
     WHERE d.library_id = ?
     ORDER BY dc.chunk_index
     LIMIT 20`
    )
        .bind(libraryId)
        .all<{ id: string; title_hint: string; text: string }>();

    const contextChunks = (chunksResult.results || []).map((c) => ({
        titleHint: c.title_hint,
        text: c.text,
    }));

    let outcomes: CurriculumOutcome[] = [];
    if (useCurriculum) {
        let outcomeQuery =
            'SELECT id, subject, grade, topic, outcome, unit FROM curriculum_outcomes WHERE subject = ? AND grade = ?';
        const outcomeParams: (string | number)[] = [library.subject, library.grade];

        if (scope && scope.length > 0) {
            const placeholders = scope.map(() => '?').join(', ');
            outcomeQuery += ` AND topic IN (${placeholders})`;
            outcomeParams.push(...scope);
        }

        outcomeQuery += ' ORDER BY topic ASC, unit ASC';

        const outcomesResult = await c.env.DB.prepare(outcomeQuery)
            .bind(...outcomeParams)
            .all<CurriculumOutcome>();

        outcomes = outcomesResult.results || [];

        if (outcomes.length === 0) {
            return c.json(
                {
                    error: 'no_outcomes',
                    message: 'Chưa có CTGDPT outcomes cho môn/lớp này',
                },
                400
            );
        }
    }

    try {
        // Gọi MatrixAgent để sinh ma trận
        const result = await generateMatrix({
            constraints: {
                subject: library.subject,
                grade: library.grade,
                duration: library.duration_minutes,
                numTopics: numTopics || 4,
                scope: scope || undefined,
                useCurriculum: useCurriculum || false,
            },
            contextChunks,
            provider,
            model,
            apiKey,
            outcomes: outcomes.length > 0 ? outcomes : undefined,
        });

        // Validate ma trận
        const validation = validateMatrix(result.matrix, { requireOutcomeMapping: useCurriculum });
        if (!validation.valid) {
            console.warn('[exam] matrix validation warnings:', validation.errors);
        }

        console.info('[exam] matrix generated', {
            libraryId,
            provider,
            model,
            topicsCount: result.matrix.topics.length,
            tokensIn: result.tokensIn,
            tokensOut: result.tokensOut,
        });

        return c.json({
            success: true,
            matrix: result.matrix,
            contextChunksUsed: contextChunks.length,
            usage: {
                tokensIn: result.tokensIn,
                tokensOut: result.tokensOut,
                latencyMs: result.latencyMs,
            },
            validation: validation.valid ? null : validation.errors,
        });
    } catch (error) {
        console.error('[exam] matrix generation failed:', error);
        return c.json(
            { error: 'generation_failed', message: String(error) },
            500
        );
    }
});

// POST /exams/generate-exam - Sinh đề thi từ ma trận
exams.post('/generate-exam', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({}));
    const parsed = GenerateExamRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: 'validation_error', message: parsed.error.errors[0].message }, 400);
    }

    const { libraryId, matrixJson, provider, model, apiKey } = parsed.data;

    // Parse matrix
    const matrix = safeJsonParse<Matrix | null>(matrixJson, null);
    if (!matrix) {
        return c.json({ error: 'invalid_matrix', message: 'Ma trận không hợp lệ' }, 400);
    }

    // Get chunks từ library
    const chunksResult = await c.env.DB.prepare(
        `SELECT dc.id, dc.title_hint, dc.text FROM doc_chunks dc
     JOIN documents d ON dc.document_id = d.id
     WHERE d.library_id = ?
     ORDER BY dc.chunk_index
     LIMIT 30`
    )
        .bind(libraryId)
        .all<{ id: string; title_hint: string; text: string }>();

    const chunks = (chunksResult.results || []).map((c) => ({
        id: c.id,
        titleHint: c.title_hint,
        text: c.text,
    }));

    try {
        // Gọi ExamAgent để sinh đề
        const result = await generateExam({
            matrix,
            chunks,
            provider,
            model,
            apiKey,
        });

        console.info('[exam] exam generated', {
            libraryId,
            provider,
            model,
            sectionsCount: result.exam.sections.length,
            tokensIn: result.tokensIn,
            tokensOut: result.tokensOut,
        });

        return c.json({
            success: true,
            exam: result.exam,
            usage: {
                tokensIn: result.tokensIn,
                tokensOut: result.tokensOut,
                latencyMs: result.latencyMs,
            },
        });
    } catch (error) {
        console.error('[exam] exam generation failed:', error);
        return c.json(
            { error: 'generation_failed', message: String(error) },
            500
        );
    }
});

// POST /exams/generate-versions - Tạo nhiều phiên bản đề từ một đề gốc
exams.post('/generate-versions', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({})) as {
        examJson: string;
        numberOfVersions?: number;
        shuffleQuestions?: boolean;
        shuffleOptions?: boolean;
    };

    const { examJson, numberOfVersions = 3, shuffleQuestions = true, shuffleOptions = true } = body;

    if (!examJson) {
        return c.json({ error: 'validation_error', message: 'examJson is required' }, 400);
    }

    if (numberOfVersions < 1 || numberOfVersions > 6) {
        return c.json({ error: 'validation_error', message: 'numberOfVersions must be 1-6' }, 400);
    }

    // Parse original exam
    const originalExam = safeJsonParse<ExamContent | null>(examJson, null);
    if (!originalExam) {
        return c.json({ error: 'invalid_exam', message: 'Đề thi không hợp lệ' }, 400);
    }

    try {
        // Generate multiple versions
        const versions = generateExamVersions(originalExam, {
            numberOfVersions,
            shuffleQuestions,
            shuffleOptions,
        });

        console.info('[exam] versions generated', {
            originalTitle: originalExam.title,
            versionsCount: versions.length,
            versionCodes: versions.map(v => v.versionCode),
        });

        return c.json({
            success: true,
            versions,
            versionsCount: versions.length,
        });
    } catch (error) {
        console.error('[exam] version generation failed:', error);
        return c.json(
            { error: 'generation_failed', message: String(error) },
            500
        );
    }
});

// POST /exams - Lưu exam
exams.post('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({}));
    const parsed = SaveExamRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json({ error: 'validation_error', message: parsed.error.errors[0].message }, 400);
    }

    const { libraryId, title, matrixJson, examJson, answerKeyJson, status } = parsed.data;

    // Verify library ownership
    const library = await c.env.DB.prepare(
        'SELECT id FROM libraries WHERE id = ? AND user_id = ?'
    )
        .bind(libraryId, user.id)
        .first();

    if (!library) {
        return c.json({ error: 'not_found' }, 404);
    }

    const examId = generateId('exam');
    const now = isoNow();

    await c.env.DB.prepare(
        `INSERT INTO exams (id, library_id, user_id, title, matrix_json, exam_json, answer_key_json, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
        .bind(examId, libraryId, user.id, title, matrixJson, examJson || null, answerKeyJson || null, status, now, now)
        .run();

    console.info('[exam] saved', { examId, title });

    return c.json({ success: true, examId }, 201);
});

// PUT /exams/:id - Update exam
exams.put('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');
    const body = await c.req.json().catch(() => ({}));

    // Verify ownership
    const existing = await c.env.DB.prepare('SELECT id FROM exams WHERE id = ? AND user_id = ?')
        .bind(examId, user.id)
        .first();

    if (!existing) {
        return c.json({ error: 'not_found' }, 404);
    }

    const { title, matrixJson, examJson, answerKeyJson, status } = body as {
        title?: string;
        matrixJson?: string;
        examJson?: string;
        answerKeyJson?: string;
        status?: string;
    };

    // Build update query dynamically
    const updates: string[] = ['updated_at = ?'];
    const params: (string | null)[] = [isoNow()];

    if (title) {
        updates.push('title = ?');
        params.push(title);
    }
    if (matrixJson) {
        updates.push('matrix_json = ?');
        params.push(matrixJson);
    }
    if (examJson !== undefined) {
        updates.push('exam_json = ?');
        params.push(examJson);
    }
    if (answerKeyJson !== undefined) {
        updates.push('answer_key_json = ?');
        params.push(answerKeyJson);
    }
    if (status) {
        updates.push('status = ?');
        params.push(status);
    }

    params.push(examId);

    await c.env.DB.prepare(`UPDATE exams SET ${updates.join(', ')} WHERE id = ?`)
        .bind(...params)
        .run();

    return c.json({ success: true });
});

// DELETE /exams/:id
exams.delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');

    // Delete exports first
    await c.env.DB.prepare('DELETE FROM exports WHERE exam_id = ? AND user_id = ?')
        .bind(examId, user.id)
        .run();

    // Delete exam
    await c.env.DB.prepare('DELETE FROM exams WHERE id = ? AND user_id = ?').bind(examId, user.id).run();

    return c.json({ success: true });
});

export { exams as examRoutes };
