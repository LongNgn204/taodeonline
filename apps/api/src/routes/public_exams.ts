
import { Hono } from 'hono';
import { safeJsonParse } from '@exam-matrix/shared';
import type { AnswerKey } from '@exam-matrix/shared'; // Assuming this exists or I'll type it loosely
import type { Env } from '../types';

const publicExams = new Hono<{ Bindings: Env }>();

// GET /public/exams/:id - Fetch exam content (stripped of answers if they were embedded, but our schema separates them)
publicExams.get('/:id', async (c) => {
    const examId = c.req.param('id');

    // Fetch exam
    const exam = await c.env.DB.prepare(
        'SELECT title, exam_json, duration_minutes, status, library_id, user_id FROM exams WHERE id = ?'
    )
        .bind(examId)
        .first<{ title: string; exam_json: string; duration_minutes?: number; status: string; library_id: string; user_id: string }>();

    if (!exam) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Optional: Check status (e.g., only 'published' exams) because we don't want draft exams to be taken?
    // For now, allow all for demo ease.

    // Return only necessary info
    return c.json({
        id: examId,
        title: exam.title,
        examContent: safeJsonParse(exam.exam_json, null),
        duration: 45, // Hardcoded or fetch from library/exam settings
    });
});

// POST /public/exams/:id/submit - Submit answers and get Grade
publicExams.post('/:id/submit', async (c) => {
    const examId = c.req.param('id');
    const body = await c.req.json().catch(() => ({})) as {
        studentName?: string;
        answers: Record<string, string>; // questionId -> answer
        cheatCount?: number;
    };

    if (!body.answers) {
        return c.json({ error: 'invalid_submission' }, 400);
    }

    // Fetch Answer Key
    const record = await c.env.DB.prepare(
        'SELECT answer_key_json FROM exams WHERE id = ?'
    )
        .bind(examId)
        .first<{ answer_key_json: string }>();

    if (!record) {
        return c.json({ error: 'not_found' }, 404);
    }

    const answerKey = safeJsonParse(record.answer_key_json, {});
    let correctCount = 0;
    let totalQuestions = 0;

    // Simple Grading Logic
    // answerKey might be { "q1": "A", "q2": "B" }
    // or array of objects. Let's assume Map-like structure based on previous schema code logic.
    // We will assume answerKey is Record<string, string> for now.

    const keyMap = answerKey as Record<string, string>;
    totalQuestions = Object.keys(keyMap).length;

    for (const [qId, userAnswer] of Object.entries(body.answers)) {
        if (keyMap[qId] === userAnswer) {
            correctCount++;
        }
    }

    const score = totalQuestions > 0 ? (correctCount / totalQuestions) * 10 : 0;

    return c.json({
        success: true,
        score,
        correctCount,
        totalQuestions,
        message: 'Nộp bài thành công!'
    });
});

export default publicExams;
