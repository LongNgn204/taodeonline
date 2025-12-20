// Chú thích: Simple keyword-based retrieval (BM25-lite)
// Giai đoạn 1: TF-IDF đơn giản, sau này upgrade lên embeddings

import type { Chunk } from './chunker.js';

export interface RetrievalResult {
    chunk: Chunk;
    score: number;
}

/**
 * Tokenize tiếng Việt đơn giản
 * Lowercase + split theo whitespace và ký tự đặc biệt
 */
function tokenize(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/[.,!?;:()[\]{}""'']/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length > 1); // Bỏ token 1 ký tự
}

/**
 * Tính term frequency trong document
 */
function termFrequency(terms: string[], doc: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const docSet = new Set(doc);

    for (const term of terms) {
        if (docSet.has(term)) {
            // Count occurrences
            const count = doc.filter((t) => t === term).length;
            tf.set(term, count / doc.length);
        }
    }

    return tf;
}

/**
 * Tính IDF từ corpus
 */
function inverseDocFrequency(term: string, corpus: string[][]): number {
    const docsWithTerm = corpus.filter((doc) => doc.includes(term)).length;
    if (docsWithTerm === 0) return 0;
    return Math.log(corpus.length / docsWithTerm);
}

/**
 * Simple TF-IDF scoring
 */
function tfidfScore(queryTerms: string[], docTerms: string[], corpus: string[][]): number {
    const tf = termFrequency(queryTerms, docTerms);
    let score = 0;

    for (const term of queryTerms) {
        const tfVal = tf.get(term) || 0;
        const idf = inverseDocFrequency(term, corpus);
        score += tfVal * idf;
    }

    return score;
}

/**
 * Retrieve top-k chunks relevant to query
 * Dùng TF-IDF đơn giản cho giai đoạn 1
 */
export function retrieveChunks(
    query: string,
    chunks: Chunk[],
    topK: number = 5
): RetrievalResult[] {
    if (chunks.length === 0) return [];

    const queryTerms = tokenize(query);

    // Build corpus từ chunks
    const corpus = chunks.map((c) => tokenize(c.text));

    // Score từng chunk
    const scored: RetrievalResult[] = chunks.map((chunk, i) => ({
        chunk,
        score: tfidfScore(queryTerms, corpus[i], corpus),
    }));

    // Sort by score descending và lấy top-k
    return scored
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, topK);
}

/**
 * Retrieve với filter theo topic/level
 * Dùng khi cần lọc chunks theo chủ đề cụ thể
 */
export function retrieveWithFilters(
    query: string,
    chunks: Chunk[],
    filters: {
        topics?: string[];
        mustContain?: string[];
    },
    topK: number = 5
): RetrievalResult[] {
    // Pre-filter chunks nếu có filter
    let filtered = chunks;

    if (filters.topics && filters.topics.length > 0) {
        const topicLower = filters.topics.map((t) => t.toLowerCase());
        filtered = filtered.filter((c) =>
            topicLower.some(
                (topic) =>
                    c.titleHint.toLowerCase().includes(topic) || c.text.toLowerCase().includes(topic)
            )
        );
    }

    if (filters.mustContain && filters.mustContain.length > 0) {
        const mustLower = filters.mustContain.map((m) => m.toLowerCase());
        filtered = filtered.filter((c) =>
            mustLower.every((term) => c.text.toLowerCase().includes(term))
        );
    }

    return retrieveChunks(query, filtered, topK);
}
