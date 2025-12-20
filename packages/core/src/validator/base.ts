export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    complianceEvidence?: PolicyEvidence[];
}

export interface ValidationError {
    code: string;
    message: string;
    field?: string;
    severity: 'ERROR' | 'WARNING';
}

export interface PolicyEvidence {
    policyId: string; // e.g., "RULE_TIME_MATH_2025"
    docId: string;    // e.g., "TT17-2025"
    ruleDescription: string;
    status: 'PASSED' | 'FAILED' | 'IGNORED';
}

// Input for validator: The generated exam object
export interface ExamCandidate {
    subject: string;
    duration: number;
    totalQuestions: number;
    parts: ExamPart[];
}

export interface ExamPart {
    name: string; // "Phần I", "Phần II"
    type: 'MCQ_4' | 'TF_4' | 'SHORT_ANS'; // Trắc nghiệm 4 lựa chọn, Đúng/Sai, Trả lời ngắn
    questions: QuestionCandidate[];
}

export interface QuestionCandidate {
    id: string;
    content: string;
    level?: 'NB' | 'TH' | 'VD' | 'VDC';
    choices?: string[]; // For MCQ/TF
    subQuestions?: SubQuestionCandidate[]; // For TF
}

export interface SubQuestionCandidate {
    id: string;
    content: string;
    isCorrect?: boolean; // For TF checking
}

export abstract class BaseValidator {
    abstract validate(exam: ExamCandidate): Promise<ValidationResult>;

    protected createError(message: string, code: string, field?: string, severity: 'ERROR' | 'WARNING' = 'ERROR'): ValidationError {
        return { message, code, field, severity };
    }

    protected createEvidence(policyId: string, docId: string, description: string, status: 'PASSED' | 'FAILED'): PolicyEvidence {
        return { policyId, docId, ruleDescription: description, status };
    }
}
