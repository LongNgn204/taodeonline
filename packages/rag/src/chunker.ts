// Chú thích: Text chunking cho RAG
// Chiến lược: split theo paragraph/heading, overlap để giữ context
// Target: 800-1200 ký tự mỗi chunk, overlap 100-150 ký tự

import { generateId, estimateTokens } from '@exam-matrix/shared';

export interface ChunkConfig {
    maxChars: number; // 800-1200
    overlapChars: number; // 100-150
    minChars: number; // Không tạo chunk quá ngắn
}

export interface Chunk {
    id: string;
    index: number;
    titleHint: string; // Heading hoặc context của chunk
    text: string;
    tokensEst: number;
}

const DEFAULT_CONFIG: ChunkConfig = {
    maxChars: 1000,
    overlapChars: 120,
    minChars: 100,
};

/**
 * Chunk text thành các đoạn nhỏ cho RAG
 * Ưu tiên split theo paragraph, sau đó sentence nếu cần
 */
export function chunkText(
    text: string,
    documentId: string,
    config: Partial<ChunkConfig> = {}
): Chunk[] {
    const cfg = { ...DEFAULT_CONFIG, ...config };
    const chunks: Chunk[] = [];

    // Normalize line breaks và clean text
    const cleanText = text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

    if (cleanText.length === 0) {
        return [];
    }

    // Split theo paragraph (2+ newlines)
    const paragraphs = cleanText.split(/\n\n+/);
    let currentChunk = '';
    let chunkIndex = 0;
    let lastHeading = '';

    for (const para of paragraphs) {
        const trimmedPara = para.trim();
        if (!trimmedPara) continue;

        // Detect heading (dòng ngắn, có thể có số hoặc chữ in hoa)
        const isHeading =
            trimmedPara.length < 100 &&
            (trimmedPara.match(/^[0-9]+\./) || // Bắt đầu bằng số
                trimmedPara.match(/^[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴ]/) || // In hoa
                trimmedPara.match(/^(Chương|Bài|Phần|Mục|Chủ đề)/i));

        if (isHeading) {
            lastHeading = trimmedPara;
        }

        // Nếu thêm paragraph này vượt quá maxChars, save chunk hiện tại
        if (currentChunk.length + trimmedPara.length > cfg.maxChars && currentChunk.length > 0) {
            // Save chunk
            chunks.push({
                id: generateId(`chunk_${documentId}`),
                index: chunkIndex++,
                titleHint: lastHeading || `Đoạn ${chunkIndex}`,
                text: currentChunk.trim(),
                tokensEst: estimateTokens(currentChunk),
            });

            // Overlap: giữ lại phần cuối của chunk cũ
            const overlapText = currentChunk.slice(-cfg.overlapChars);
            currentChunk = overlapText + '\n\n' + trimmedPara;
        } else {
            // Thêm paragraph vào chunk hiện tại
            currentChunk = currentChunk ? currentChunk + '\n\n' + trimmedPara : trimmedPara;
        }
    }

    // Save chunk cuối cùng nếu đủ lớn
    if (currentChunk.length >= cfg.minChars) {
        chunks.push({
            id: generateId(`chunk_${documentId}`),
            index: chunkIndex,
            titleHint: lastHeading || `Đoạn ${chunkIndex + 1}`,
            text: currentChunk.trim(),
            tokensEst: estimateTokens(currentChunk),
        });
    }

    return chunks;
}

/**
 * Split text dài thành sentences (backup khi paragraph quá dài)
 */
export function splitIntoSentences(text: string): string[] {
    // Vietnamese sentence endings: . ? ! và các ký tự kết thúc khác
    const sentenceRegex = /[^.!?]*[.!?]+/g;
    const matches = text.match(sentenceRegex);
    return matches ? matches.map((s) => s.trim()) : [text];
}
