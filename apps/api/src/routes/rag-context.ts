// Chú thích: RAG Context API - trả context chunks cho AI agents
// Endpoint này cung cấp chunks từ thư viện tài liệu để inject vào prompts
// Hỗ trợ filter theo library, môn, lớp, chủ đề

import { Hono } from 'hono';
import { retrieveWithFilters } from '@exam-matrix/rag';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface ContextChunk {
    chunkId: string;
    docId: string;
    titleHint: string;
    text: string;
    page?: number;
}

interface RagContextRequest {
    taskType: 'matrix' | 'exam' | 'lessonplan' | 'skkn';
    libraryId?: string;
    documentIds?: string[];
    subject?: string;
    grade?: number;
    topic?: string;
    query?: string;
    topK?: number;
}

interface RagContextResponse {
    contextChunks: ContextChunk[];
    retrievalMeta: {
        method: string;
        topK: number;
        filtersApplied: string[];
        totalChunksSearched: number;
    };
}

// ===== API Endpoints =====

/**
 * POST /rag/context
 * Retrieve context chunks cho AI agents
 * Chú thích: Dùng POST vì query có thể dài
 */
app.post('/context', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<RagContextRequest>();
    const {
        taskType,
        libraryId,
        documentIds,
        subject,
        grade,
        topic,
        query,
        topK = 5,
    } = body;

    console.info('[rag/context] Request:', { taskType, libraryId, subject, grade, topK });

    const filtersApplied: string[] = [];
    let totalChunksSearched = 0;

    try {
        // 1. Lấy chunks từ DB theo filters
        let whereConditions: string[] = ['d.user_id = ?'];
        let bindParams: (string | number)[] = [user.id];

        if (libraryId) {
            whereConditions.push('d.library_id = ?');
            bindParams.push(libraryId);
            filtersApplied.push(`library:${libraryId}`);
        }

        if (documentIds && documentIds.length > 0) {
            const placeholders = documentIds.map(() => '?').join(',');
            whereConditions.push(`d.id IN (${placeholders})`);
            bindParams.push(...documentIds);
            filtersApplied.push(`documents:${documentIds.length}`);
        }

        // Query chunks từ database
        const chunksQuery = `
            SELECT 
                c.id as chunkId,
                c.document_id as docId,
                c.title_hint as titleHint,
                c.text,
                c.chunk_index
            FROM doc_chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE ${whereConditions.join(' AND ')}
            ORDER BY d.created_at DESC, c.chunk_index ASC
            LIMIT 100
        `;

        const result = await c.env.DB.prepare(chunksQuery)
            .bind(...bindParams)
            .all<{
                chunkId: string;
                docId: string;
                titleHint: string;
                text: string;
                chunk_index: number;
            }>();

        const allChunks = result.results || [];
        totalChunksSearched = allChunks.length;

        // 2. Retrieve với TF-IDF nếu có query
        let contextChunks: ContextChunk[];

        if (query && allChunks.length > 0) {
            // Convert để dùng với retriever
            const chunksForRetrieval = allChunks.map((c) => ({
                id: c.chunkId,
                index: c.chunk_index,
                titleHint: c.titleHint,
                text: c.text,
                tokensEst: Math.ceil(c.text.length / 4),
            }));

            // Apply topic filter nếu có
            const filters = topic ? { topics: [topic] } : {};
            const retrieved = retrieveWithFilters(query, chunksForRetrieval, filters, topK);

            if (topic) filtersApplied.push(`topic:${topic}`);

            contextChunks = retrieved.map((r: { chunk: { id: string; titleHint: string; text: string } }) => ({
                chunkId: r.chunk.id,
                docId: allChunks.find((c) => c.chunkId === r.chunk.id)?.docId || '',
                titleHint: r.chunk.titleHint,
                text: r.chunk.text,
            }));
        } else {
            // Không có query, lấy top K chunks theo thứ tự
            contextChunks = allChunks.slice(0, topK).map((c) => ({
                chunkId: c.chunkId,
                docId: c.docId,
                titleHint: c.titleHint,
                text: c.text,
            }));
        }

        const response: RagContextResponse = {
            contextChunks,
            retrievalMeta: {
                method: query ? 'tfidf' : 'recent',
                topK,
                filtersApplied,
                totalChunksSearched,
            },
        };

        console.info('[rag/context] Response:', {
            chunksReturned: contextChunks.length,
            method: response.retrievalMeta.method,
        });

        return c.json(response);
    } catch (error) {
        console.error('[rag/context] Error:', error);
        return c.json(
            {
                error: 'retrieval_failed',
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            500
        );
    }
});

/**
 * GET /rag/context/preview
 * Preview chunks của một library (cho UI)
 */
app.get('/preview/:libraryId', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const libraryId = c.req.param('libraryId');
    const limit = parseInt(c.req.query('limit') || '10');

    const result = await c.env.DB.prepare(`
        SELECT 
            c.id as chunkId,
            c.document_id as docId,
            c.title_hint as titleHint,
            c.text,
            d.filename
        FROM doc_chunks c
        JOIN documents d ON c.document_id = d.id
        WHERE d.library_id = ? AND d.user_id = ?
        ORDER BY c.chunk_index ASC
        LIMIT ?
    `)
        .bind(libraryId, user.id, limit)
        .all();

    return c.json({
        chunks: result.results || [],
        total: result.results?.length || 0,
    });
});

export { app as ragContextRoutes };
export default app;
