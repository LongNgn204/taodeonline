// Chú thích: Types cơ bản cho hệ thống, dùng chung giữa frontend và backend

// ===== User & Auth =====
export interface User {
    id: string;
    email: string;
    createdAt: string;
}

export interface AuthSession {
    userId: string;
    email: string;
    exp: number; // Unix timestamp
}

// ===== Library (Bộ sách) =====
export interface Library {
    id: string;
    userId: string;
    subject: string; // Toán, Lý, Hoá, Sinh, Văn, Sử, Địa, GDCD, Tiếng Anh, ...
    grade: number; // 1-12
    bookset?: string; // Cánh diều, Kết nối tri thức, Chân trời sáng tạo
    term?: number; // 1 hoặc 2
    durationMinutes: number; // 60 phút mặc định
    createdAt: string;
}

// ===== Document =====
export type DocumentFileType = 'pdf' | 'docx' | 'xlsx';
export type ExtractionStatus = 'pending' | 'done' | 'error';

export interface Document {
    id: string;
    libraryId: string;
    userId: string;
    filename: string;
    fileType: DocumentFileType;
    r2Key: string;
    extractedTextStatus: ExtractionStatus;
    createdAt: string;
}

// ===== Document Chunk cho RAG =====
export interface DocChunk {
    id: string;
    documentId: string;
    chunkIndex: number;
    titleHint?: string;
    text: string;
    tokensEst?: number;
    createdAt: string;
}

// ===== Mức độ nhận thức theo CV 7991 =====
export type CognitiveLevel = 'NB' | 'TH' | 'VD'; // Nhận biết, Thông hiểu, Vận dụng

// ===== Loại câu hỏi =====
export type QuestionType = 'MCQ' | 'TF' | 'SHORT' | 'ESSAY';

// ===== Exam =====
export type ExamStatus = 'draft' | 'final';

export interface Exam {
    id: string;
    libraryId: string;
    userId: string;
    title: string;
    matrixJson: string; // JSON string của Matrix
    examJson?: string; // JSON string của ExamContent
    answerKeyJson?: string;
    status: ExamStatus;
    createdAt: string;
    updatedAt: string;
}

// ===== Export =====
export type ExportType = 'matrix_xlsx' | 'exam_docx' | 'answer_docx';

export interface Export {
    id: string;
    examId: string;
    userId: string;
    type: ExportType;
    r2Key: string;
    createdAt: string;
}

// ===== Curriculum Outcomes (CTGDPT 2018) =====
export interface CurriculumOutcome {
    id: string;
    subject: string;
    grade: number;
    topic: string;
    outcome: string; // Yêu cầu cần đạt
    unit: string; // Đơn vị kiến thức
    createdAt?: string;
}

// ===== AI Provider =====
export type AIProvider =
    | 'openai'
    | 'anthropic'
    | 'google'
    | 'groq'
    | 'mistral'
    | 'deepseek'
    | 'cohere'
    | 'together';

export interface AIModel {
    provider: AIProvider;
    model: string;
    displayName: string;
    maxTokens: number;
    supportsJson: boolean;
}

// ===== Danh sách môn học và lớp =====
export const SUBJECTS = [
    'Toán',
    'Vật lý',
    'Hoá học',
    'Sinh học',
    'Ngữ văn',
    'Lịch sử',
    'Địa lý',
    'GDCD',
    'Tiếng Anh',
    'Tin học',
    'Công nghệ',
] as const;

export const GRADES = [6, 7, 8, 9, 10, 11, 12] as const; // THCS + THPT

export const BOOKSETS = ['Cánh diều', 'Kết nối tri thức', 'Chân trời sáng tạo'] as const;
