// Chú thích: Analytics API routes
// Endpoints cho thống kê và phân tích đề thi

import { Hono } from 'hono';
import type { Env } from '../types.js';
import {
    calculateItemStats,
    calculateExamStats,
    generateSuggestions,
} from '../services/AnalyticsService.js';

type Variables = {
    userId?: string;
    user?: { id: string; email: string } | null;
};

const analytics = new Hono<{ Bindings: Env; Variables: Variables }>();

// GET /analytics/exams/:id - Lấy thống kê tổng hợp của đề
analytics.get('/exams/:id', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');
    const db = c.env.DB;

    try {
        // Verify ownership
        const exam = await db
            .prepare('SELECT id, title, user_id FROM exams WHERE id = ? AND user_id = ?')
            .bind(examId, user.id)
            .first();

        if (!exam) {
            return c.json({ error: 'not_found' }, 404);
        }

        // Get exam stats
        const stats = await db
            .prepare('SELECT * FROM exam_stats WHERE exam_id = ?')
            .bind(examId)
            .first();

        // Get item stats
        const itemStatsResult = await db
            .prepare('SELECT * FROM item_stats WHERE exam_id = ? ORDER BY question_id')
            .bind(examId)
            .all();

        // Get suggestions
        const suggestionsResult = await db
            .prepare('SELECT * FROM question_suggestions WHERE exam_id = ? AND is_resolved = 0 ORDER BY severity DESC')
            .bind(examId)
            .all();

        return c.json({
            examId,
            examTitle: exam.title,
            stats: stats || null,
            itemStats: itemStatsResult.results || [],
            suggestions: suggestionsResult.results || [],
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return c.json({ error: 'Failed to fetch analytics' }, 500);
    }
});

// POST /analytics/exams/:id/recalculate - Tính lại thống kê
analytics.post('/exams/:id/recalculate', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');
    const db = c.env.DB;

    try {
        // Verify ownership
        const exam = await db
            .prepare('SELECT id, exam_json FROM exams WHERE id = ? AND user_id = ?')
            .bind(examId, user.id)
            .first<{ id: string; exam_json: string }>();

        if (!exam) {
            return c.json({ error: 'not_found' }, 404);
        }

        // Get all attempts
        const attemptsResult = await db
            .prepare('SELECT * FROM student_attempts WHERE exam_id = ?')
            .bind(examId)
            .all<{
                id: string;
                exam_id: string;
                answers_json: string;
                score: number;
                time_taken_minutes: number;
            }>();

        const attempts = (attemptsResult.results || []).map(a => ({
            id: a.id,
            examId: a.exam_id,
            answers: JSON.parse(a.answers_json || '[]'),
            score: a.score || 0,
            maxScore: 10,
            timeTakenMinutes: a.time_taken_minutes || 0,
        }));

        if (attempts.length === 0) {
            return c.json({ message: 'No attempts to analyze', calculated: false });
        }

        // Parse exam to get question IDs
        const examData = exam.exam_json ? JSON.parse(exam.exam_json) : null;
        const questionIds: string[] = [];
        if (examData?.sections) {
            for (const section of examData.sections) {
                for (const question of section.questions || []) {
                    questionIds.push(question.id);
                }
            }
        }

        // Calculate item stats for each question
        const itemStatsList = questionIds.map(qId => calculateItemStats(attempts, qId));

        // Calculate exam stats
        const examStats = calculateExamStats(attempts, examId);

        // Generate suggestions
        const suggestions = generateSuggestions(itemStatsList);

        const now = new Date().toISOString();

        // Save exam stats
        await db
            .prepare(`
                INSERT INTO exam_stats (id, exam_id, attempts_count, avg_score, min_score, max_score, std_deviation, avg_time_minutes, pass_rate, score_distribution, topic_performance, level_performance, last_calculated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(exam_id) DO UPDATE SET
                    attempts_count = ?,
                    avg_score = ?,
                    min_score = ?,
                    max_score = ?,
                    std_deviation = ?,
                    avg_time_minutes = ?,
                    pass_rate = ?,
                    score_distribution = ?,
                    topic_performance = ?,
                    level_performance = ?,
                    last_calculated_at = ?
            `)
            .bind(
                `stats_${examId}`,
                examId,
                examStats.attemptsCount,
                examStats.avgScore,
                examStats.minScore,
                examStats.maxScore,
                examStats.stdDeviation,
                examStats.avgTimeMinutes,
                examStats.passRate,
                JSON.stringify(examStats.scoreDistribution),
                JSON.stringify(examStats.topicPerformance),
                JSON.stringify(examStats.levelPerformance),
                now,
                // Update values
                examStats.attemptsCount,
                examStats.avgScore,
                examStats.minScore,
                examStats.maxScore,
                examStats.stdDeviation,
                examStats.avgTimeMinutes,
                examStats.passRate,
                JSON.stringify(examStats.scoreDistribution),
                JSON.stringify(examStats.topicPerformance),
                JSON.stringify(examStats.levelPerformance),
                now
            )
            .run();

        // Save item stats
        for (const item of itemStatsList) {
            await db
                .prepare(`
                    INSERT OR REPLACE INTO item_stats (id, question_id, exam_id, attempts_count, correct_count, difficulty_index, discrimination_index, distractor_analysis, avg_time_seconds, last_calculated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    `item_${examId}_${item.questionId}`,
                    item.questionId,
                    examId,
                    item.attemptsCount,
                    item.correctCount,
                    item.difficultyIndex,
                    item.discriminationIndex,
                    JSON.stringify(item.distractorAnalysis),
                    item.avgTimeSeconds,
                    now
                )
                .run();
        }

        // Save suggestions
        for (const sugg of suggestions) {
            await db
                .prepare(`
                    INSERT OR IGNORE INTO question_suggestions (id, question_id, exam_id, suggestion_type, severity, title, description)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `)
                .bind(
                    `sugg_${examId}_${sugg.questionId}_${sugg.suggestionType}`,
                    sugg.questionId,
                    examId,
                    sugg.suggestionType,
                    sugg.severity,
                    sugg.title,
                    sugg.description
                )
                .run();
        }

        return c.json({
            success: true,
            calculated: true,
            attemptsAnalyzed: attempts.length,
            questionsAnalyzed: itemStatsList.length,
            suggestionsGenerated: suggestions.length,
        });
    } catch (error) {
        console.error('Error recalculating analytics:', error);
        return c.json({ error: 'Failed to recalculate analytics' }, 500);
    }
});

// POST /analytics/exams/:id/attempts - Thêm bài làm của học sinh
analytics.post('/exams/:id/attempts', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');
    const db = c.env.DB;

    try {
        const body = await c.req.json<{
            studentName?: string;
            studentId?: string;
            versionCode?: string;
            answers: Array<{ questionId: string; answer: string; isCorrect?: boolean }>;
            score?: number;
            timeTakenMinutes?: number;
        }>();

        // Verify exam ownership
        const exam = await db
            .prepare('SELECT id FROM exams WHERE id = ? AND user_id = ?')
            .bind(examId, user.id)
            .first();

        if (!exam) {
            return c.json({ error: 'not_found' }, 404);
        }

        const attemptId = `attempt_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const now = new Date().toISOString();

        await db
            .prepare(`
                INSERT INTO student_attempts (id, exam_id, student_name, student_id, version_code, answers_json, score, time_taken_minutes, submitted_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `)
            .bind(
                attemptId,
                examId,
                body.studentName || null,
                body.studentId || null,
                body.versionCode || 'A',
                JSON.stringify(body.answers),
                body.score || null,
                body.timeTakenMinutes || null,
                now
            )
            .run();

        return c.json({ success: true, attemptId }, 201);
    } catch (error) {
        console.error('Error saving attempt:', error);
        return c.json({ error: 'Failed to save attempt' }, 500);
    }
});

// GET /analytics/exams/:id/attempts - Danh sách bài làm
analytics.get('/exams/:id/attempts', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('id');
    const db = c.env.DB;

    try {
        // Verify exam ownership
        const exam = await db
            .prepare('SELECT id FROM exams WHERE id = ? AND user_id = ?')
            .bind(examId, user.id)
            .first();

        if (!exam) {
            return c.json({ error: 'not_found' }, 404);
        }

        const result = await db
            .prepare(`
                SELECT id, student_name, student_id, version_code, score, time_taken_minutes, submitted_at
                FROM student_attempts
                WHERE exam_id = ?
                ORDER BY submitted_at DESC
            `)
            .bind(examId)
            .all();

        return c.json({ attempts: result.results || [] });
    } catch (error) {
        console.error('Error fetching attempts:', error);
        return c.json({ error: 'Failed to fetch attempts' }, 500);
    }
});

// PATCH /analytics/suggestions/:id/resolve - Đánh dấu đã xử lý gợi ý
analytics.patch('/suggestions/:id/resolve', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const suggestionId = c.req.param('id');
    const db = c.env.DB;

    try {
        await db
            .prepare(`
                UPDATE question_suggestions
                SET is_resolved = 1, resolved_at = ?
                WHERE id = ?
            `)
            .bind(new Date().toISOString(), suggestionId)
            .run();

        return c.json({ success: true });
    } catch (error) {
        console.error('Error resolving suggestion:', error);
        return c.json({ error: 'Failed to resolve suggestion' }, 500);
    }
});

export default analytics;
