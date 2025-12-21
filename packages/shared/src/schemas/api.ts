// Chú thích: Schemas cho API request/response validation

import { z } from 'zod';
import { ExamFormIdSchema } from './form.js';

// ===== Auth =====
export const RegisterRequestSchema = z.object({
    email: z.string().email('Email không hợp lệ'),
    password: z.string().min(8, 'Mật khẩu phải ít nhất 8 ký tự'),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

// ===== Library =====
export const CreateLibraryRequestSchema = z.object({
    subject: z.string().min(1),
    grade: z.number().int().min(1).max(12),
    bookset: z.string().optional(),
    term: z.number().int().min(1).max(2).optional(),
    durationMinutes: z.number().int().positive().default(60),
});
export type CreateLibraryRequest = z.infer<typeof CreateLibraryRequestSchema>;

// ===== Document Upload =====
export const CompleteUploadRequestSchema = z.object({
    documentId: z.string(),
    extractedText: z.string(),
    metadata: z
        .object({
            pageCount: z.number().optional(),
            wordCount: z.number().optional(),
        })
        .optional(),
});
export type CompleteUploadRequest = z.infer<typeof CompleteUploadRequestSchema>;

// ===== AI Generation =====
export const AIProviderSchema = z.enum([
    'openai',
    'anthropic',
    'google',
    'groq',
    'mistral',
    'deepseek',
    'cohere',
    'together',
    'openrouter',
    'perplexity',
]);

export const ExamModeSchema = z.enum(['SCHOOL_ASSESSMENT', 'GRADUATION_2025']);

export const GenerateMatrixRequestSchema = z.object({
    libraryId: z.string(),
    scope: z.array(z.string()).optional(), // Phạm vi chương/bài
    numTopics: z.number().int().min(2).max(15).default(4),
    policyPackId: z.string().optional(),
    examMode: ExamModeSchema.default('SCHOOL_ASSESSMENT'),
    provider: AIProviderSchema,
    model: z.string(),
    apiKey: z.string().min(10), // User's API key
});
export type GenerateMatrixRequest = z.infer<typeof GenerateMatrixRequestSchema>;

export const GenerateExamRequestSchema = z.object({
    libraryId: z.string(),
    matrixJson: z.string(), // JSON string của matrix
    policyPackId: z.string().optional(),
    examMode: ExamModeSchema.default('SCHOOL_ASSESSMENT'),
    provider: AIProviderSchema,
    model: z.string(),
    apiKey: z.string().min(10),
});
export type GenerateExamRequest = z.infer<typeof GenerateExamRequestSchema>;

export const RegenerateQuestionRequestSchema = z.object({
    questionId: z.string(),
    constraints: z.string().optional(), // Yêu cầu bổ sung
    provider: AIProviderSchema,
    model: z.string(),
    apiKey: z.string().min(10),
});
export type RegenerateQuestionRequest = z.infer<typeof RegenerateQuestionRequestSchema>;

// ===== Exam CRUD =====
export const SaveExamRequestSchema = z.object({
    libraryId: z.string(),
    title: z.string().min(1),
    matrixJson: z.string(),
    examJson: z.string().optional(),
    answerKeyJson: z.string().optional(),
    formId: ExamFormIdSchema.optional(),
    status: z.enum(['draft', 'final']).default('draft'),
});
export type SaveExamRequest = z.infer<typeof SaveExamRequestSchema>;

// ===== Export =====
export const ExportRequestSchema = z.object({
    format: z.enum(['matrix_xlsx', 'exam_docx', 'answer_docx', 'exam_latex']),
});
export type ExportRequest = z.infer<typeof ExportRequestSchema>;

// ===== Grading =====
export const GradeRequestSchema = z.object({
    answers: z.array(
        z.object({
            questionId: z.string(),
            answer: z.string(),
        })
    ),
});
export type GradeRequest = z.infer<typeof GradeRequestSchema>;

export const GradeResponseSchema = z.object({
    totalScore: z.number(),
    maxScore: z.literal(10),
    breakdown: z.array(
        z.object({
            questionId: z.string(),
            earned: z.number(),
            max: z.number(),
            isCorrect: z.boolean(),
            feedback: z.string().optional(),
        })
    ),
});
export type GradeResponse = z.infer<typeof GradeResponseSchema>;

// ===== Common API Response =====
export const ApiErrorSchema = z.object({
    error: z.string(),
    message: z.string(),
    details: z.unknown().optional(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
