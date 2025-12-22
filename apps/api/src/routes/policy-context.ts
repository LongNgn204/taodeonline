// Chú thích: Policy Context API - trả policyText + constraints cho AI agents
// Endpoint này cung cấp "gói luật đã resolve" để frontend inject vào prompts
// KHÔNG cần auth vì là public policy data

import { Hono } from 'hono';
import type { Env } from '../types.js';
import {
    mergePolicies,
    DEFAULT_PACKS,
} from '@exam-matrix/core';

const app = new Hono<{ Bindings: Env }>();

// ===== Types =====

interface PolicyContextOutput {
    policyText: string;
    constraints: Record<string, unknown>;
    questionTypes: Record<string, unknown>;
    schemaHints: unknown;
    policyRefs: string[];
    policyVersion: string;
}

// ===== Helper Functions =====

/**
 * Tạo policyText dạng bullets từ constraints
 * Chú thích: Format này sẽ được inject vào system prompt
 */
function generatePolicyText(constraints: Record<string, unknown>, mode: string): string {
    const lines: string[] = [];

    // Duration
    const duration = constraints.duration as { default?: number; by_subject?: Record<string, number> } | undefined;
    if (duration?.default) {
        lines.push(`- Thời gian làm bài: ${duration.default} phút`);
    } else if (duration?.by_subject) {
        lines.push(`- Thời gian làm bài theo môn:`);
        for (const [subject, mins] of Object.entries(duration.by_subject)) {
            lines.push(`  + ${subject}: ${mins} phút`);
        }
    }

    // Total score
    if (constraints.total_score) {
        lines.push(`- Tổng điểm: ${constraints.total_score} điểm`);
    }

    // Score distribution (CV7991 style)
    const scoreDist = constraints.score_distribution as Record<string, number> | undefined;
    if (scoreDist) {
        lines.push(`- Phân bổ điểm:`);
        if (scoreDist.MCQ) lines.push(`  + Trắc nghiệm nhiều lựa chọn (MCQ): ${scoreDist.MCQ} điểm`);
        if (scoreDist.TF) lines.push(`  + Đúng/Sai (TF): ${scoreDist.TF} điểm`);
        if (scoreDist.SHORT) lines.push(`  + Trả lời ngắn (SHORT): ${scoreDist.SHORT} điểm`);
        if (scoreDist.ESSAY) lines.push(`  + Tự luận (ESSAY): ${scoreDist.ESSAY} điểm`);
    }

    // Cognitive levels
    const levels = constraints.cognitive_levels as Record<string, number> | undefined;
    if (levels) {
        lines.push(`- Tỷ lệ mức độ nhận thức:`);
        if (levels.NB !== undefined) lines.push(`  + Nhận biết (NB): ${levels.NB}%`);
        if (levels.TH !== undefined) lines.push(`  + Thông hiểu (TH): ${levels.TH}%`);
        if (levels.VD !== undefined) lines.push(`  + Vận dụng (VD): ${levels.VD}%`);
    }

    // Question counts (TN-THPT style)
    const counts = constraints.question_counts as { by_subject?: Record<string, number>; default?: number } | undefined;
    if (counts?.by_subject) {
        lines.push(`- Số câu hỏi theo môn:`);
        for (const [subject, count] of Object.entries(counts.by_subject)) {
            lines.push(`  + ${subject}: ${count} câu`);
        }
    } else if (counts?.default) {
        lines.push(`- Số câu hỏi: ${counts.default} câu`);
    }

    // Mode-specific notes
    if (mode === 'school_assessment') {
        lines.push(`- Đây là đề kiểm tra định kỳ trong trường`);
    } else if (mode === 'graduation_exam') {
        lines.push(`- Đây là đề thi tốt nghiệp THPT`);
    }

    return lines.join('\n');
}

/**
 * Tạo schema hints cho Matrix output
 */
function getMatrixSchemaHints(): object {
    return {
        version: 'matrix-v1.0.0',
        subject: 'string - Tên môn học',
        grade: 'number - Lớp',
        duration: 'number - Thời gian (phút)',
        totalScore: 'number - Tổng điểm',
        topics: [
            {
                id: 'string',
                name: 'Tên chủ đề',
                units: [
                    {
                        id: 'string',
                        name: 'Tên đơn vị kiến thức',
                        MCQ: { NB: 'số câu', TH: 'số câu', VD: 'số câu' },
                        TF: { NB: 'số câu', TH: 'số câu', VD: 'số câu' },
                        SHORT: { NB: 'số câu', TH: 'số câu', VD: 'số câu' },
                        ESSAY: { NB: 'số câu', TH: 'số câu', VD: 'số câu' },
                    },
                ],
                percentScore: 'number - % điểm của chủ đề',
            },
        ],
        summary: {
            MCQ: { count: 'tổng số câu', points: 'tổng điểm' },
            TF: { count: 'tổng số câu', points: 'tổng điểm' },
            SHORT: { count: 'tổng số câu', points: 'tổng điểm' },
            ESSAY: { count: 'tổng số câu', points: 'tổng điểm' },
            levelPercent: { NB: 40, TH: 30, VD: 30 },
        },
    };
}

/**
 * Tạo schema hints cho Exam output
 */
function getExamSchemaHints(): object {
    return {
        title: 'string - Tiêu đề đề thi',
        subject: 'string',
        grade: 'number',
        duration: 'number',
        sourceMode: '"from_docs" | "general_knowledge"',
        sections: [
            {
                id: 'string',
                title: 'Tên phần',
                type: '"MCQ" | "TF" | "SHORT" | "ESSAY"',
                questions: [
                    {
                        id: 'string',
                        content: 'Nội dung câu hỏi',
                        level: '"NB" | "TH" | "VD"',
                        options: ['A. ...', 'B. ...', 'C. ...', 'D. ...'],
                        correctAnswer: 'string',
                        explanation: 'Giải thích',
                        sources: [
                            {
                                chunkId: 'string - ID của chunk nguồn',
                                quote: 'string - Trích dẫn ngắn từ nguồn',
                            },
                        ],
                    },
                ],
            },
        ],
    };
}

// ===== API Endpoints =====

/**
 * GET /policy-context/matrix
 * Trả policy context cho Matrix Agent
 */
app.get('/matrix', async (c) => {
    const grade = parseInt(c.req.query('grade') || '10');
    const subject = c.req.query('subject') || 'Toán';
    const assessmentType = c.req.query('assessmentType') || 'school_assessment';

    // Chọn policy pack dựa trên assessment type
    let policyIds: string[];
    if (assessmentType === 'graduation_exam') {
        policyIds = DEFAULT_PACKS.GRADUATION_EXAM_2025;
    } else {
        policyIds = DEFAULT_PACKS.SCHOOL_ASSESSMENT_CV7991;
    }

    // Merge policies
    const mergeResult = mergePolicies(policyIds);

    // Generate policy text
    const policyText = generatePolicyText(
        mergeResult.rules.constraints,
        assessmentType
    );

    const output: PolicyContextOutput = {
        policyText,
        constraints: mergeResult.rules.constraints,
        questionTypes: mergeResult.rules.question_types,
        schemaHints: getMatrixSchemaHints(),
        policyRefs: mergeResult.appliedPolicies,
        policyVersion: `policy-pack-${assessmentType}-v1.0.0`,
    };

    console.info('[policy-context/matrix]', { grade, subject, assessmentType, policyRefs: output.policyRefs });

    return c.json(output);
});

/**
 * GET /policy-context/exam
 * Trả policy context cho Exam Agent
 */
app.get('/exam', async (c) => {
    const grade = parseInt(c.req.query('grade') || '10');
    const subject = c.req.query('subject') || 'Toán';
    const assessmentType = c.req.query('assessmentType') || 'school_assessment';

    // Chọn policy pack
    let policyIds: string[];
    if (assessmentType === 'graduation_exam') {
        policyIds = DEFAULT_PACKS.GRADUATION_EXAM_2025;
    } else {
        policyIds = DEFAULT_PACKS.SCHOOL_ASSESSMENT_CV7991;
    }

    // Merge policies
    const mergeResult = mergePolicies(policyIds);

    // Generate policy text
    const policyText = generatePolicyText(
        mergeResult.rules.constraints,
        assessmentType
    );

    const output: PolicyContextOutput = {
        policyText,
        constraints: mergeResult.rules.constraints,
        questionTypes: mergeResult.rules.question_types,
        schemaHints: getExamSchemaHints(),
        policyRefs: mergeResult.appliedPolicies,
        policyVersion: `policy-pack-${assessmentType}-v1.0.0`,
    };

    console.info('[policy-context/exam]', { grade, subject, assessmentType, policyRefs: output.policyRefs });

    return c.json(output);
});

/**
 * GET /policy-context/lessonplan
 * Trả policy context cho Lesson Plan Agent (Phase 5)
 */
app.get('/lessonplan', async (c) => {
    // TODO: Implement khi làm Phase 5
    return c.json({
        policyText: '- Tạo kế hoạch bài dạy theo CTGDPT 2018',
        constraints: {},
        questionTypes: {},
        schemaHints: {},
        policyRefs: ['tt32-2018'],
        policyVersion: 'lessonplan-v0.1.0',
    });
});

export { app as policyContextRoutes };
export default app;
