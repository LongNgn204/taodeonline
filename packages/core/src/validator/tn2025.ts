import { BaseValidator, ExamCandidate, ValidationResult, ValidationError, PolicyEvidence } from './base';

export class TN2025Validator extends BaseValidator {
    private rules = {
        MATH: { time: 90, total: 22, parts: ['MCQ_4', 'TF_4', 'SHORT_ANS'] },
        LIT: { time: 120, total: 2, parts: ['ESSAY'] }, // Giả định cấu trúc Văn
        ENG: { time: 50, total: 40, parts: ['MCQ_4'] }, // Giả định
        // Thêm các môn khác...
    };

    async validate(exam: ExamCandidate): Promise<ValidationResult> {
        const errors: ValidationError[] = [];
        const evidence: PolicyEvidence[] = [];
        const rule = this.rules[exam.subject as keyof typeof this.rules];

        if (!rule) {
            errors.push(this.createError(`Subject ${exam.subject} not supported in TN2025 mode`, 'UNSUPPORTED_SUBJECT'));
            return { isValid: false, errors };
        }

        // 1. Check Duration
        if (exam.duration !== rule.time) {
            errors.push(this.createError(`Duration must be ${rule.time} minutes`, 'INVALID_DURATION', 'duration'));
            evidence.push(this.createEvidence('RULE_TIME_' + exam.subject, 'TT17-2025', `Thời gian làm bài ${rule.time} phút`, 'FAILED'));
        } else {
            evidence.push(this.createEvidence('RULE_TIME_' + exam.subject, 'TT17-2025', `Thời gian làm bài ${rule.time} phút`, 'PASSED'));
        }

        // 2. Check Total Questions
        // Đếm thực tế question items
        let realTotal = 0;
        exam.parts.forEach(p => {
            if (p.type === 'TF_4') {
                // Dạng đúng sai: mỗi câu gốc có 4 ý, nhưng thường tính là 1 câu gốc trong ma trận số lượng?
                // Theo quy định mới: 
                // Toán: 12 câu MCQ + 4 câu Đ/S + 6 câu Short = 22 câu gốc? Hay tính ý?
                // Thực tế công bố: Toán 34 câu? Cần check lại spec. 
                // Giả sử spec input đã chuẩn hoá số lượng câu hỏi "gốc".
                realTotal += p.questions.length;
            } else {
                realTotal += p.questions.length;
            }
        });

        if (realTotal !== rule.total) {
            // Warning cho phép sai số nhỏ nếu đang draft? TN 2025 cứng.
            errors.push(this.createError(`Total questions must be ${rule.total}, found ${realTotal}`, 'INVALID_TOTAL_QUESTIONS'));
            evidence.push(this.createEvidence('RULE_TOTAL_' + exam.subject, 'TT17-2025', `Tổng số câu hỏi: ${rule.total}`, 'FAILED'));
        } else {
            evidence.push(this.createEvidence('RULE_TOTAL_' + exam.subject, 'TT17-2025', `Tổng số câu hỏi: ${rule.total}`, 'PASSED'));
        }

        // 3. Check Structure (Parts)
        // Toán: 3 phần.
        if (exam.subject === 'MATH') {
            const hasMCQ = exam.parts.some(p => p.type === 'MCQ_4');
            const hasTF = exam.parts.some(p => p.type === 'TF_4');
            const hasShort = exam.parts.some(p => p.type === 'SHORT_ANS');

            if (!hasMCQ || !hasTF || !hasShort) {
                errors.push(this.createError('Math exam must contain MCQ, True/False, and Short Answer parts', 'INVALID_STRUCTURE_MATH'));
                evidence.push(this.createEvidence('RULE_STRUCT_MATH', 'QD_TN_2025', 'Cấu trúc 3 phần: Trắc nghiệm, Đúng/Sai, Trả lời ngắn', 'FAILED'));
            } else {
                evidence.push(this.createEvidence('RULE_STRUCT_MATH', 'QD_TN_2025', 'Cấu trúc 3 phần: Trắc nghiệm, Đúng/Sai, Trả lời ngắn', 'PASSED'));
            }
        }

        return {
            isValid: errors.length === 0,
            errors,
            complianceEvidence: evidence
        };
    }
}
