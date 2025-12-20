// Chú thích: Library routes - CRUD cho bộ sách
// User tạo library → upload tài liệu → tạo đề

import { Hono } from 'hono';
import { CreateLibraryRequestSchema, generateId, isoNow } from '@exam-matrix/shared';
import type { Env } from '../types.js';

const libraries = new Hono<{ Bindings: Env }>();

// GET /libraries - Danh sách library của user
libraries.get('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const result = await c.env.DB.prepare(
        'SELECT * FROM libraries WHERE user_id = ? ORDER BY created_at DESC'
    )
        .bind(user.id)
        .all();

    return c.json({ libraries: result.results || [] });
});

// GET /libraries/:id - Chi tiết library
libraries.get('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const libraryId = c.req.param('id');

    const library = await c.env.DB.prepare(
        'SELECT * FROM libraries WHERE id = ? AND user_id = ?'
    )
        .bind(libraryId, user.id)
        .first();

    if (!library) {
        return c.json({ error: 'not_found', message: 'Không tìm thấy library' }, 404);
    }

    // Get documents count
    const docsCount = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM documents WHERE library_id = ?'
    )
        .bind(libraryId)
        .first<{ count: number }>();

    // Get exams count
    const examsCount = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM exams WHERE library_id = ?'
    )
        .bind(libraryId)
        .first<{ count: number }>();

    return c.json({
        library,
        stats: {
            documentsCount: docsCount?.count || 0,
            examsCount: examsCount?.count || 0,
        },
    });
});

// POST /libraries - Tạo library mới
libraries.post('/', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const body = await c.req.json().catch(() => ({}));
    const parsed = CreateLibraryRequestSchema.safeParse(body);

    if (!parsed.success) {
        return c.json(
            {
                error: 'validation_error',
                message: parsed.error.errors[0].message,
            },
            400
        );
    }

    const { subject, grade, bookset, term, durationMinutes } = parsed.data;
    const libraryId = generateId('lib');

    await c.env.DB.prepare(
        `INSERT INTO libraries (id, user_id, subject, grade, bookset, term, duration_minutes, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
        .bind(libraryId, user.id, subject, grade, bookset || null, term || null, durationMinutes, isoNow())
        .run();

    console.info('[library] created', { libraryId, subject, grade });

    return c.json(
        {
            success: true,
            library: {
                id: libraryId,
                userId: user.id,
                subject,
                grade,
                bookset,
                term,
                durationMinutes,
            },
        },
        201
    );
});

// DELETE /libraries/:id - Xóa library
libraries.delete('/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const libraryId = c.req.param('id');

    // Check ownership
    const library = await c.env.DB.prepare(
        'SELECT id FROM libraries WHERE id = ? AND user_id = ?'
    )
        .bind(libraryId, user.id)
        .first();

    if (!library) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Delete cascading: documents, chunks, exams, exports
    // Trong production nên dùng transaction
    await c.env.DB.prepare('DELETE FROM doc_chunks WHERE document_id IN (SELECT id FROM documents WHERE library_id = ?)')
        .bind(libraryId)
        .run();
    await c.env.DB.prepare('DELETE FROM documents WHERE library_id = ?').bind(libraryId).run();
    await c.env.DB.prepare('DELETE FROM exports WHERE exam_id IN (SELECT id FROM exams WHERE library_id = ?)')
        .bind(libraryId)
        .run();
    await c.env.DB.prepare('DELETE FROM exams WHERE library_id = ?').bind(libraryId).run();
    await c.env.DB.prepare('DELETE FROM libraries WHERE id = ?').bind(libraryId).run();

    console.info('[library] deleted', { libraryId });

    return c.json({ success: true });
});

export { libraries as libraryRoutes };
