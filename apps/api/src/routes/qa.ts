// Chú thích: L4 - QA + Guardrails API
// Kiểm tra chất lượng output và an toàn nội dung

import { Hono } from 'hono';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface GuardrailCheck {
    passed: boolean;
    code: string;
    message: string;
    severity: 'error' | 'warning' | 'info';
}

interface QaCheckRequest {
    content: string;
    contentType: 'question' | 'exam' | 'lessonplan' | 'skkn';
    subject?: string;
    grade?: number;
}

// ===== Guardrail Rules =====

const BLOCKED_PATTERNS = [
    // Chính trị nhạy cảm
    /\b(đảng phái|chính trị|biểu tình|phản đối chính quyền)\b/gi,
    // Nội dung bạo lực
    /\b(giết người|bạo lực|tra tấn|tự tử)\b/gi,
    // Nội dung không phù hợp giáo dục
    /\b(cờ bạc|ma túy|rượu bia|thuốc lá)\b/gi,
];

const QUALITY_RULES = {
    minQuestionLength: 20,
    maxQuestionLength: 2000,
    minOptionsForMCQ: 4,
    maxConsecutiveSameAnswer: 3,
};

// ===== Helper Functions =====

function checkContentSafety(content: string): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    for (const pattern of BLOCKED_PATTERNS) {
        if (pattern.test(content)) {
            checks.push({
                passed: false,
                code: 'UNSAFE_CONTENT',
                message: `Phát hiện nội dung không phù hợp: ${pattern.source}`,
                severity: 'error',
            });
        }
    }

    if (checks.length === 0) {
        checks.push({
            passed: true,
            code: 'CONTENT_SAFE',
            message: 'Nội dung an toàn',
            severity: 'info',
        });
    }

    return checks;
}

function checkQuestionQuality(content: string): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    // Độ dài câu hỏi
    if (content.length < QUALITY_RULES.minQuestionLength) {
        checks.push({
            passed: false,
            code: 'QUESTION_TOO_SHORT',
            message: `Câu hỏi quá ngắn (tối thiểu ${QUALITY_RULES.minQuestionLength} ký tự)`,
            severity: 'warning',
        });
    }

    if (content.length > QUALITY_RULES.maxQuestionLength) {
        checks.push({
            passed: false,
            code: 'QUESTION_TOO_LONG',
            message: `Câu hỏi quá dài (tối đa ${QUALITY_RULES.maxQuestionLength} ký tự)`,
            severity: 'warning',
        });
    }

    // Kiểm tra có dấu hỏi không
    if (!content.includes('?') && !content.includes(':')) {
        checks.push({
            passed: false,
            code: 'NO_QUESTION_MARK',
            message: 'Câu hỏi nên có dấu hỏi (?) hoặc dấu hai chấm (:)',
            severity: 'warning',
        });
    }

    if (checks.length === 0) {
        checks.push({
            passed: true,
            code: 'QUALITY_OK',
            message: 'Chất lượng câu hỏi đạt yêu cầu',
            severity: 'info',
        });
    }

    return checks;
}

function checkExamBalance(examJson: string): GuardrailCheck[] {
    const checks: GuardrailCheck[] = [];

    try {
        const exam = JSON.parse(examJson);

        // Kiểm tra phân bố đáp án
        if (exam.sections) {
            let answerCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
            let totalMCQ = 0;

            for (const section of exam.sections) {
                for (const q of section.questions || []) {
                    if (q.type === 'MCQ' && q.answerKey) {
                        answerCounts[q.answerKey] = (answerCounts[q.answerKey] || 0) + 1;
                        totalMCQ++;
                    }
                }
            }

            // Kiểm tra phân bố đều
            if (totalMCQ >= 8) {
                const expected = totalMCQ / 4;
                const tolerance = expected * 0.5; // 50% tolerance

                for (const [key, count] of Object.entries(answerCounts)) {
                    if (Math.abs(count - expected) > tolerance) {
                        checks.push({
                            passed: false,
                            code: 'UNBALANCED_ANSWERS',
                            message: `Đáp án ${key} xuất hiện ${count} lần, nên cân bằng hơn`,
                            severity: 'warning',
                        });
                    }
                }
            }
        }
    } catch {
        checks.push({
            passed: false,
            code: 'INVALID_EXAM_JSON',
            message: 'Không thể parse exam JSON',
            severity: 'error',
        });
    }

    if (checks.length === 0) {
        checks.push({
            passed: true,
            code: 'EXAM_BALANCED',
            message: 'Đề thi cân bằng',
            severity: 'info',
        });
    }

    return checks;
}

// ===== API Endpoints =====

/**
 * POST /qa/check
 * Run all guardrail checks on content
 */
app.post('/check', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<QaCheckRequest>();
    const { content, contentType } = body;

    const allChecks: GuardrailCheck[] = [];

    // 1. Content safety check (always)
    allChecks.push(...checkContentSafety(content));

    // 2. Type-specific checks
    switch (contentType) {
        case 'question':
            allChecks.push(...checkQuestionQuality(content));
            break;
        case 'exam':
            allChecks.push(...checkExamBalance(content));
            break;
        // Add more as needed
    }

    const hasErrors = allChecks.some(c => c.severity === 'error' && !c.passed);

    return c.json({
        passed: !hasErrors,
        checks: allChecks,
        summary: {
            errors: allChecks.filter(c => c.severity === 'error' && !c.passed).length,
            warnings: allChecks.filter(c => c.severity === 'warning' && !c.passed).length,
            passed: allChecks.filter(c => c.passed).length,
        },
    });
});

/**
 * POST /qa/check-safety
 * Quick safety check only
 */
app.post('/check-safety', async (c) => {
    const user = c.get('user');
    if (!user) {
        return c.json({ error: 'unauthorized' }, 401);
    }

    const body = await c.req.json<{ content: string }>();
    const checks = checkContentSafety(body.content);

    return c.json({
        safe: checks.every(c => c.passed),
        checks,
    });
});

/**
 * GET /qa/rules
 * Get current guardrail rules (for UI display)
 */
app.get('/rules', async (c) => {
    return c.json({
        qualityRules: QUALITY_RULES,
        blockedCategories: [
            'Chính trị nhạy cảm',
            'Bạo lực',
            'Nội dung không phù hợp giáo dục',
        ],
    });
});

export { app as qaRoutes };
export default app;
