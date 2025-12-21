// Chú thích: MatrixAgent - sinh ma trận đề theo CV 7991
// Sử dụng AI adapter với prompt template versioned

import { chatJson, type ChatRequest } from '../adapters/ai.js';
import { MatrixSchema, type Matrix, type MatrixConstraints } from '@exam-matrix/shared';

// Prompt version để tracking và rollback
export const MATRIX_AGENT_VERSION = 'matrix-agent-v1.0.0';

// System prompt cho MatrixAgent
const MATRIX_SYSTEM_PROMPT = `Bạn là chuyên gia giáo dục Việt Nam, chuyên xây dựng ma trận đề kiểm tra theo Công văn 7991/BGDĐT-GDTrH (17/12/2024).

NHIỆM VỤ: Tạo ma trận đề kiểm tra định kỳ cho môn học và lớp được yêu cầu.

CẤU TRÚC ĐỀ THEO CV 7991 (BẮT BUỘC):
1. Tổng điểm: 10 điểm
2. Trắc nghiệm khách quan: 7 điểm
   - Nhiều lựa chọn (MCQ): 3 điểm
   - Đúng/Sai (TF): 2 điểm (mỗi câu 4 ý)
   - Trả lời ngắn (SHORT): 2 điểm
3. Tự luận (ESSAY): 3 điểm
4. Tỷ lệ nhận thức: NB 40% / TH 30% / VD 30%
5. Thời gian: 60 phút

MỨC ĐỘ NHẬN THỨC:
- NB (Nhận biết): Nhớ, nhận ra kiến thức đã học
- TH (Thông hiểu): Giải thích, so sánh, phân tích đơn giản
- VD (Vận dụng): Áp dụng vào tình huống mới, giải quyết vấn đề

QUY TẮC:
1. Phân bổ câu hỏi đều cho các chủ đề
2. Mỗi chủ đề có từ 1-3 đơn vị kiến thức
3. Tổng tỷ lệ % các chủ đề = 100%
4. Số câu và điểm phải khớp với cấu trúc CV 7991

OUTPUT: JSON theo schema được cung cấp, KHÔNG có text giải thích.`;

// User prompt template
function buildUserPrompt(
    constraints: MatrixConstraints,
    contextChunks: { titleHint: string; text: string }[],
    teacherNote?: string
): string {
    const chunksSummary = contextChunks
        .slice(0, 10)
        .map((c, i) => `[${i + 1}] ${c.titleHint}: ${c.text.slice(0, 200)}...`)
        .join('\n');

    // Chú thích: Ghi chú của giáo viên được ưu tiên để định hướng ma trận.
    const teacherNoteSection = teacherNote
        ? `Ghi chú mong muốn của giáo viên: ${teacherNote}`
        : '';

    return `Môn học: ${constraints.subject}
Lớp: ${constraints.grade}
Thời gian: ${constraints.duration || 60} phút
Số chủ đề: ${constraints.numTopics || 4}
${constraints.scope ? `Phạm vi: ${constraints.scope.join(', ')}` : ''}
${teacherNoteSection}

NỘI DUNG TÀI LIỆU (tham khảo để chọn chủ đề/đơn vị kiến thức):
${chunksSummary || 'Không có tài liệu upload. Hãy dùng kiến thức chung của môn học.'}

Tạo ma trận đề với ${constraints.numTopics || 4} chủ đề, đảm bảo:
- Tổng điểm = 10 (MCQ 3đ + TF 2đ + SHORT 2đ + ESSAY 3đ)
- Tỷ lệ NB/TH/VD = 40/30/30
- Các đơn vị kiến thức phù hợp với nội dung môn học lớp ${constraints.grade}

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
}`;

export interface MatrixAgentInput {
    constraints: MatrixConstraints;
    contextChunks: { titleHint: string; text: string }[];
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
    const userPrompt = buildUserPrompt(input.constraints, input.contextChunks, input.teacherNote);

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
export function validateMatrix(matrix: Matrix): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check tổng điểm
    const totalPoints =
        matrix.summary.MCQ.points +
        matrix.summary.TF.points +
        matrix.summary.SHORT.points +
        matrix.summary.ESSAY.points;

    if (totalPoints !== 10) {
        errors.push(`Tổng điểm = ${totalPoints}, phải = 10`);
    }

    // Check điểm từng loại
    if (matrix.summary.MCQ.points !== 3) errors.push('MCQ phải = 3 điểm');
    if (matrix.summary.TF.points !== 2) errors.push('TF phải = 2 điểm');
    if (matrix.summary.SHORT.points !== 2) errors.push('SHORT phải = 2 điểm');
    if (matrix.summary.ESSAY.points !== 3) errors.push('ESSAY phải = 3 điểm');

    // Check tỷ lệ mức độ
    if (matrix.summary.levelPercent.NB !== 40) errors.push('NB phải = 40%');
    if (matrix.summary.levelPercent.TH !== 30) errors.push('TH phải = 30%');
    if (matrix.summary.levelPercent.VD !== 30) errors.push('VD phải = 30%');

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
