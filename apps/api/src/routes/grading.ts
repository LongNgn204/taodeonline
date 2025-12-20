// Chú thích: Grading routes - chấm điểm tự động

import { Hono } from 'hono';
import { safeJsonParse } from '@exam-matrix/shared';
import type { ExamContent } from '@exam-matrix/shared';
import type { Env } from '../types.js';
import { gradeExam, calculateScale10, generateGradeSummary, type StudentAnswer } from '../services/grading.js';

const grading = new Hono<{ Bindings: Env }>();

// POST /grading/:examId - Chấm điểm tự động
grading.post('/:examId', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('examId');
    const body = await c.req.json().catch(() => ({}));

    // Get exam
    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?')
        .bind(examId, user.id)
        .first<{ exam_json: string }>();

    if (!exam || !exam.exam_json) {
        return c.json({ error: 'exam_not_found', message: 'Không tìm thấy đề thi' }, 404);
    }

    // Parse exam
    const examContent = safeJsonParse<ExamContent | null>(exam.exam_json, null);
    if (!examContent) {
        return c.json({ error: 'invalid_exam', message: 'Đề thi không hợp lệ' }, 400);
    }

    // Validate answers
    const { answers } = body as { answers?: StudentAnswer[] };
    if (!answers || !Array.isArray(answers)) {
        return c.json({ error: 'missing_answers', message: 'Cần cung cấp bài làm' }, 400);
    }

    // Grade
    const result = gradeExam(examContent, answers);
    const scale10 = calculateScale10(result);
    const summary = generateGradeSummary(result);

    console.info('[grading] exam graded', {
        examId,
        totalScore: result.totalScore,
        percentage: result.percentage,
    });

    return c.json({
        success: true,
        result,
        scale10Score: scale10,
        summary,
    });
});

// POST /grading/:examId/quick - Chấm nhanh từ string đáp án
// Input: "ABCD|ĐSĐS|answer1|answer2|..."
grading.post('/:examId/quick', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('examId');
    const body = await c.req.json().catch(() => ({}));

    // Get exam
    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?')
        .bind(examId, user.id)
        .first<{ exam_json: string }>();

    if (!exam || !exam.exam_json) {
        return c.json({ error: 'exam_not_found' }, 404);
    }

    const examContent = safeJsonParse<ExamContent | null>(exam.exam_json, null);
    if (!examContent) {
        return c.json({ error: 'invalid_exam' }, 400);
    }

    // Parse quick answer format
    const { answerString } = body as { answerString?: string };
    if (!answerString) {
        return c.json({ error: 'missing_answer_string' }, 400);
    }

    // Split by | và map tới questions
    const parts = answerString.split('|').map((s) => s.trim());
    const answers: StudentAnswer[] = [];
    let partIndex = 0;

    for (const section of examContent.sections) {
        for (const question of section.questions) {
            answers.push({
                questionId: question.id,
                answer: parts[partIndex] || '',
            });
            partIndex++;
        }
    }

    // Grade
    const result = gradeExam(examContent, answers);
    const scale10 = calculateScale10(result);

    return c.json({
        success: true,
        result,
        scale10Score: scale10,
        summary: generateGradeSummary(result),
    });
});

export { grading as gradingRoutes };
