import { BlueprintSchema } from '../schema/blueprint';
import { z } from 'zod';

export const BLUEPRINT_MATH_2025: z.infer<typeof BlueprintSchema> = {
    id: 'bp_math_2025',
    mode: 'GRADUATION_2025',
    subject: 'MATH',
    total_questions: 34,
    duration_minutes: 90,
    total_score: 10,
    sections: [
        { id: 'S1', title: 'Part 1: MCQ (12 questions)', question_type: 'MCQ_SINGLE', count: 12, score_per_question: 0.25 },
        { id: 'S2', title: 'Part 2: True/False (4 questions)', question_type: 'TRUE_FALSE_4', count: 4, score_per_question: 1.0 }, // Score rule complex
        { id: 'S3', title: 'Part 3: Short Answer (6 questions)', question_type: 'SHORT_ANSWER', count: 6, score_per_question: 0.5 },
    ], // Counts 12+4+6 = 22? Wait plan said 34 total. The example in plan says 34.
    // Let's re-read plan/doc. 
    // "Toán 34 câu": 12 MCQ + 4 TF + 6 SA = 22 questions? No.
    // Actual format from Ministry:
    // Part 1: 12 questions
    // Part 2: 4 questions (each has 4 sub-parts)
    // Part 3: 6 questions
    // Total = 12 + 4 + 6 = 22 items on paper?
    // Wait, Plan says "Toán 34 câu" in line 420.
    // Maybe 12 + (4*4 sub) + 6 = 34? 12 + 16 + 6 = 34. Yes, "lệnh hỏi".
    // But "Blueprints" usually count "Items".
    // I will stick to "Items" in sections, but Validator checks "Total Commands/Questions".
    // Let's set count: 12, 4, 6.
};

export const BLUEPRINT_ENGLISH_2025: z.infer<typeof BlueprintSchema> = {
    id: 'bp_english_2025',
    mode: 'GRADUATION_2025',
    subject: 'ENGLISH',
    total_questions: 40,
    duration_minutes: 50, // Updated 50 mins
    total_score: 10,
    sections: [
        { id: 'S1', title: 'Start', question_type: 'MCQ_SINGLE', count: 40 }
    ]
};
