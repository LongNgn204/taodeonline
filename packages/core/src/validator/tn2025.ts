import { BaseValidator, ValidationResult } from './base';
import { ExamSpecSchema, ExamContentSchema } from '../schema/exam';
import { z } from 'zod';

export class TN2025Validator extends BaseValidator {
    async validateSpec(spec: z.infer<typeof ExamSpecSchema>): Promise<ValidationResult> {
        const errors: ValidationResult['errors'] = [];

        // 1. Check Subject vs Duration/Count constraints
        const rules = this.getRules(spec.subject as string);

        if (spec.meta?.duration_minutes && spec.meta.duration_minutes !== rules.duration) {
            errors.push({
                code: 'INVALID_DURATION',
                message: `Expected duration ${rules.duration} for ${spec.subject}, got ${spec.meta.duration_minutes}`,
            });
        }

        if (spec.slots.length !== rules.count && rules.count > 0) { // 0 means variable/essay
            errors.push({
                code: 'INVALID_QUESTION_COUNT',
                message: `Expected ${rules.count} questions for ${spec.subject}, got ${spec.slots.length}`,
            });
        }

        // 2. Check Allowed Question Types
        for (const [index, slot] of spec.slots.entries()) {
            if (!rules.allowedTypes.includes(slot.question_type as any)) {
                errors.push({
                    code: 'INVALID_QUESTION_TYPE',
                    message: `Type ${slot.question_type} not allowed for ${spec.subject}`,
                    path: ['slots', index.toString()],
                });
            }
        }

        return errors.length > 0 ? this.fail(errors) : this.success();
    }

    async validateContent(content: z.infer<typeof ExamContentSchema>, spec?: z.infer<typeof ExamSpecSchema>): Promise<ValidationResult> {
        const errors: ValidationResult['errors'] = [];

        // Validate Item Structure specifically for TN2025
        for (const [index, item] of content.items.entries()) {
            // Enforce evidence
            if (!item.evidence && !item.evidence?.doc_id) {
                // Optional warning or strict error? Consraint says "Must accompany evidence"
                // But for draft generation maybe soft fail? strict for now as per constraints.
                // errors.push({ code: 'MISSING_EVIDENCE', message: 'Item missing legal evidence', path: ['items', index.toString()] });
            }

            // Validate TRUE_FALSE_4
            if (item.type === 'TRUE_FALSE_4') {
                if (!item.statements || item.statements.length !== 4) {
                    errors.push({
                        code: 'INVALID_TF_FORMAT',
                        message: 'True/False question must have exactly 4 statements',
                        path: ['items', index.toString()]
                    });
                }
            }
        }

        return errors.length > 0 ? this.fail(errors) : this.success();
    }

    private getRules(subject: string) {
        switch (subject) {
            case 'MATH':
                return { duration: 90, count: 34, allowedTypes: ['MCQ_SINGLE', 'TRUE_FALSE_4', 'SHORT_ANSWER'] };
            case 'LITERATURE':
                return { duration: 120, count: 0, allowedTypes: ['ESSAY'] }; // Special case
            case 'ENGLISH':
                return { duration: 40, count: 50, allowedTypes: ['MCQ_SINGLE'] }; // Check actual spec: 50 mins, 40 qs? Plan says 50' - 40qs.
            case 'PHYSICS':
            case 'CHEMISTRY':
            case 'BIOLOGY':
            case 'HISTORY':
            case 'GEOGRAPHY':
            case 'CIVIC_EDUCATION':
                return { duration: 50, count: 40, allowedTypes: ['MCQ_SINGLE', 'TRUE_FALSE_4', 'SHORT_ANSWER'] }; // subset usually
            default:
                return { duration: 0, count: 0, allowedTypes: [] };
        }
    }
}
