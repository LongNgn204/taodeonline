import { z } from 'zod';
import { QuestionTypeSchema, SubjectSchema } from './exam';

// --- Blueprint Schema ---
// Defines the FIXED structure (Skeleton) of an exam
export const BlueprintSectionSchema = z.object({
    id: z.string(),
    title: z.string(),
    question_type: QuestionTypeSchema.optional(), // If whole section is same type
    count: z.number(), // Number of questions in this section
    score_per_question: z.number().optional(),
    item_ids: z.array(z.string()).optional(), // Explicit IDs like "Q1"..."Q12"
});

export const BlueprintSchema = z.object({
    id: z.string(),
    mode: z.enum(['SCHOOL_ASSESSMENT', 'GRADUATION_2025']),
    subject: SubjectSchema,
    total_questions: z.number(),
    duration_minutes: z.number(),
    total_score: z.number().default(10),
    sections: z.array(BlueprintSectionSchema),
    rules: z.object({
        allowed_types: z.array(QuestionTypeSchema),
        distribution: z.record(z.any()).optional(), // e.g. difficulty distribution
    }).optional(),
});
