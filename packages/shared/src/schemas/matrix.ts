// Chú thích: Schema ma trận đề theo policy/blueprint
// Cấu trúc có thể thay đổi theo chế độ (KTĐG/TN 2025)

import { z } from 'zod';

// Mức độ nhận thức
export const CognitiveLevelSchema = z.enum(['NB', 'TH', 'VD']);
export type CognitiveLevelType = z.infer<typeof CognitiveLevelSchema>;

// Loại câu hỏi
export const QuestionTypeSchema = z.enum(['MCQ', 'TF', 'SHORT', 'ESSAY']);
export type QuestionTypeType = z.infer<typeof QuestionTypeSchema>;

// Phân bổ theo mức độ cho mỗi loại câu hỏi
export const LevelDistributionSchema = z.object({
    NB: z.number().int().min(0), // Số câu nhận biết
    TH: z.number().int().min(0), // Số câu thông hiểu
    VD: z.number().int().min(0), // Số câu vận dụng
});
export type LevelDistribution = z.infer<typeof LevelDistributionSchema>;

// Đơn vị kiến thức (nội dung cụ thể trong chủ đề)
export const UnitSchema = z.object({
    id: z.string(),
    name: z.string(), // Tên đơn vị kiến thức
    MCQ: LevelDistributionSchema.optional(), // Trắc nghiệm nhiều lựa chọn
    TF: LevelDistributionSchema.optional(), // Đúng/Sai
    SHORT: LevelDistributionSchema.optional(), // Trả lời ngắn
    ESSAY: LevelDistributionSchema.optional(), // Tự luận
});
export type Unit = z.infer<typeof UnitSchema>;

// Chủ đề/Chương
export const TopicSchema = z.object({
    id: z.string(),
    name: z.string(), // Tên chủ đề/chương
    units: z.array(UnitSchema).min(1),
    percentScore: z.number().min(0).max(100), // Tỷ lệ % điểm
});
export type Topic = z.infer<typeof TopicSchema>;

// Tổng hợp theo loại câu hỏi
export const TypeSummarySchema = z.object({
    count: z.number().int().min(0), // Số câu
    points: z.number().min(0), // Điểm
});

// Ma trận đề hoàn chỉnh theo CV 7991
export const MatrixSchema = z.object({
    version: z.string(), // Semver: matrix-v1.0.0
    subject: z.string(), // Môn học
    grade: z.number().int().min(1).max(12), // Lớp
    duration: z.number().int().positive(), // Thời gian (phút)
    totalScore: z.number().int().positive().default(10), // Tổng điểm (mặc định 10)

    topics: z.array(TopicSchema).min(1).max(6), // 3-4 chủ đề thường

    // Tổng hợp theo CV 7991
    summary: z.object({
        // Trắc nghiệm khách quan: 7 điểm
        MCQ: z.object({ count: z.number(), points: z.number() }), // điểm có thể cấu hình
        TF: z.object({ count: z.number(), points: z.number() }),
        SHORT: z.object({ count: z.number(), points: z.number() }),
        // Tự luận: 3 điểm
        ESSAY: z.object({ count: z.number(), points: z.number() }),

        // Tỷ lệ mức độ nhận thức
        levelPercent: z.object({
            NB: z.number().int().min(0).max(100), // % nhận biết
            TH: z.number().int().min(0).max(100), // % thông hiểu
            VD: z.number().int().min(0).max(100), // % vận dụng
        }),

        // Tổng số câu và điểm chi tiết theo mức độ
        totalByLevel: z.object({
            NB: z.object({ count: z.number(), points: z.number() }),
            TH: z.object({ count: z.number(), points: z.number() }),
            VD: z.object({ count: z.number(), points: z.number() }),
        }),
    }),
});

export type Matrix = z.infer<typeof MatrixSchema>;

// Schema để validate constraints khi tạo ma trận
export const MatrixConstraintsSchema = z.object({
    subject: z.string(),
    grade: z.number().int(),
    duration: z.number().int().default(60),
    scope: z.array(z.string()).optional(), // Phạm vi chương/bài
    numTopics: z.number().int().min(2).max(6).default(4),
});

export type MatrixConstraints = z.infer<typeof MatrixConstraintsSchema>;

// Version prompt cho agent
export const MATRIX_AGENT_VERSION = 'matrix-agent-v1.0.0';
