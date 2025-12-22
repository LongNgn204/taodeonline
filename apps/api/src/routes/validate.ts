// Chú thích: Validate API routes
// Endpoint validate matrix/exam trước khi save

import { Hono } from 'hono';
import type { Env } from '../types.js';

const app = new Hono<{ Bindings: Env }>();

// ===== Inline validators (simplified for Workers) =====

interface ValidationError {
    code: string;
    message: string;
    field?: string;
    expected?: unknown;
    actual?: unknown;
}

interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationError[];
}

/**
 * Validate matrix output
 */
function validateMatrix(matrix: Record<string, unknown>): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check required fields
    if (!matrix.subject || typeof matrix.subject !== 'string') {
        errors.push({ code: 'MISSING_SUBJECT', message: 'Thiếu trường subject' });
    }
    if (!matrix.grade || typeof matrix.grade !== 'number') {
        errors.push({ code: 'MISSING_GRADE', message: 'Thiếu trường grade' });
    }
    if (!Array.isArray(matrix.topics) || matrix.topics.length === 0) {
        errors.push({ code: 'NO_TOPICS', message: 'Phải có ít nhất 1 chủ đề' });
    }

    // Validate tổng % = 100
    if (Array.isArray(matrix.topics)) {
        const totalPercent = matrix.topics.reduce((sum: number, t: { percentScore?: number }) => {
            return sum + (t.percentScore || 0);
        }, 0);

        if (totalPercent !== 100) {
            errors.push({
                code: 'INVALID_PERCENT_TOTAL',
                message: `Tổng tỷ lệ % phải = 100`,
                expected: 100,
                actual: totalPercent,
            });
        }
    }

    return { isValid: errors.length === 0, errors, warnings };
}

/**
 * Validate exam output
 */
function validateExam(
    exam: Record<string, unknown>,
    options: { requireSources?: boolean } = {}
): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Check required fields
    if (!exam.title || typeof exam.title !== 'string') {
        errors.push({ code: 'MISSING_TITLE', message: 'Thiếu trường title' });
    }
    if (!Array.isArray(exam.sections) || exam.sections.length === 0) {
        errors.push({ code: 'NO_SECTIONS', message: 'Phải có ít nhất 1 section' });
    }

    // Validate sources nếu sourceMode = from_docs
    if (exam.sourceMode === 'from_docs' || options.requireSources) {
        if (Array.isArray(exam.sections)) {
            for (const section of exam.sections as { questions?: Array<{ id?: string; sources?: unknown[] }> }[]) {
                if (Array.isArray(section.questions)) {
                    for (const q of section.questions) {
                        if (!q.sources || !Array.isArray(q.sources) || q.sources.length === 0) {
                            warnings.push({
                                code: 'MISSING_SOURCES',
                                message: `Câu hỏi ${q.id || 'unknown'} thiếu sources`,
                            });
                        }
                    }
                }
            }
        }
    }

    // Validate TF có 4 statements
    if (Array.isArray(exam.sections)) {
        for (const section of exam.sections as { type?: string; questions?: Array<{ id?: string; statements?: unknown[] }> }[]) {
            if (section.type === 'TF' && Array.isArray(section.questions)) {
                for (const q of section.questions) {
                    if (!q.statements || !Array.isArray(q.statements) || q.statements.length !== 4) {
                        warnings.push({
                            code: 'TF_STATEMENTS_COUNT',
                            message: `Câu TF ${q.id || 'unknown'} nên có 4 mệnh đề`,
                            expected: 4,
                            actual: q.statements?.length || 0,
                        });
                    }
                }
            }
        }
    }

    return { isValid: errors.length === 0, errors, warnings };
}

// ===== API Endpoints =====

/**
 * POST /validate/matrix
 * Validate matrix output trước khi save
 */
app.post('/matrix', async (c) => {
    const body = await c.req.json<{ matrix: Record<string, unknown>; policyId?: string }>();

    if (!body.matrix) {
        return c.json({ error: 'missing_matrix' }, 400);
    }

    const result = validateMatrix(body.matrix);

    console.info('[validate/matrix]', {
        isValid: result.isValid,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
    });

    return c.json(result);
});

/**
 * POST /validate/exam
 * Validate exam output
 */
app.post('/exam', async (c) => {
    const body = await c.req.json<{
        exam: Record<string, unknown>;
        requireSources?: boolean;
    }>();

    if (!body.exam) {
        return c.json({ error: 'missing_exam' }, 400);
    }

    const result = validateExam(body.exam, {
        requireSources: body.requireSources,
    });

    console.info('[validate/exam]', {
        isValid: result.isValid,
        errorsCount: result.errors.length,
        warningsCount: result.warnings.length,
    });

    return c.json(result);
});

export { app as validateRoutes };
export default app;
