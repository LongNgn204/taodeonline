// Chú thích: ExamAgent - sinh đề thi từ ma trận với citations (theo policy/blueprint)
// Mỗi câu hỏi phải dựa trên tài liệu upload, kèm trích dẫn nguồn

import { chat, chatJson, type ChatRequest } from '../adapters/ai.js';
import {
    ExamContentSchema,
    type ExamContent,
    type Matrix,
    type Question,
} from '@exam-matrix/shared';

// Prompt version
export const EXAM_AGENT_VERSION = 'exam-agent-v1.0.0';

// System prompt cho ExamAgent
const EXAM_SYSTEM_PROMPT = `Bạn là giáo viên chuyên môn, nhiệm vụ sinh câu hỏi kiểm tra từ ma trận đề theo policy/blueprint.

QUY TẮC VỀ NỘI DUNG:
1. Mỗi câu hỏi PHẢI dựa trên nội dung tài liệu được cung cấp
2. PHẢI kèm citations (chunkId + trích đoạn gốc) cho mỗi câu
3. Không bịa đặt thông tin không có trong tài liệu
4. Câu hỏi phải phù hợp mức độ nhận thức (NB/TH/VD)

CẤU TRÚC CÂU HỎI (theo policy/blueprint):

1. MCQ (Nhiều lựa chọn):
   - 4 lựa chọn A, B, C, D
   - Chỉ 1 đáp án đúng
   - answerKey: "A" hoặc "B" hoặc "C" hoặc "D"

2. TF (Đúng/Sai):
   - Mỗi câu có 4 ý (a, b, c, d)
   - Mỗi ý là một phát biểu đúng hoặc sai
   - answerKey: "ĐSĐS" (Đ=Đúng, S=Sai)

3. SHORT (Trả lời ngắn):
   - Yêu cầu trả lời 1-3 từ/số
   - answerKey: câu trả lời chính xác

4. ESSAY (Tự luận):
   - Câu hỏi mở, yêu cầu lập luận
   - answerKey: ý chính cần có
   - solution: hướng dẫn chấm chi tiết

MỨC ĐỘ NHẬN THỨC:
- NB (Nhận biết): Nhớ lại, nhận diện thông tin
- TH (Thông hiểu): Giải thích, so sánh, phân tích
- VD (Vận dụng): Áp dụng vào tình huống mới

OUTPUT: JSON theo schema ExamContent, KHÔNG có text giải thích.`;

// Build user prompt từ matrix và chunks
function buildExamPrompt(
    matrix: Matrix,
    chunks: { id: string; titleHint: string; text: string }[],
    policyText?: string
): string {
    const chunksList = chunks
        .map((c) => `[${c.id}] ${c.titleHint}:\n${c.text}`)
        .join('\n\n---\n\n');

    const matrixSummary = matrix.topics
        .map(
            (t) =>
                `- ${t.name}: ${t.units
                    .map((u) => {
                        const parts: string[] = [];
                        if (u.MCQ) parts.push(`MCQ(NB:${u.MCQ.NB},TH:${u.MCQ.TH},VD:${u.MCQ.VD})`);
                        if (u.TF) parts.push(`TF(NB:${u.TF.NB},TH:${u.TF.TH},VD:${u.TF.VD})`);
                        if (u.SHORT) parts.push(`SHORT(NB:${u.SHORT.NB},TH:${u.SHORT.TH},VD:${u.SHORT.VD})`);
                        if (u.ESSAY) parts.push(`ESSAY(NB:${u.ESSAY.NB},TH:${u.ESSAY.TH},VD:${u.ESSAY.VD})`);
                        return `${u.name}: ${parts.join(', ')}`;
                    })
                    .join('; ')}`
        )
        .join('\n');

    return `MA TRẬN ĐỀ:
Môn: ${matrix.subject} - Lớp ${matrix.grade}
Thời gian: ${matrix.duration} phút

QUY TẮC SINH ĐỀ (bắt buộc):
${policyText || 'Theo cấu hình mặc định của hệ thống.'}

Phân bổ câu hỏi:
${matrixSummary}

Tổng: MCQ ${matrix.summary.MCQ.count} câu (${matrix.summary.MCQ.points}đ), TF ${matrix.summary.TF.count} câu (${matrix.summary.TF.points}đ), SHORT ${matrix.summary.SHORT.count} câu (${matrix.summary.SHORT.points}đ), ESSAY ${matrix.summary.ESSAY.count} câu (${matrix.summary.ESSAY.points}đ)

TÀI LIỆU NGUỒN (dùng để sinh câu hỏi):
${chunksList || 'Không có tài liệu. Dùng kiến thức chung phù hợp lớp ' + matrix.grade}

Sinh đề thi với:
- 4 sections: MCQ, TF, SHORT, ESSAY
- Số câu và điểm đúng theo ma trận
- Mỗi câu có sources[] chứa chunkId và quote từ tài liệu
- Đáp án đúng cho mỗi câu

Trả về JSON theo schema ExamContent.`;
}

// Schema hint cho AI
const EXAM_SCHEMA_HINT = `
{
  "version": "exam-v1.0.0",
  "title": "ĐỀ KIỂM TRA ĐỊNH KỲ",
  "subject": "Môn học",
  "grade": 10,
  "duration": 60,
  "totalScore": 10,
  "createdAt": "2024-01-01T00:00:00Z",
  "matrixVersion": "matrix-v1.0.0",
  "sections": [
    {
      "type": "MCQ",
      "title": "PHẦN I. TRẮC NGHIỆM NHIỀU LỰA CHỌN (3 điểm)",
      "totalPoints": 3,
      "questions": [
        {
          "id": "q1",
          "type": "MCQ",
          "level": "NB",
          "topicId": "topic_1",
          "unitId": "unit_1",
          "prompt": "Câu hỏi?",
          "options": [
            { "label": "A", "content": "Đáp án A" },
            { "label": "B", "content": "Đáp án B" },
            { "label": "C", "content": "Đáp án C" },
            { "label": "D", "content": "Đáp án D" }
          ],
          "answerKey": "A",
          "points": 0.25,
          "sources": [{ "chunkId": "chunk_1", "quote": "Trích đoạn từ tài liệu" }]
        }
      ]
    },
    {
      "type": "TF",
      "title": "PHẦN II. TRẮC NGHIỆM ĐÚNG/SAI (2 điểm)",
      "totalPoints": 2,
      "questions": [
        {
          "id": "q7",
          "type": "TF",
          "level": "TH",
          "topicId": "topic_2",
          "unitId": "unit_2",
          "prompt": "Xét các phát biểu sau:",
          "tfItems": [
            { "id": "a", "statement": "Phát biểu a", "isTrue": true },
            { "id": "b", "statement": "Phát biểu b", "isTrue": false },
            { "id": "c", "statement": "Phát biểu c", "isTrue": true },
            { "id": "d", "statement": "Phát biểu d", "isTrue": false }
          ],
          "answerKey": "ĐSĐS",
          "points": 0.5,
          "sources": [{ "chunkId": "chunk_2", "quote": "Trích đoạn" }]
        }
      ]
    }
  ]
}`;

export interface ExamAgentInput {
    matrix: Matrix;
    chunks: { id: string; titleHint: string; text: string }[];
    policyText?: string;
    provider: string;
    model: string;
    apiKey: string;
}

export interface ExamAgentOutput {
    exam: ExamContent;
    tokensIn: number;
    tokensOut: number;
    latencyMs: number;
}

/**
 * Sinh đề thi từ ma trận và tài liệu
 */
export async function generateExam(input: ExamAgentInput): Promise<ExamAgentOutput> {
    const userPrompt = buildExamPrompt(input.matrix, input.chunks, input.policyText);

    const request: ChatRequest = {
        provider: input.provider,
        model: input.model,
        apiKey: input.apiKey,
        messages: [
            { role: 'system', content: EXAM_SYSTEM_PROMPT },
            { role: 'user', content: userPrompt + '\n\nSchema mẫu:\n' + EXAM_SCHEMA_HINT },
        ],
        temperature: 0.8,
        maxTokens: 8000,
        jsonMode: true,
    };

    try {
        const result = await chatJson<ExamContent>(request, ExamContentSchema);

        console.info('[exam-agent] generated', {
            sectionsCount: result.data.sections.length,
            questionsCount: result.data.sections.reduce((sum, s) => sum + s.questions.length, 0),
            tokensIn: result.usage.tokensIn,
            tokensOut: result.usage.tokensOut,
        });

        return {
            exam: result.data,
            tokensIn: result.usage.tokensIn,
            tokensOut: result.usage.tokensOut,
            latencyMs: result.usage.latencyMs,
        };
    } catch (error) {
        console.error('[exam-agent] error:', error);
        throw new Error(`Exam generation failed: ${error}`);
    }
}

/**
 * Sinh lại một câu hỏi cụ thể
 */
export async function regenerateQuestion(
    question: Question,
    chunks: { id: string; titleHint: string; text: string }[],
    constraints: string,
    provider: string,
    model: string,
    apiKey: string
): Promise<Question> {
    const prompt = `Sinh lại câu hỏi này với yêu cầu: ${constraints || 'Tạo câu hỏi mới tương tự'}

Câu hỏi hiện tại:
${JSON.stringify(question, null, 2)}

Tài liệu nguồn:
${chunks.map((c) => `[${c.id}] ${c.text.slice(0, 300)}`).join('\n')}

Trả về JSON câu hỏi mới với cùng format, có sources[] mới.`;

    const request: ChatRequest = {
        provider,
        model,
        apiKey,
        messages: [
            { role: 'system', content: 'Bạn là giáo viên, sinh câu hỏi kiểm tra từ tài liệu.' },
            { role: 'user', content: prompt },
        ],
        temperature: 0.9,
        maxTokens: 2000,
        jsonMode: true,
    };

    const response = await chat(request);

    // Parse response
    const jsonMatch = response.content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('No JSON in response');
    }

    return JSON.parse(jsonMatch[0]) as Question;
}
