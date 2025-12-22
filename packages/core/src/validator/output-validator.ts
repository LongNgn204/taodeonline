// Chú thích: Matrix & Exam Validator
// Validate output của AI agents theo policy constraints
// H3: Server-side validation

import { z } from 'zod';

// ===== Zod Schemas =====

/**
 * Schema cho một unit trong matrix
 */
const UnitSchema = z.object({
    id: z.string(),
    name: z.string(),
    MCQ: z.object({ NB: z.number(), TH: z.number(), VD: z.number() }).optional(),
    TF: z.object({ NB: z.number(), TH: z.number(), VD: z.number() }).optional(),
    SHORT: z.object({ NB: z.number(), TH: z.number(), VD: z.number() }).optional(),
    ESSAY: z.object({ NB: z.number(), TH: z.number(), VD: z.number() }).optional(),
});

/**
 * Schema cho topic trong matrix
 */
const TopicSchema = z.object({
    id: z.string(),
    name: z.string(),
    units: z.array(UnitSchema),
    percentScore: z.number().min(0).max(100),
});

/**
 * Schema cho Matrix output
 */
export const MatrixSchema = z.object({
    version: z.string().optional(),
    subject: z.string(),
    grade: z.number(),
    duration: z.number(),
    totalScore: z.number(),
    topics: z.array(TopicSchema),
    summary: z.object({
        MCQ: z.object({ count: z.number(), points: z.number() }).optional(),
        TF: z.object({ count: z.number(), points: z.number() }).optional(),
        SHORT: z.object({ count: z.number(), points: z.number() }).optional(),
        ESSAY: z.object({ count: z.number(), points: z.number() }).optional(),
        levelPercent: z.object({
            NB: z.number(),
            TH: z.number(),
            VD: z.number(),
        }).optional(),
    }).optional(),
});

/**
 * Schema cho Source citation
 */
const SourceSchema = z.object({
    chunkId: z.string(),
    quote: z.string().optional(),
    docId: z.string().optional(),
});

/**
 * Schema cho Question
 */
const QuestionSchema = z.object({
    id: z.string(),
    content: z.string(),
    level: z.enum(['NB', 'TH', 'VD']),
    options: z.array(z.string()).optional(),
    correctAnswer: z.string().optional(),
    statements: z.array(z.object({
        id: z.string(),
        text: z.string(),
        isTrue: z.boolean(),
    })).optional(),
    explanation: z.string().optional(),
    points: z.number().optional(),
    rubric: z.string().optional(),
    sources: z.array(SourceSchema).optional(),
});

/**
 * Schema cho Exam section
 */
const SectionSchema = z.object({
    id: z.string(),
    title: z.string(),
    type: z.enum(['MCQ', 'TF', 'SHORT', 'ESSAY']),
    questions: z.array(QuestionSchema),
});

/**
 * Schema cho Exam output
 */
export const ExamSchema = z.object({
    title: z.string(),
    subject: z.string(),
    grade: z.number(),
    duration: z.number(),
    sourceMode: z.enum(['from_docs', 'general_knowledge']).optional(),
    sections: z.array(SectionSchema),
});

// ===== Validation Result Types =====

export interface ValidationError {
    code: string;
    message: string;
    field?: string;
    expected?: unknown;
    actual?: unknown;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

// ===== Matrix Validator =====

export interface MatrixConstraints {
    totalScore?: number;
    duration?: number;
    cognitivePercent?: { NB: number; TH: number; VD: number };
    scoreDistribution?: { MCQ: number; TF: number; SHORT: number; ESSAY: number };
}

/**
 * Validate matrix theo policy constraints
 */
export function validateMatrix(
    matrix: unknown,
    constraints: MatrixConstraints = {}
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Validate schema
    const parseResult = MatrixSchema.safeParse(matrix);
    if (!parseResult.success) {
        errors.push({
            code: 'INVALID_SCHEMA',
            message: 'Matrix không đúng schema',
            field: parseResult.error.errors[0]?.path.join('.'),
        });
        return { isValid: false, errors, warnings };
    }

    const data = parseResult.data;

    // 2. Validate tổng % = 100
    const totalPercent = data.topics.reduce((sum, t) => sum + t.percentScore, 0);
    if (totalPercent !== 100) {
        errors.push({
            code: 'INVALID_PERCENT_TOTAL',
            message: `Tổng tỷ lệ % phải = 100`,
            expected: 100,
            actual: totalPercent,
        });
    }

    // 3. Validate totalScore nếu có constraint
    if (constraints.totalScore && data.totalScore !== constraints.totalScore) {
        errors.push({
            code: 'INVALID_TOTAL_SCORE',
            message: `Tổng điểm phải = ${constraints.totalScore}`,
            expected: constraints.totalScore,
            actual: data.totalScore,
        });
    }

    // 4. Validate duration nếu có constraint
    if (constraints.duration && data.duration !== constraints.duration) {
        warnings.push({
            code: 'DURATION_MISMATCH',
            message: `Thời gian nên = ${constraints.duration} phút`,
            expected: constraints.duration,
            actual: data.duration,
        });
    }

    // 5. Validate có ít nhất 1 topic với units
    if (data.topics.length === 0) {
        errors.push({
            code: 'NO_TOPICS',
            message: 'Phải có ít nhất 1 chủ đề',
        });
    }

    for (const topic of data.topics) {
        if (!topic.units || topic.units.length === 0) {
            errors.push({
                code: 'NO_UNITS',
                message: `Chủ đề "${topic.name}" phải có ít nhất 1 đơn vị kiến thức`,
            });
        }
    }

    return { isValid: errors.length === 0, errors, warnings };
}

// ===== Exam Validator =====

export interface ExamConstraints {
    requireSources?: boolean;
    minQuestions?: number;
}

/**
 * Validate exam theo policy constraints
 */
export function validateExam(
    exam: unknown,
    constraints: ExamConstraints = {}
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // 1. Validate schema
    const parseResult = ExamSchema.safeParse(exam);
    if (!parseResult.success) {
        errors.push({
            code: 'INVALID_SCHEMA',
            message: 'Exam không đúng schema',
            field: parseResult.error.errors[0]?.path.join('.'),
        });
        return { isValid: false, errors, warnings };
    }

    const data = parseResult.data;

    // 2. Count total questions
    let totalQuestions = 0;
    for (const section of data.sections) {
        totalQuestions += section.questions.length;
    }

    if (constraints.minQuestions && totalQuestions < constraints.minQuestions) {
        errors.push({
            code: 'INSUFFICIENT_QUESTIONS',
            message: `Phải có ít nhất ${constraints.minQuestions} câu hỏi`,
            expected: constraints.minQuestions,
            actual: totalQuestions,
        });
    }

    // 3. Validate sources nếu requireSources && sourceMode === 'from_docs'
    if (constraints.requireSources || data.sourceMode === 'from_docs') {
        for (const section of data.sections) {
            for (const question of section.questions) {
                if (!question.sources || question.sources.length === 0) {
                    warnings.push({
                        code: 'MISSING_SOURCES',
                        message: `Câu hỏi ${question.id} thiếu sources (sourceMode = from_docs)`,
                        field: `sections.${section.id}.questions.${question.id}.sources`,
                    });
                }
            }
        }
    }

    // 4. Validate mỗi section có câu hỏi
    for (const section of data.sections) {
        if (section.questions.length === 0) {
            warnings.push({
                code: 'EMPTY_SECTION',
                message: `Section "${section.title}" không có câu hỏi`,
            });
        }
    }

    // 5. Validate TF questions có 4 statements
    for (const section of data.sections) {
        if (section.type === 'TF') {
            for (const q of section.questions) {
                if (!q.statements || q.statements.length !== 4) {
                    warnings.push({
                        code: 'TF_STATEMENTS_COUNT',
                        message: `Câu TF ${q.id} nên có 4 mệnh đề`,
                        expected: 4,
                        actual: q.statements?.length || 0,
                    });
                }
            }
        }
    }

    return { isValid: errors.length === 0, errors, warnings };
}
