// Chú thích: Schema đề thi với citations nguồn tài liệu
// Mỗi câu hỏi phải có trích dẫn từ chunks để chống hallucination

import { z } from 'zod';
import { CognitiveLevelSchema, QuestionTypeSchema } from './matrix.js';

// Nguồn tham chiếu từ tài liệu upload
export const QuestionSourceSchema = z.object({
    chunkId: z.string(),
    quote: z.string(), // Trích đoạn gốc từ tài liệu
});
export type QuestionSource = z.infer<typeof QuestionSourceSchema>;

// Option cho câu MCQ
export const MCQOptionSchema = z.object({
    label: z.string(), // A, B, C, D
    content: z.string(),
});
export type MCQOption = z.infer<typeof MCQOptionSchema>;

// Ý trong câu Đúng/Sai (4 ý mỗi câu theo CV 7991)
export const TFItemSchema = z.object({
    id: z.string(), // a, b, c, d
    statement: z.string(),
    isTrue: z.boolean(),
});
export type TFItem = z.infer<typeof TFItemSchema>;

// Câu hỏi chung
export const QuestionSchema = z.object({
    id: z.string(),
    type: QuestionTypeSchema,
    level: CognitiveLevelSchema,
    topicId: z.string(),
    unitId: z.string(),
    prompt: z.string(), // Nội dung câu hỏi

    // Dành cho MCQ
    options: z.array(MCQOptionSchema).length(4).optional(),

    // Dành cho True/False (4 ý theo CV 7991)
    tfItems: z.array(TFItemSchema).length(4).optional(),

    // Đáp án
    answerKey: z.string(), // MCQ: "A", TF: "ĐSĐS", SHORT: "giá trị", ESSAY: rubric

    // Hướng dẫn giải (optional)
    solution: z.string().optional(),

    // Điểm cho câu này
    points: z.number().positive(),

    // Citations bắt buộc - chống hallucination
    sources: z.array(QuestionSourceSchema).min(1),
});
export type Question = z.infer<typeof QuestionSchema>;

// Section trong đề thi (theo phần)
export const ExamSectionSchema = z.object({
    type: QuestionTypeSchema,
    title: z.string(), // "Phần I. TRẮC NGHIỆM NHIỀU LỰA CHỌN"
    instructions: z.string().optional(), // Hướng dẫn làm bài
    questions: z.array(QuestionSchema),
    totalPoints: z.number(),
});
export type ExamSection = z.infer<typeof ExamSectionSchema>;

// Đề thi hoàn chỉnh
export const ExamContentSchema = z.object({
    version: z.string(), // Semver: exam-v1.0.0
    title: z.string(), // "ĐỀ KIỂM TRA ĐỊNH KỲ"
    subject: z.string(),
    grade: z.number().int(),
    duration: z.number().int(), // phút
    sections: z.array(ExamSectionSchema),
    totalScore: z.literal(10),
    createdAt: z.string(),
    matrixVersion: z.string(), // Link đến version ma trận đã dùng
});
export type ExamContent = z.infer<typeof ExamContentSchema>;

// Đáp án và hướng dẫn chấm
export const AnswerKeySchema = z.object({
    examId: z.string(),
    answers: z.array(
        z.object({
            questionId: z.string(),
            type: QuestionTypeSchema,
            correctAnswer: z.string(),
            points: z.number(),
            rubric: z.string().optional(), // Hướng dẫn chấm chi tiết cho tự luận
        })
    ),
    createdAt: z.string(),
});
export type AnswerKey = z.infer<typeof AnswerKeySchema>;

// Version prompt cho agent
export const EXAM_AGENT_VERSION = 'exam-agent-v1.0.0';
