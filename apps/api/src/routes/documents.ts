// Chú thích: Document routes - upload và quản lý tài liệu
// Flow: initiate upload → client parse text → complete upload → chunk

import { Hono } from 'hono';
import { CompleteUploadRequestSchema, generateId, isoNow } from '@exam-matrix/shared';
import { chunkText } from '@exam-matrix/rag';
import type { Env } from '../types.js';

const documents = new Hono<{ Bindings: Env }>();

// GET /documents/:libraryId - Danh sách documents của library
documents.get('/:libraryId', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const libraryId = c.req.param('libraryId');

    // Verify library ownership
    const library = await c.env.DB.prepare(
        'SELECT id FROM libraries WHERE id = ? AND user_id = ?'
    )
        .bind(libraryId, user.id)
        .first();

    if (!library) {
        return c.json({ error: 'not_found', message: 'Library không tồn tại' }, 404);
    }

    const result = await c.env.DB.prepare(
        'SELECT * FROM documents WHERE library_id = ? ORDER BY created_at DESC'
    )
        .bind(libraryId)
        .all();

    return c.json({ documents: result.results || [] });
});

// POST /documents/:libraryId/upload - Initiate upload
// Trả về signed URL cho R2 hoặc accept direct upload
documents.post('/:libraryId/upload', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const libraryId = c.req.param('libraryId');

    // Verify library ownership
    const library = await c.env.DB.prepare(
        'SELECT id FROM libraries WHERE id = ? AND user_id = ?'
    )
        .bind(libraryId, user.id)
        .first();

    if (!library) {
        return c.json({ error: 'not_found' }, 404);
    }

    const body = await c.req.json().catch(() => ({}));
    const { filename, fileType } = body as { filename: string; fileType: string };

    if (!filename || !fileType) {
        return c.json({ error: 'missing_fields', message: 'Cần filename và fileType' }, 400);
    }

    // Validate file type
    const allowedTypes = ['pdf', 'docx', 'xlsx'];
    if (!allowedTypes.includes(fileType.toLowerCase())) {
        return c.json({ error: 'invalid_file_type', message: 'Chỉ hỗ trợ PDF, DOCX, XLSX' }, 400);
    }

    const documentId = generateId('doc');
    const r2Key = `${user.id}/${libraryId}/${documentId}/${filename}`;

    // Insert document record
    await c.env.DB.prepare(
        `INSERT INTO documents (id, library_id, user_id, filename, file_type, r2_key, extracted_text_status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`
    )
        .bind(documentId, libraryId, user.id, filename, fileType.toLowerCase(), r2Key, isoNow())
        .run();

    console.info('[document] upload initiated', { documentId, filename });

    return c.json({
        documentId,
        r2Key,
        uploadMethod: 'direct', // Hoặc 'signed_url' nếu dùng multipart
    });
});

// PUT /documents/:documentId/upload - Direct upload file content
documents.put('/:documentId/upload', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const documentId = c.req.param('documentId');

    // Get document
    const doc = await c.env.DB.prepare(
        'SELECT * FROM documents WHERE id = ? AND user_id = ?'
    )
        .bind(documentId, user.id)
        .first<{ id: string; r2_key: string }>();

    if (!doc) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Get file from body
    const body = await c.req.arrayBuffer();

    // Upload to R2
    await c.env.R2.put(doc.r2_key, body);

    console.info('[document] file uploaded to R2', { documentId, size: body.byteLength });

    return c.json({ success: true, documentId });
});

// POST /documents/:documentId/complete - Complete upload với extracted text
documents.post('/:documentId/complete', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const documentId = c.req.param('documentId');
    const body = await c.req.json().catch(() => ({}));

    const parsed = CompleteUploadRequestSchema.safeParse({ ...body, documentId });
    if (!parsed.success) {
        return c.json({ error: 'validation_error', message: parsed.error.errors[0].message }, 400);
    }

    const { extractedText } = parsed.data;

    // Verify document ownership
    const doc = await c.env.DB.prepare(
        'SELECT * FROM documents WHERE id = ? AND user_id = ?'
    )
        .bind(documentId, user.id)
        .first<{ id: string; library_id: string }>();

    if (!doc) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Chunk text
    const chunks = chunkText(extractedText, documentId);

    // Insert chunks
    for (const chunk of chunks) {
        await c.env.DB.prepare(
            `INSERT INTO doc_chunks (id, document_id, chunk_index, title_hint, text, tokens_est, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
            .bind(chunk.id, documentId, chunk.index, chunk.titleHint, chunk.text, chunk.tokensEst, isoNow())
            .run();
    }

    // Update document status
    await c.env.DB.prepare(
        "UPDATE documents SET extracted_text_status = 'done' WHERE id = ?"
    )
        .bind(documentId)
        .run();

    console.info('[document] completed', { documentId, chunksCount: chunks.length });

    return c.json({
        success: true,
        documentId,
        chunksCount: chunks.length,
    });
});

// GET /documents/:documentId/chunks - Lấy chunks của document
documents.get('/:documentId/chunks', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const documentId = c.req.param('documentId');

    // Verify ownership
    const doc = await c.env.DB.prepare(
        'SELECT id FROM documents WHERE id = ? AND user_id = ?'
    )
        .bind(documentId, user.id)
        .first();

    if (!doc) {
        return c.json({ error: 'not_found' }, 404);
    }

    const result = await c.env.DB.prepare(
        'SELECT * FROM doc_chunks WHERE document_id = ? ORDER BY chunk_index'
    )
        .bind(documentId)
        .all();

    return c.json({ chunks: result.results || [] });
});

export { documents as documentRoutes };
