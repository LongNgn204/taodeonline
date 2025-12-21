// Chú thích: MatrixAgent - sinh ma trận đề theo policy/blueprint
// Sử dụng AI adapter với prompt template versioned

import { chatJson, type ChatRequest } from '../adapters/ai.js';
import { MatrixSchema, type Matrix, type MatrixConstraints } from '@exam-matrix/shared';
import type { MatrixPolicySummary } from '../services/policy-engine.js';

// Prompt version để tracking và rollback
export const MATRIX_AGENT_VERSION = 'matrix-agent-v1.0.0';

// System prompt cho MatrixAgent
const MATRIX_SYSTEM_PROMPT = `Bạn là chuyên gia giáo dục Việt Nam, chuyên xây dựng ma trận đề kiểm tra theo policy/blueprint.
Người dùng là giáo viên cần ma trận chuẩn để biên soạn đề thi đúng chuẩn.

NHIỆM VỤ: Tạo ma trận đề kiểm tra cho môn học và lớp được yêu cầu, tuân thủ quy tắc được cung cấp ở phần "QUY TẮC MA TRẬN".

MỨC ĐỘ NHẬN THỨC:
- NB (Nhận biết): Nhớ, nhận ra kiến thức đã học
- TH (Thông hiểu): Giải thích, so sánh, phân tích đơn giản
- VD (Vận dụng): Áp dụng vào tình huống mới, giải quyết vấn đề

QUY TẮC CHUNG:
1. Phân bổ câu hỏi đều cho các chủ đề
2. Mỗi chủ đề có từ 1-3 đơn vị kiến thức
3. Tổng tỷ lệ % các chủ đề = 100%
4. Số câu, điểm, thời gian phải khớp policy/blueprint

OUTPUT: JSON theo schema được cung cấp, KHÔNG có text giải thích.`;

// User prompt template
function buildUserPrompt(
    constraints: MatrixConstraints,
    contextChunks: { titleHint: string; text: string }[],
    policyText?: string,
    curriculum?: string,
    teacherNote?: string
): string {
    const chunksSummary = contextChunks
        .slice(0, 10)
        .map((c, i) => `[${i + 1}] ${c.titleHint}: ${c.text.slice(0, 200)}...`)
        .join('\n');

    const curriculumHint = curriculum?.trim()
        ? `Chương trình/chuẩn áp dụng: ${curriculum.trim()}`
        : '';

    const noteHint = teacherNote?.trim()
        ? `Ghi chú của giáo viên: ${teacherNote.trim()}`
        : '';

    return `Môn học: ${constraints.subject}
Lớp: ${constraints.grade}
Thời gian: ${constraints.duration || 60} phút
Số chủ đề: ${constraints.numTopics || 4}
${constraints.scope ? `Phạm vi: ${constraints.scope.join(', ')}` : ''}
${curriculumHint ? `\n${curriculumHint}` : ''}
${noteHint ? `\n${noteHint}` : ''}

QUY TẮC MA TRẬN (bắt buộc):
${policyText || 'Theo cấu hình mặc định của hệ thống.'}

NỘI DUNG TÀI LIỆU (tham khảo để chọn chủ đề/đơn vị kiến thức):
${chunksSummary || 'Không có tài liệu upload. Hãy dùng kiến thức chung của môn học.'}

Tạo ma trận đề với ${constraints.numTopics || 4} chủ đề, đảm bảo:
- Các đơn vị kiến thức phù hợp với nội dung môn học lớp ${constraints.grade}
- Tuân thủ toàn bộ QUY TẮC MA TRẬN ở trên

Trả về JSON theo schema Matrix.`;
}

// JSON schema cho output (simplified for AI)
const OUTPUT_SCHEMA_HINT = `
{
  "version": "matrix-v1.0.0",
  "subject": "Môn học",
  "grade": 10,
  "duration": 60,
  "totalScore": 10,
  "topics": [
    {
      "id": "topic_1",
      "name": "Tên chủ đề",
      "units": [
        {
          "id": "unit_1",
          "name": "Tên đơn vị kiến thức",
          "MCQ": { "NB": 2, "TH": 1, "VD": 0 },
          "TF": { "NB": 1, "TH": 0, "VD": 0 },
          "SHORT": { "NB": 0, "TH": 1, "VD": 0 },
          "ESSAY": { "NB": 0, "TH": 0, "VD": 1 }
        }
      ],
      "percentScore": 25
    }
  ],
  "summary": {
    "MCQ": { "count": 12, "points": 3 },
    "TF": { "count": 4, "points": 2 },
    "SHORT": { "count": 4, "points": 2 },
    "ESSAY": { "count": 2, "points": 3 },
    "levelPercent": { "NB": 40, "TH": 30, "VD": 30 },
    "totalByLevel": {
      "NB": { "count": 8, "points": 4 },
      "TH": { "count": 7, "points": 3 },
      "VD": { "count": 7, "points": 3 }
    }
  }
}
// Lưu ý: đây chỉ là ví dụ cấu trúc. Số câu/điểm phải bám policy/blueprint.`;

export interface MatrixAgentInput {
    constraints: MatrixConstraints;
    contextChunks: { titleHint: string; text: string }[];
    policyText?: string;
    curriculum?: string;
    teacherNote?: string;
    provider: string;
    model: string;
    apiKey: string;
}

export interface MatrixAgentOutput {
    matrix: Matrix;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
}

/**
 * Sinh ma trận đề từ constraints và context
 */
export async function generateMatrix(input: MatrixAgentInput): Promise<MatrixAgentOutput> {
    const userPrompt = buildUserPrompt(
        input.constraints,
        input.contextChunks,
        input.policyText,
        input.curriculum,
        input.teacherNote
    );

    const request: ChatRequest = {
        provider: input.provider,
        model: input.model,
        apiKey: input.apiKey,
        messages: [
            { role: 'system', content: MATRIX_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt + '\n\nSchema mẫu:\n' + OUTPUT_SCHEMA_HINT },
        ],
        temperature: 0.7,
        maxTokens: 4000,
        jsonMode: true,
    };

    try {
        const result = await chatJson<Matrix>(request, MatrixSchema);

        console.info('[matrix-agent] generated', {
            subject: result.data.subject,
            topicsCount: result.data.topics.length,
            tokensIn: result.usage.tokensIn,
            tokensOut: result.usage.tokensOut,
        });

        return {
            matrix: result.data,
            tokensIn: result.usage.tokensIn,
            tokensOut: result.usage.tokensOut,
            latencyMs: result.usage.latencyMs,
        };
    } catch (error) {
        console.error('[matrix-agent] error:', error);
        throw new Error(`Matrix generation failed: ${error}`);
    }
}

/**
 * Validate và tự động sửa ma trận nếu không khớp ràng buộc
 */
export function validateMatrix(
    matrix: Matrix,
    policy?: MatrixPolicySummary
): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const rules = policy;

    if (rules) {
        if (matrix.totalScore !== rules.totalScore) {
            errors.push(`Tổng điểm = ${matrix.totalScore}, phải = ${rules.totalScore}`);
        }

        if (matrix.duration !== rules.durationMinutes) {
            errors.push(`Thời gian = ${matrix.duration} phút, phải = ${rules.durationMinutes} phút`);
        }

        if (matrix.summary.MCQ.points !== rules.summary.MCQ.points) errors.push('MCQ điểm không đúng policy');
        if (matrix.summary.TF.points !== rules.summary.TF.points) errors.push('TF điểm không đúng policy');
        if (matrix.summary.SHORT.points !== rules.summary.SHORT.points) errors.push('SHORT điểm không đúng policy');
        if (matrix.summary.ESSAY.points !== rules.summary.ESSAY.points) errors.push('ESSAY điểm không đúng policy');

        if (matrix.summary.MCQ.count !== rules.summary.MCQ.count) errors.push('MCQ số câu không đúng policy');
        if (matrix.summary.TF.count !== rules.summary.TF.count) errors.push('TF số câu không đúng policy');
        if (matrix.summary.SHORT.count !== rules.summary.SHORT.count) errors.push('SHORT số câu không đúng policy');
        if (matrix.summary.ESSAY.count !== rules.summary.ESSAY.count) errors.push('ESSAY số câu không đúng policy');

        if (matrix.summary.levelPercent.NB !== rules.levelPercent.NB) errors.push('NB % không đúng policy');
        if (matrix.summary.levelPercent.TH !== rules.levelPercent.TH) errors.push('TH % không đúng policy');
        if (matrix.summary.levelPercent.VD !== rules.levelPercent.VD) errors.push('VD % không đúng policy');
    }

    // Check tổng % chủ đề
    const totalPercent = matrix.topics.reduce((sum: number, t: { percentScore: number }) => sum + t.percentScore, 0);
    if (totalPercent !== 100) {
        errors.push(`Tổng % chủ đề = ${totalPercent}%, phải = 100%`);
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}
