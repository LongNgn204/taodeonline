import { ExamContentSchema, ExamSpecSchema } from '../schema/exam';
import { z } from 'zod';

export interface ValidationResult {
    isValid: boolean;
    errors: Array<{
        code: string;
        message: string;
        path?: string[];
    }>;
}

export interface IExamValidator {
    validateSpec(spec: z.infer<typeof ExamSpecSchema>): Promise<ValidationResult>;
    validateContent(content: z.infer<typeof ExamContentSchema>, spec?: z.infer<typeof ExamSpecSchema>): Promise<ValidationResult>;
}

export abstract class BaseValidator implements IExamValidator {
    abstract validateSpec(spec: z.infer<typeof ExamSpecSchema>): Promise<ValidationResult>;
    abstract validateContent(content: z.infer<typeof ExamContentSchema>, spec?: z.infer<typeof ExamSpecSchema>): Promise<ValidationResult>;

    protected success(): ValidationResult {
        return { isValid: true, errors: [] };
    }

    protected fail(errors: ValidationResult['errors']): ValidationResult {
        return { isValid: false, errors };
    }
}
