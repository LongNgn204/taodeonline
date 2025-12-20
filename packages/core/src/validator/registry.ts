import { IExamValidator } from './base';
import { TN2025Validator } from './tn2025';

export class ValidatorRegistry {
    private static validators: Record<string, IExamValidator> = {
        'GRADUATION_2025': new TN2025Validator(),
        // 'SCHOOL_ASSESSMENT' -> to be implemented
    };

    static get(mode: string): IExamValidator {
        const v = this.validators[mode];
        if (!v) throw new Error(`Validator for mode ${mode} not found`);
        return v;
    }
}
