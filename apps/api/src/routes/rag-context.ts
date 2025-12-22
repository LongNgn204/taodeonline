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

/**
 * POST /rag/hybrid-search
 * L1: Hybrid search combining TF-IDF + Embeddings (when available)
 * Chú thích: Embeddings được tính client-side hoặc qua external API
 */
app.post('/hybrid-search', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<{
        libraryId: string;
        query: string;
        queryEmbedding?: number[]; // Optional: client-computed embedding
        topK?: number;
        weights?: { tfidf: number; semantic: number }; // Default 0.5/0.5
    }>();

    const {
        libraryId,
        query,
        queryEmbedding,
        topK = 10,
        weights = { tfidf: 0.5, semantic: 0.5 }
    } = body;

    console.info('[rag/hybrid-search] Request:', { libraryId, hasEmbedding: !!queryEmbedding, topK });

    try {
        // 1. Get all chunks from library
        const chunksResult = await c.env.DB.prepare(`
            SELECT 
                c.id as chunkId,
                c.document_id as docId,
                c.title_hint as titleHint,
                c.text,
                c.embedding,
                c.chunk_index
            FROM doc_chunks c
            JOIN documents d ON c.document_id = d.id
            WHERE d.library_id = ? AND d.user_id = ?
            ORDER BY c.chunk_index ASC
            LIMIT 500
        `)
            .bind(libraryId, user.id)
            .all<{
                chunkId: string;
                docId: string;
                titleHint: string;
                text: string;
                embedding: string | null;
                chunk_index: number;
            }>();

        const allChunks = chunksResult.results || [];

        if (allChunks.length === 0) {
            return c.json({ chunks: [], method: 'hybrid', totalSearched: 0 });
        }

        // 2. TF-IDF scoring
        const chunksForTfidf = allChunks.map(c => ({
            id: c.chunkId,
            index: c.chunk_index,
            titleHint: c.titleHint,
            text: c.text,
            tokensEst: Math.ceil(c.text.length / 4),
        }));

        const tfidfResults = retrieveWithFilters(query, chunksForTfidf, {}, Math.min(topK * 2, allChunks.length));
        const tfidfScores = new Map<string, number>();
        tfidfResults.forEach((r: { chunk: { id: string }; score: number }, idx: number) => {
            // Normalize: top result = 1.0, decreasing by rank
            tfidfScores.set(r.chunk.id, 1 - (idx / tfidfResults.length));
        });

        // 3. Semantic scoring (if embeddings available)
        const semanticScores = new Map<string, number>();

        if (queryEmbedding && queryEmbedding.length > 0) {
            allChunks.forEach(chunk => {
                if (chunk.embedding) {
                    try {
                        const chunkEmbedding = JSON.parse(chunk.embedding) as number[];
                        const similarity = cosineSimilarity(queryEmbedding, chunkEmbedding);
                        semanticScores.set(chunk.chunkId, similarity);
                    } catch {
                        // Skip invalid embeddings
                    }
                }
            });
        }

        // 4. Combine scores (hybrid)
        const combinedScores = allChunks.map(chunk => {
            const tfidf = tfidfScores.get(chunk.chunkId) || 0;
            const semantic = semanticScores.get(chunk.chunkId) || 0;

            // If no embeddings, use pure TF-IDF
            const hasEmbeddings = semanticScores.size > 0;
            const score = hasEmbeddings
                ? (weights.tfidf * tfidf) + (weights.semantic * semantic)
                : tfidf;

            return {
                chunkId: chunk.chunkId,
                docId: chunk.docId,
                titleHint: chunk.titleHint,
                text: chunk.text,
                score,
                tfidfScore: tfidf,
                semanticScore: semantic,
            };
        });

        // 5. Sort and return top K
        combinedScores.sort((a, b) => b.score - a.score);
        const topResults = combinedScores.slice(0, topK);

        return c.json({
            chunks: topResults,
            method: semanticScores.size > 0 ? 'hybrid' : 'tfidf-only',
            totalSearched: allChunks.length,
            hasEmbeddings: semanticScores.size > 0,
        });
    } catch (error) {
        console.error('[rag/hybrid-search] Error:', error);
        return c.json(
            { error: 'search_failed', message: error instanceof Error ? error.message : 'Unknown' },
            500
        );
    }
});

/**
 * Cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
        dotProduct += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
}

export { app as ragContextRoutes };
export default app;
