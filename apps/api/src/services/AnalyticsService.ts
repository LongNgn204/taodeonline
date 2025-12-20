// Chú thích: Analytics Service
// Tính toán Item Analysis và thống kê đề thi

interface AttemptAnswer {
    questionId: string;
    answer: string;
    isCorrect?: boolean;
    timeSeconds?: number;
}

interface StudentAttempt {
    id: string;
    examId: string;
    answers: AttemptAnswer[];
    score: number;
    maxScore: number;
    timeTakenMinutes: number;
}

interface ItemStats {
    questionId: string;
    attemptsCount: number;
    correctCount: number;
    difficultyIndex: number;      // P = correct/total (0-1)
    discriminationIndex: number;  // D = P(upper) - P(lower)
    distractorAnalysis: Record<string, number>; // Response frequency per option
    avgTimeSeconds: number;
}

interface ExamStats {
    examId: string;
    attemptsCount: number;
    avgScore: number;
    minScore: number;
    maxScore: number;
    stdDeviation: number;
    avgTimeMinutes: number;
    passRate: number;
    scoreDistribution: Record<string, number>; // "0-1": 5, "1-2": 10, etc.
    topicPerformance: Record<string, { correct: number; total: number; percent: number }>;
    levelPerformance: Record<string, { correct: number; total: number; percent: number }>;
}

interface QuestionSuggestion {
    questionId: string;
    suggestionType: 'difficulty' | 'discrimination' | 'distractor' | 'wording';
    severity: 'info' | 'warning' | 'critical';
    title: string;
    description: string;
}

/**
 * Tính Difficulty Index (P)
 * P = số câu đúng / tổng số lượt làm
 * P > 0.7: Câu dễ, P < 0.3: Câu khó
 */
function calculateDifficultyIndex(correctCount: number, totalCount: number): number {
    if (totalCount === 0) return 0;
    return correctCount / totalCount;
}

/**
 * Tính Discrimination Index (D)
 * Sử dụng phương pháp upper-lower 27%
 * D > 0.4: Tốt, 0.3-0.4: Chấp nhận được, 0.2-0.3: Cần cải thiện, < 0.2: Kém
 */
function calculateDiscriminationIndex(
    attempts: StudentAttempt[],
    questionId: string
): number {
    if (attempts.length < 10) return 0; // Cần ít nhất 10 bài để tính

    // Sắp xếp theo điểm
    const sorted = [...attempts].sort((a, b) => b.score - a.score);

    // Lấy 27% cao nhất và thấp nhất
    const n = Math.max(1, Math.floor(sorted.length * 0.27));
    const upperGroup = sorted.slice(0, n);
    const lowerGroup = sorted.slice(-n);

    // Tính tỷ lệ đúng mỗi nhóm
    const upperCorrect = upperGroup.filter(a =>
        a.answers.find(ans => ans.questionId === questionId)?.isCorrect
    ).length;
    const lowerCorrect = lowerGroup.filter(a =>
        a.answers.find(ans => ans.questionId === questionId)?.isCorrect
    ).length;

    const pUpper = upperCorrect / upperGroup.length;
    const pLower = lowerCorrect / lowerGroup.length;

    return pUpper - pLower;
}

/**
 * Phân tích đáp án nhiễu (Distractor Analysis)
 * Đáp án nhiễu tốt: được chọn bởi nhóm điểm thấp nhiều hơn nhóm điểm cao
 */
function analyzeDistractors(
    attempts: StudentAttempt[],
    questionId: string
): Record<string, number> {
    const distribution: Record<string, number> = {};

    for (const attempt of attempts) {
        const answer = attempt.answers.find(a => a.questionId === questionId);
        if (answer) {
            distribution[answer.answer] = (distribution[answer.answer] || 0) + 1;
        }
    }

    return distribution;
}

/**
 * Tính Item Statistics cho một câu hỏi
 */
export function calculateItemStats(
    attempts: StudentAttempt[],
    questionId: string
): ItemStats {
    const relevantAnswers = attempts
        .map(a => a.answers.find(ans => ans.questionId === questionId))
        .filter(Boolean) as AttemptAnswer[];

    const correctCount = relevantAnswers.filter(a => a.isCorrect).length;
    const totalTime = relevantAnswers.reduce((sum, a) => sum + (a.timeSeconds || 0), 0);

    return {
        questionId,
        attemptsCount: relevantAnswers.length,
        correctCount,
        difficultyIndex: calculateDifficultyIndex(correctCount, relevantAnswers.length),
        discriminationIndex: calculateDiscriminationIndex(attempts, questionId),
        distractorAnalysis: analyzeDistractors(attempts, questionId),
        avgTimeSeconds: relevantAnswers.length > 0 ? totalTime / relevantAnswers.length : 0,
    };
}

/**
 * Tính Exam Statistics
 */
export function calculateExamStats(attempts: StudentAttempt[], examId: string): ExamStats {
    if (attempts.length === 0) {
        return {
            examId,
            attemptsCount: 0,
            avgScore: 0,
            minScore: 0,
            maxScore: 0,
            stdDeviation: 0,
            avgTimeMinutes: 0,
            passRate: 0,
            scoreDistribution: {},
            topicPerformance: {},
            levelPerformance: {},
        };
    }

    const scores = attempts.map(a => a.score);
    const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length;
    const minScore = Math.min(...scores);
    const maxScore = Math.max(...scores);

    // Standard deviation
    const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length;
    const stdDeviation = Math.sqrt(variance);

    // Pass rate (>= 5 điểm)
    const passCount = scores.filter(s => s >= 5).length;
    const passRate = passCount / scores.length;

    // Average time
    const avgTimeMinutes = attempts.reduce((sum, a) => sum + a.timeTakenMinutes, 0) / attempts.length;

    // Score distribution
    const scoreDistribution: Record<string, number> = {
        '0-2': 0, '2-4': 0, '4-6': 0, '6-8': 0, '8-10': 0,
    };
    for (const score of scores) {
        if (score < 2) scoreDistribution['0-2']++;
        else if (score < 4) scoreDistribution['2-4']++;
        else if (score < 6) scoreDistribution['4-6']++;
        else if (score < 8) scoreDistribution['6-8']++;
        else scoreDistribution['8-10']++;
    }

    return {
        examId,
        attemptsCount: attempts.length,
        avgScore,
        minScore,
        maxScore,
        stdDeviation,
        avgTimeMinutes,
        passRate,
        scoreDistribution,
        topicPerformance: {}, // Will be populated with exam structure info
        levelPerformance: {},
    };
}

/**
 * Gợi ý cải thiện dựa trên thống kê
 */
export function generateSuggestions(itemStats: ItemStats[]): QuestionSuggestion[] {
    const suggestions: QuestionSuggestion[] = [];

    for (const item of itemStats) {
        // Câu quá dễ
        if (item.difficultyIndex > 0.85) {
            suggestions.push({
                questionId: item.questionId,
                suggestionType: 'difficulty',
                severity: 'info',
                title: 'Câu hỏi quá dễ',
                description: `${Math.round(item.difficultyIndex * 100)}% học sinh trả lời đúng. Có thể tăng độ khó hoặc chuyển sang mức "Nhận biết".`,
            });
        }

        // Câu quá khó
        if (item.difficultyIndex < 0.2 && item.attemptsCount >= 10) {
            suggestions.push({
                questionId: item.questionId,
                suggestionType: 'difficulty',
                severity: 'warning',
                title: 'Câu hỏi quá khó',
                description: `Chỉ ${Math.round(item.difficultyIndex * 100)}% học sinh trả lời đúng. Xem xét lại nội dung hoặc đáp án.`,
            });
        }

        // Phân biệt kém
        if (item.discriminationIndex < 0.2 && item.attemptsCount >= 10) {
            suggestions.push({
                questionId: item.questionId,
                suggestionType: 'discrimination',
                severity: 'warning',
                title: 'Phân biệt kém',
                description: `Chỉ số phân biệt ${item.discriminationIndex.toFixed(2)} < 0.2. Câu hỏi không phân biệt được học sinh giỏi và yếu.`,
            });
        }

        // Phân biệt âm (câu hỏi có vấn đề)
        if (item.discriminationIndex < 0) {
            suggestions.push({
                questionId: item.questionId,
                suggestionType: 'discrimination',
                severity: 'critical',
                title: 'Phân biệt âm - CẦN XEM XÉT',
                description: 'Học sinh yếu làm đúng nhiều hơn học sinh giỏi. Có thể đáp án sai hoặc câu hỏi gây hiểu lầm.',
            });
        }

        // Đáp án nhiễu không hoạt động
        const options = Object.entries(item.distractorAnalysis);
        const totalResponses = options.reduce((sum, [, count]) => sum + count, 0);
        for (const [option, count] of options) {
            const percentage = count / totalResponses;
            if (percentage < 0.05 && option !== item.questionId) { // Less than 5% chose this
                suggestions.push({
                    questionId: item.questionId,
                    suggestionType: 'distractor',
                    severity: 'info',
                    title: `Đáp án "${option}" ít được chọn`,
                    description: `Chỉ ${Math.round(percentage * 100)}% chọn đáp án này. Cân nhắc thay đổi để tăng tính nhiễu.`,
                });
            }
        }
    }

    return suggestions;
}

export default {
    calculateItemStats,
    calculateExamStats,
    generateSuggestions,
};
