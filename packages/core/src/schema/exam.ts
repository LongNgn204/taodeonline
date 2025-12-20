import { z } from 'zod';

// --- Common Types ---
export const GradeSchema = z.union([
    z.literal(10),
    z.literal(11),
    z.literal(12),
    z.null(), // For some contexts
]);

export const SubjectSchema = z.enum([
    'MATH',
    'LITERATURE',
    'ENGLISH',
    'PHYSICS',
    'CHEMISTRY',
    'BIOLOGY',
    'HISTORY',
    'GEOGRAPHY',
    'CIVIC_EDUCATION',
]);

// --- Question Types ---
export const QuestionTypeSchema = z.enum([
    'MCQ_SINGLE', // 4 options, 1 correct
    'TRUE_FALSE_4', // 1 stem, 4 sub-statements (each T/F)
    'SHORT_ANSWER', // User inputs number/text
    'ESSAY', // Traditional essay
    'OTHER',
]);

// --- Spec Schema (The input for generation) ---
export const ExamSpecSlotSchema = z.object({
    id: z.string(), // e.g. "Q1", "P1_Q1"
    section: z.string().optional(),
    topic: z.string(),
    competency: z.string().optional(),
    level: z.enum(['RECOGNITION', 'COMPREHENSION', 'APPLICATION', 'HIGH_APPLICATION']).optional(),
    question_type: QuestionTypeSchema,
    constraints: z.record(z.any()).optional(), // Extra constraints
});

export const ExamSpecSchema = z.object({
    mode: z.enum(['SCHOOL_ASSESSMENT', 'GRADUATION_2025']),
    subject: SubjectSchema,
    grade: GradeSchema,
    pack_id: z.string().optional(),
    blueprint_id: z.string().optional(),
    slots: z.array(ExamSpecSlotSchema),
    meta: z.object({
        duration_minutes: z.number().optional(),
        total_score: z.number().optional(),
    }).optional(),
});

// --- Content Schema (The output of generation) ---
export const MCQOptionSchema = z.object({
    id: z.string(), // "A", "B", "C", "D"
    content: z.string(),
    is_correct: z.boolean().optional(), // In generated content, this might be hidden or separate
});

export const TrueFalseStatementSchema = z.object({
    id: z.string(),
    content: z.string(),
    is_correct: z.boolean(),
});

export const ItemContentSchema = z.object({
    id: z.string(), // matches slot id
    stem: z.string(), // The question text / main context
    type: QuestionTypeSchema,
    options: z.array(MCQOptionSchema).optional(), // For MCQ
    statements: z.array(TrueFalseStatementSchema).optional(), // For T/F
    correct_answer: z.string().optional(), // For Short Answer or just key
    explanation: z.string().optional(),
    rubric: z.any().optional(), // For Essay
    evidence: z.object({
        rule_id: z.string().optional(),
        doc_id: z.string().optional(),
        chunk_coords: z.string().optional(), // "page:1;L10-20"
    }).optional(),
});

export const ExamContentSchema = z.object({
    spec_id: z.string().optional(),
    items: z.array(ItemContentSchema),
});
