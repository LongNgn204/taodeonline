import { z } from 'zod';

export const QuestionSchema = z.object({
    id: z.string(),
    content: z.string(),
    level: z.enum(['NB', 'TH', 'VD', 'VDC']).optional(),
    choices: z.array(z.string()).optional(),
    subQuestions: z.array(z.object({
        id: z.string(),
        content: z.string(),
        isCorrect: z.boolean().optional()
    })).optional()
});

export const ExamPartSchema = z.object({
    name: z.string(),
    type: z.enum(['MCQ_4', 'TF_4', 'SHORT_ANS', 'ESSAY']),
    questions: z.array(QuestionSchema)
});

export const ExamCandidateSchema = z.object({
    subject: z.string(),
    duration: z.number(),
    totalQuestions: z.number(),
    parts: z.array(ExamPartSchema)
});

export type ExamCandidateSchemaType = z.infer<typeof ExamCandidateSchema>;
