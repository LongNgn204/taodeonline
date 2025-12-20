import { TN2025Validator } from '../src/validator/tn2025';
import { ExamSpecSchema, ExamContentSchema } from '../src/schema/exam';

describe('TN2025Validator', () => {
    const validator = new TN2025Validator();

    const validMathSpec = {
        mode: 'GRADUATION_2025',
        subject: 'MATH',
        grade: 12,
        meta: { duration_minutes: 90 },
        slots: Array(34).fill({ // 34 questions
            id: 'Q', topic: 'Algorithm', question_type: 'MCQ_SINGLE'
        }).map((s, i) => ({ ...s, id: `Q${i + 1}`, question_type: i < 12 ? 'MCQ_SINGLE' : (i < 16 ? 'TRUE_FALSE_4' : 'SHORT_ANSWER') }))
        // 12 MCQ, 4 TF, 18 SA (Total 34). Wait.
        // My default rules say ALLOWED types. It doesn't enforce exact distribution here unless I add that Logic.
        // The validator checks 'allowedTypes'.
    };

    test('validates valid Math spec', async () => {
        const result = await validator.validateSpec(validMathSpec as any);
        expect(result.isValid).toBe(true);
    });

    test('fails invalid duration', async () => {
        const invalidSpec = { ...validMathSpec, meta: { duration_minutes: 60 } }; // Should be 90
        const result = await validator.validateSpec(invalidSpec as any);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_DURATION');
    });

    test('fails invalid question count', async () => {
        const invalidSpec = { ...validMathSpec, slots: [] }; // 0 questions
        const result = await validator.validateSpec(invalidSpec as any);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_QUESTION_COUNT');
    });

    test('fails invalid question type for Math', async () => {
        const invalidSpec = {
            ...validMathSpec,
            slots: [{ id: 'Q1', topic: 'T', question_type: 'ESSAY' }, ...validMathSpec.slots.slice(1)]
        };
        const result = await validator.validateSpec(invalidSpec as any);
        expect(result.isValid).toBe(false);
        expect(result.errors[0].code).toBe('INVALID_QUESTION_TYPE');
    });
});
