// Chú thích: Auto-grading service - chấm tự động MCQ, TF, SHORT

import type { ExamContent, Question } from '@exam-matrix/shared';

export interface StudentAnswer {
    questionId: string;
    answer: string; // MCQ: "A", TF: "ĐSĐS", SHORT: text
}

export interface QuestionGrade {
    questionId: string;
    earnedPoints: number;
    maxPoints: number;
    isCorrect: boolean;
    feedback?: string;
}

export interface GradeResult {
    totalScore: number;
    maxScore: number;
    percentage: number;
    grades: QuestionGrade[];
    breakdown: {
        MCQ: { earned: number; max: number; correct: number; total: number };
        TF: { earned: number; max: number; correct: number; total: number };
        SHORT: { earned: number; max: number; correct: number; total: number };
        ESSAY: { earned: number; max: number };
    };
}

/**
 * Chấm điểm tự động cho MCQ, TF, SHORT
 * ESSAY cần chấm thủ công
 */
export function gradeExam(exam: ExamContent, answers: StudentAnswer[]): GradeResult {
    const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));
    const grades: QuestionGrade[] = [];

    const breakdown = {
        MCQ: { earned: 0, max: 0, correct: 0, total: 0 },
        TF: { earned: 0, max: 0, correct: 0, total: 0 },
        SHORT: { earned: 0, max: 0, correct: 0, total: 0 },
        ESSAY: { earned: 0, max: 0 },
    };

    for (const section of exam.sections) {
        for (const question of section.questions) {
            const studentAnswer = answerMap.get(question.id) || '';
            const grade = gradeQuestion(question, studentAnswer);
            grades.push(grade);

            // Update breakdown
            if (question.type === 'MCQ') {
                breakdown.MCQ.max += question.points;
                breakdown.MCQ.total += 1;
                if (grade.isCorrect) {
                    breakdown.MCQ.earned += grade.earnedPoints;
                    breakdown.MCQ.correct += 1;
                }
            } else if (question.type === 'TF') {
                breakdown.TF.max += question.points;
                breakdown.TF.total += 1;
                breakdown.TF.earned += grade.earnedPoints;
                if (grade.isCorrect) breakdown.TF.correct += 1;
            } else if (question.type === 'SHORT') {
                breakdown.SHORT.max += question.points;
                breakdown.SHORT.total += 1;
                if (grade.isCorrect) {
                    breakdown.SHORT.earned += grade.earnedPoints;
                    breakdown.SHORT.correct += 1;
                }
            } else if (question.type === 'ESSAY') {
                breakdown.ESSAY.max += question.points;
                // ESSAY không chấm tự động, để earned = 0
            }
        }
    }

    const totalScore = grades.reduce((sum, g) => sum + g.earnedPoints, 0);
    const maxScore = exam.totalScore;

    return {
        totalScore,
        maxScore,
        percentage: Math.round((totalScore / maxScore) * 100),
        grades,
        breakdown,
    };
}

/**
 * Chấm điểm một câu hỏi
 */
function gradeQuestion(question: Question, studentAnswer: string): QuestionGrade {
    const result: QuestionGrade = {
        questionId: question.id,
        earnedPoints: 0,
        maxPoints: question.points,
        isCorrect: false,
    };

    switch (question.type) {
        case 'MCQ':
            // So sánh đáp án (case-insensitive)
            const correctMCQ = question.answerKey.toUpperCase().trim();
            const studentMCQ = studentAnswer.toUpperCase().trim();
            result.isCorrect = correctMCQ === studentMCQ;
            result.earnedPoints = result.isCorrect ? question.points : 0;
            result.feedback = result.isCorrect
                ? 'Đúng'
                : `Sai. Đáp án đúng: ${correctMCQ}`;
            break;

        case 'TF':
            // Đúng/Sai có 4 ý, mỗi ý đúng được 0.25 điểm của câu
            const correctTF = question.answerKey.toUpperCase();
            const studentTF = studentAnswer.toUpperCase().padEnd(4, ' ');

            let tfCorrectCount = 0;
            for (let i = 0; i < 4; i++) {
                if (correctTF[i] === studentTF[i]) {
                    tfCorrectCount++;
                }
            }

            // Điểm = (số ý đúng / 4) * điểm câu hỏi
            result.earnedPoints = (tfCorrectCount / 4) * question.points;
            result.isCorrect = tfCorrectCount === 4;
            result.feedback = `Đúng ${tfCorrectCount}/4 ý. Đáp án: ${correctTF}`;
            break;

        case 'SHORT':
            // So sánh text (normalize + case-insensitive)
            const correctShort = normalizeText(question.answerKey);
            const studentShort = normalizeText(studentAnswer);

            // Kiểm tra exact match hoặc contains
            result.isCorrect = correctShort === studentShort ||
                correctShort.includes(studentShort) ||
                studentShort.includes(correctShort);
            result.earnedPoints = result.isCorrect ? question.points : 0;
            result.feedback = result.isCorrect
                ? 'Đúng'
                : `Đáp án mẫu: ${question.answerKey}`;
            break;

        case 'ESSAY':
            // Không chấm tự động, trả về 0 điểm với note
            result.earnedPoints = 0;
            result.isCorrect = false;
            result.feedback = 'Câu tự luận - cần chấm thủ công';
            break;
    }

    return result;
}

/**
 * Normalize text để so sánh
 */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[.,;:!?]/g, '');
}

/**
 * Tính điểm theo thang 10 từ raw score
 */
export function calculateScale10(result: GradeResult): number {
    const gradableMax = result.breakdown.MCQ.max +
        result.breakdown.TF.max +
        result.breakdown.SHORT.max;

    const gradableEarned = result.breakdown.MCQ.earned +
        result.breakdown.TF.earned +
        result.breakdown.SHORT.earned;

    if (gradableMax === 0) return 0;

    // Phần tự động chấm được (7 điểm theo CV 7991)
    const autoScore = (gradableEarned / gradableMax) * 7;

    // ESSAY (3 điểm) cần thêm vào từ chấm thủ công
    return Math.round(autoScore * 10) / 10;
}

/**
 * Generate grade summary in Vietnamese
 */
export function generateGradeSummary(result: GradeResult): string {
    const { MCQ, TF, SHORT, ESSAY } = result.breakdown;

    return `BẢNG ĐIỂM TỰ ĐỘNG
===================
Trắc nghiệm nhiều lựa chọn: ${MCQ.correct}/${MCQ.total} câu đúng (${MCQ.earned}/${MCQ.max} điểm)
Đúng/Sai: ${TF.correct}/${TF.total} câu đúng hoàn toàn (${TF.earned.toFixed(2)}/${TF.max} điểm)
Trả lời ngắn: ${SHORT.correct}/${SHORT.total} câu đúng (${SHORT.earned}/${SHORT.max} điểm)
Tự luận: Chờ chấm thủ công (0/${ESSAY.max} điểm)

TỔNG ĐIỂM TỰ ĐỘNG: ${result.totalScore.toFixed(2)}/${result.maxScore} điểm
(Chưa bao gồm điểm tự luận)`;
}
