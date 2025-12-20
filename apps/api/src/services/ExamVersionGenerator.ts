// Chú thích: Exam Version Generator Service
// Tạo nhiều phiên bản đề từ một đề gốc bằng cách xáo trộn câu hỏi và đáp án

import type { ExamContent, Question, MCQOption } from '@exam-matrix/shared';

// Version codes for multiple exam versions
const VERSION_CODES = ['A', 'B', 'C', 'D', 'E', 'F'] as const;

/**
 * Fisher-Yates shuffle algorithm
 * Xáo trộn mảng một cách ngẫu nhiên và công bằng
 */
function shuffleArray<T>(array: T[], seed?: number): T[] {
    const result = [...array];
    let currentIndex = result.length;
    let randomIndex: number;

    // Seeded random for reproducibility
    let seedValue = seed ?? Date.now();
    const random = seed !== undefined
        ? () => {
            const x = Math.sin(seedValue++) * 10000;
            return x - Math.floor(x);
        }
        : Math.random;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(random() * currentIndex);
        currentIndex--;
        [result[currentIndex], result[randomIndex]] = [result[randomIndex], result[currentIndex]];
    }

    return result;
}

/**
 * Xáo trộn options của câu MCQ và cập nhật đáp án
 */
function shuffleMCQOptions(question: Question, seed: number): Question {
    if (!question.options || question.type !== 'MCQ') {
        return question;
    }

    const originalOptions = question.options;
    const originalAnswer = question.answerKey; // "A", "B", "C", "D"
    const originalAnswerIndex = originalAnswer.charCodeAt(0) - 65; // A=0, B=1, C=2, D=3

    // Xáo trộn options
    const shuffledOptions = shuffleArray(originalOptions, seed);

    // Tìm vị trí mới của đáp án đúng
    const newAnswerIndex = shuffledOptions.findIndex(
        (opt) => opt.label === originalOptions[originalAnswerIndex].label
    );

    // Cập nhật labels cho options mới
    const relabeledOptions: MCQOption[] = shuffledOptions.map((opt, idx) => ({
        ...opt,
        label: String.fromCharCode(65 + idx), // A, B, C, D
    }));

    // Tìm label mới của đáp án đúng
    const newAnswerKey = String.fromCharCode(65 + newAnswerIndex);

    return {
        ...question,
        options: relabeledOptions,
        answerKey: newAnswerKey,
    };
}

/**
 * Xáo trộn các ý trong câu Đúng/Sai và cập nhật đáp án
 */
function shuffleTFItems(question: Question, seed: number): Question {
    if (!question.tfItems || question.type !== 'TF') {
        return question;
    }

    const originalItems = question.tfItems;

    // Xáo trộn items
    const shuffledItems = shuffleArray(originalItems, seed);

    // Tạo đáp án mới dựa trên thứ tự mới
    const newAnswerKey = shuffledItems
        .map(item => item.isTrue ? 'Đ' : 'S')
        .join('');

    // Cập nhật labels (a, b, c, d)
    const relabeledItems = shuffledItems.map((item, idx) => ({
        ...item,
        id: String.fromCharCode(97 + idx), // a, b, c, d
    }));

    return {
        ...question,
        tfItems: relabeledItems,
        answerKey: newAnswerKey,
    };
}

/**
 * Xáo trộn một câu hỏi (options hoặc TF items)
 */
function shuffleQuestionContent(question: Question, seed: number): Question {
    if (question.type === 'MCQ') {
        return shuffleMCQOptions(question, seed);
    }
    if (question.type === 'TF') {
        return shuffleTFItems(question, seed);
    }
    return question;
}

export interface GenerateVersionsOptions {
    numberOfVersions: number; // 1-6
    shuffleQuestions: boolean; // Xáo trộn thứ tự câu hỏi trong mỗi section
    shuffleOptions: boolean; // Xáo trộn đáp án MCQ/TF
    baseSeeds?: number[]; // Seeds cho mỗi version (để reproducible)
}

/**
 * Tạo nhiều phiên bản đề từ một đề gốc
 */
export function generateExamVersions(
    originalExam: ExamContent,
    options: GenerateVersionsOptions
): ExamContent[] {
    const { numberOfVersions, shuffleQuestions, shuffleOptions, baseSeeds } = options;

    // Validate
    if (numberOfVersions < 1 || numberOfVersions > 6) {
        throw new Error('Số phiên bản phải từ 1 đến 6');
    }

    const versions: ExamContent[] = [];

    for (let versionIndex = 0; versionIndex < numberOfVersions; versionIndex++) {
        const versionCode = VERSION_CODES[versionIndex];
        const baseSeed = baseSeeds?.[versionIndex] ?? Date.now() + versionIndex * 1000;

        // Deep clone exam
        const versionExam: ExamContent = JSON.parse(JSON.stringify(originalExam));

        // Update metadata
        versionExam.versionCode = versionCode;
        versionExam.shuffleQuestions = shuffleQuestions;
        versionExam.shuffleOptions = shuffleOptions;
        versionExam.parentExamId = versionExam.parentExamId || undefined;
        versionExam.title = `${originalExam.title} - Mã đề ${versionCode}`;

        // Process each section
        versionExam.sections = versionExam.sections.map((section, sectionIndex) => {
            let questions = section.questions;

            // Xáo trộn thứ tự câu hỏi (chỉ trong cùng section)
            if (shuffleQuestions) {
                questions = shuffleArray(questions, baseSeed + sectionIndex * 100);

                // Re-number questions
                questions = questions.map((q, idx) => ({
                    ...q,
                    id: `${versionCode}_${section.type}_${idx + 1}`,
                }));
            }

            // Xáo trộn options/TF items
            if (shuffleOptions) {
                questions = questions.map((q, qIdx) =>
                    shuffleQuestionContent(q, baseSeed + sectionIndex * 100 + qIdx)
                );
            }

            return {
                ...section,
                questions,
            };
        });

        versions.push(versionExam);
    }

    return versions;
}

/**
 * Tạo answer key mapping giữa các phiên bản
 * Giúp giáo viên biết đáp án nào tương ứng với đáp án nào
 */
export function generateAnswerKeyMapping(
    versions: ExamContent[]
): Map<string, Record<string, string>> {
    const mapping = new Map<string, Record<string, string>>();

    // Lấy version gốc (A) làm chuẩn
    const baseVersion = versions.find(v => v.versionCode === 'A');
    if (!baseVersion) return mapping;

    for (const version of versions) {
        if (version.versionCode === 'A') continue;

        const versionMapping: Record<string, string> = {};

        for (const section of version.sections) {
            for (const question of section.questions) {
                // Map: "Câu X version này" -> "Đáp án của nó"
                versionMapping[question.id] = question.answerKey;
            }
        }

        mapping.set(version.versionCode, versionMapping);
    }

    return mapping;
}

/**
 * Validate rằng tất cả versions đều có cùng cấu trúc
 */
export function validateVersionsConsistency(versions: ExamContent[]): boolean {
    if (versions.length === 0) return true;

    const base = versions[0];

    for (const version of versions.slice(1)) {
        // Check same number of sections
        if (version.sections.length !== base.sections.length) {
            return false;
        }

        // Check each section has same number of questions
        for (let i = 0; i < version.sections.length; i++) {
            if (version.sections[i].questions.length !== base.sections[i].questions.length) {
                return false;
            }
        }
    }

    return true;
}

export default {
    generateExamVersions,
    generateAnswerKeyMapping,
    validateVersionsConsistency,
};
