// Chú thích: Schema cho Policy Document - đại diện một văn bản pháp lý về KTĐG
// Hỗ trợ hierarchy: Bộ (MOE) → Sở (DOE) → Trường (School)

import { z } from 'zod';

// Cơ quan ban hành với precedence (số lớn hơn = ưu tiên cao hơn)
export const IssuerSchema = z.enum(['MOE', 'DOE', 'School']);
export type Issuer = z.infer<typeof IssuerSchema>;

export const ISSUER_PRECEDENCE: Record<Issuer, number> = {
    MOE: 10,    // Bộ GD&ĐT - baseline
    DOE: 20,    // Sở GD&ĐT - có thể override
    School: 30, // Trường - ưu tiên cao nhất
};

// Phạm vi áp dụng
export const ScopeSchema = z.enum(['THCS', 'THPT', 'BOTH']);
export type Scope = z.infer<typeof ScopeSchema>;

// Mode sử dụng
export const PolicyModeSchema = z.enum([
    'curriculum',           // CTGDPT - chương trình
    'school_assessment',    // KTĐG trong trường
    'graduation_exam',      // Thi TN THPT
]);
export type PolicyMode = z.infer<typeof PolicyModeSchema>;

// Loại câu hỏi được phép
export const QuestionTypeEnumSchema = z.enum(['MCQ', 'TF', 'SHORT', 'ESSAY']);
export type QuestionTypeEnum = z.infer<typeof QuestionTypeEnumSchema>;

// Phân bổ điểm theo loại câu hỏi
export const ScoreDistributionSchema = z.object({
    MCQ: z.number().min(0).optional(),
    TF: z.number().min(0).optional(),
    SHORT: z.number().min(0).optional(),
    ESSAY: z.number().min(0).optional(),
});
export type ScoreDistribution = z.infer<typeof ScoreDistributionSchema>;

// Phân bổ mức độ nhận thức (%)
export const CognitiveLevelDistSchema = z.object({
    NB: z.number().min(0).max(100), // Nhận biết
    TH: z.number().min(0).max(100), // Thông hiểu
    VD: z.number().min(0).max(100), // Vận dụng
});
export type CognitiveLevelDist = z.infer<typeof CognitiveLevelDistSchema>;

// Constraints - ràng buộc từ văn bản
export const PolicyConstraintsSchema = z.object({
    // Thời gian làm bài theo môn (phút)
    duration: z.object({
        by_subject: z.record(z.string(), z.number()).optional(),
        default: z.number().optional(),
    }).optional(),

    // Số câu hỏi theo môn
    question_counts: z.object({
        by_subject: z.record(z.string(), z.number()).optional(),
        default: z.number().optional(),
    }).optional(),

    // Phân bổ điểm theo loại câu
    score_distribution: ScoreDistributionSchema.optional(),

    // Tổng điểm
    total_score: z.number().default(10),

    // Tỷ lệ mức độ nhận thức
    cognitive_levels: CognitiveLevelDistSchema.optional(),
});
export type PolicyConstraints = z.infer<typeof PolicyConstraintsSchema>;

// Question type rules
export const QuestionTypeRulesSchema = z.object({
    // Các loại câu hỏi được phép
    allowed: z.array(QuestionTypeEnumSchema),

    // Số ý trong câu Đúng/Sai (CV7991: 4 ý)
    tf_items_count: z.number().int().min(2).max(6).optional(),

    // Format câu trả lời ngắn
    short_answer_format: z.enum(['number', 'text', 'expression']).optional(),
});
export type QuestionTypeRules = z.infer<typeof QuestionTypeRulesSchema>;

// Policy Rules - tổng hợp các quy tắc
export const PolicyRulesSchema = z.object({
    constraints: PolicyConstraintsSchema,
    question_types: QuestionTypeRulesSchema,
    matrix_template: z.unknown().optional(), // Template ma trận nếu có
});
export type PolicyRules = z.infer<typeof PolicyRulesSchema>;

// Evidence - trích dẫn nguồn từ văn bản
export const EvidenceRefSchema = z.object({
    chunkId: z.string(),
    page: z.number().optional(),
    quote: z.string(), // Trích đoạn gốc
});
export type EvidenceRef = z.infer<typeof EvidenceRefSchema>;

// Policy Document - một văn bản pháp lý
export const PolicyDocumentSchema = z.object({
    id: z.string(),
    code: z.string(), // "TT32-2018", "CV7991-2024"
    title: z.string(),
    issuer: IssuerSchema,
    issuedDate: z.string(), // ISO date
    effectiveFrom: z.string(),
    effectiveTo: z.string().optional(), // null = vẫn còn hiệu lực
    scope: z.array(ScopeSchema),
    mode: PolicyModeSchema,
    rules: PolicyRulesSchema,
    evidenceRefs: z.array(EvidenceRefSchema).optional(),
    summary: z.string().optional(), // Tóm tắt cho UI
});
export type PolicyDocument = z.infer<typeof PolicyDocumentSchema>;

// Policy Pack - gói nhiều policies đã merge
export const PolicyPackSchema = z.object({
    id: z.string(),
    name: z.string(),
    mode: PolicyModeSchema,
    scope: ScopeSchema,
    policyIds: z.array(z.string()), // IDs theo thứ tự precedence
    resolvedRules: PolicyRulesSchema, // Rules đã merge
    conflicts: z.array(z.object({
        field: z.string(),
        values: z.array(z.unknown()),
        resolution: z.string(),
    })).optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type PolicyPack = z.infer<typeof PolicyPackSchema>;

// Version để tracking
export const POLICY_SCHEMA_VERSION = 'policy-v1.0.0';
