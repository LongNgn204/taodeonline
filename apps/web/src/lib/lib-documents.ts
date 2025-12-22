// Chú thích: Helper functions để fetch documents và context từ library
// Sử dụng trong CreateExam để lấy nội dung tài liệu cho AI

import { api } from './api';

export interface LibraryDocument {
    id: string;
    filename: string;
    file_type: string;
    extracted_text_status: 'pending' | 'done' | 'error';
    created_at: string;
}

export interface DocumentChunk {
    id: string;
    document_id: string;
    chunk_index: number;
    title_hint: string;
    text: string;
    tokens_est: number;
}

export interface LibraryContext {
    documents: LibraryDocument[];
    chunks: DocumentChunk[];
    totalTokens: number;
    combinedText: string;
}

/**
 * Fetch danh sách documents của library
 */
export async function fetchLibraryDocuments(libraryId: string): Promise<LibraryDocument[]> {
    const res = await api.get(`/documents/${libraryId}`);
    if (!res.ok) {
        console.warn('[lib-documents] Failed to fetch documents:', res.status);
        return [];
    }
    const data = await res.json();
    return data.documents || [];
}

/**
 * Fetch chunks của một document
 */
export async function fetchDocumentChunks(documentId: string): Promise<DocumentChunk[]> {
    const res = await api.get(`/documents/${documentId}/chunks`);
    if (!res.ok) {
        console.warn('[lib-documents] Failed to fetch chunks for', documentId);
        return [];
    }
    const data = await res.json();
    return data.chunks || [];
}

/**
 * Fetch toàn bộ context của library (documents + chunks)
 * Chú thích: Dùng để inject vào prompt AI
 */
export async function fetchLibraryContext(libraryId: string): Promise<LibraryContext> {
    // Lấy danh sách documents
    const documents = await fetchLibraryDocuments(libraryId);

    // Filter chỉ lấy documents đã extract xong
    const readyDocs = documents.filter(d => d.extracted_text_status === 'done');

    if (readyDocs.length === 0) {
        return {
            documents,
            chunks: [],
            totalTokens: 0,
            combinedText: '',
        };
    }

    // Fetch chunks của tất cả documents
    const allChunks: DocumentChunk[] = [];
    for (const doc of readyDocs) {
        const chunks = await fetchDocumentChunks(doc.id);
        allChunks.push(...chunks);
    }

    // Tính tổng tokens và combine text
    const totalTokens = allChunks.reduce((sum, c) => sum + c.tokens_est, 0);

    // Combine text với separator rõ ràng
    const combinedText = allChunks
        .sort((a, b) => {
            // Sort by document, then by chunk index
            if (a.document_id !== b.document_id) {
                return a.document_id.localeCompare(b.document_id);
            }
            return a.chunk_index - b.chunk_index;
        })
        .map(c => {
            const header = c.title_hint ? `[${c.title_hint}]\n` : '';
            return header + c.text;
        })
        .join('\n\n---\n\n');

    console.info('[lib-documents] Context loaded:', {
        documentsCount: readyDocs.length,
        chunksCount: allChunks.length,
        totalTokens,
        textLength: combinedText.length,
    });

    return {
        documents,
        chunks: allChunks,
        totalTokens,
        combinedText,
    };
}

/**
 * Check xem library có đủ tài liệu để tạo đề không
 */
export function validateLibraryForExamCreation(documents: LibraryDocument[]): {
    isValid: boolean;
    message: string;
} {
    if (documents.length === 0) {
        return {
            isValid: false,
            message: 'Thư viện chưa có tài liệu. Vui lòng upload SGK hoặc sách bài tập để AI có thể tạo đề chuẩn xác.',
        };
    }

    const readyDocs = documents.filter(d => d.extracted_text_status === 'done');

    if (readyDocs.length === 0) {
        const pendingCount = documents.filter(d => d.extracted_text_status === 'pending').length;
        if (pendingCount > 0) {
            return {
                isValid: false,
                message: `Có ${pendingCount} tài liệu đang được xử lý. Vui lòng đợi hoàn tất.`,
            };
        }
        return {
            isValid: false,
            message: 'Các tài liệu đã upload gặp lỗi khi xử lý. Vui lòng thử upload lại.',
        };
    }

    return {
        isValid: true,
        message: `Đã sẵn sàng với ${readyDocs.length} tài liệu.`,
    };
}
