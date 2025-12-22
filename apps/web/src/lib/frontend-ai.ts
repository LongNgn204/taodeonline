// Chú thích: Frontend AI utilities - gọi AI trực tiếp từ browser
// Sử dụng API key của user, không qua backend
// BYOK strict: key không gửi lên server

import { getAIConfig, AI_ENDPOINTS } from './ai-config';

// ===== POLICY CONTEXT (DATA-DRIVEN) =====

/**
 * PolicyContext từ backend - chứa policyText để inject vào prompt
 * Chú thích: Thay vì hardcode CV7991, ta lấy policy context từ API
 */
export interface PolicyContext {
  policyText: string;
  constraints: Record<string, unknown>;
  questionTypes: Record<string, unknown>;
  schemaHints: unknown;
  policyRefs: string[];
  policyVersion: string;
}

/**
 * Fetch policy context từ backend
 * Chú thích: API trả về policyText đã resolve từ policy registry
 */
export async function fetchPolicyContext(
  taskType: 'matrix' | 'exam' | 'lessonplan',
  params: { grade: number; subject: string; assessmentType?: string }
): Promise<PolicyContext> {
  const searchParams = new URLSearchParams({
    grade: params.grade.toString(),
    subject: params.subject,
    assessmentType: params.assessmentType || 'school_assessment',
  });

  // TODO: Thay bằng URL production khi deploy
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const url = `${apiBase}/policy-context/${taskType}?${searchParams}`;

  console.info('[fetchPolicyContext]', { taskType, params, url });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể lấy policy context: ${response.status}`);
  }

  return response.json();
}

// ===== RAG CONTEXT (AI đọc thư viện user) =====

/**
 * Context chunk từ thư viện tài liệu
 */
export interface ContextChunk {
  chunkId: string;
  docId: string;
  titleHint: string;
  text: string;
  page?: number;
}

export interface RagContextResponse {
  contextChunks: ContextChunk[];
  retrievalMeta: {
    method: string;
    topK: number;
    filtersApplied: string[];
    totalChunksSearched: number;
  };
}

/**
 * Fetch RAG context từ backend
 * Chú thích: Lấy context chunks từ thư viện tài liệu để inject vào prompt
 */
export async function fetchRagContext(params: {
  taskType: 'matrix' | 'exam' | 'lessonplan' | 'skkn';
  libraryId?: string;
  documentIds?: string[];
  query?: string;
  topic?: string;
  topK?: number;
}): Promise<RagContextResponse> {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const url = `${apiBase}/rag/context`;

  console.info('[fetchRagContext]', params);

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include', // Cần auth
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Vui lòng đăng nhập để sử dụng tài liệu từ thư viện.');
    }
    throw new Error(`Không thể lấy context từ thư viện: ${response.status}`);
  }

  return response.json();
}

/**
 * Build context section cho prompt từ chunks
 */
export function buildContextSection(chunks: ContextChunk[]): string {
  if (chunks.length === 0) return '';

  const chunkTexts = chunks.map((c, i) =>
    `[Nguồn ${i + 1} - ${c.titleHint} (ID: ${c.chunkId})]\n${c.text}`
  ).join('\n\n---\n\n');

  return `
TÀI LIỆU NGUỒN TỪ THƯ VIỆN:
---
${chunkTexts}
---

Khi tạo câu hỏi dựa trên tài liệu, thêm sources[] với chunkId và quote cho mỗi câu.
`;
}

// ===== GENERIC SYSTEM PROMPTS (không hardcode công văn cụ thể) =====

/**
 * System prompt cho tạo ma trận - GENERIC
 * Chú thích: policyText sẽ được inject vào {POLICY_TEXT} placeholder
 */
export function buildMatrixSystemPrompt(policyText: string): string {
  return `Bạn là chuyên gia giáo dục Việt Nam, chuyên xây dựng ma trận đề kiểm tra theo các quy định hiện hành.

NHIỆM VỤ: Tạo ma trận đề kiểm tra định kỳ cho môn học và lớp được yêu cầu.

QUY ĐỊNH ÁP DỤNG:
${policyText}

MỨC ĐỘ NHẬN THỨC:
- NB (Nhận biết): Nhớ, nhận ra kiến thức đã học
- TH (Thông hiểu): Giải thích, so sánh, phân tích đơn giản
- VD (Vận dụng): Áp dụng vào tình huống mới, giải quyết vấn đề

QUY TẮC:
1. Phân bổ câu hỏi đều cho các chủ đề
2. Mỗi chủ đề có từ 1-3 đơn vị kiến thức
3. Tổng tỷ lệ % các chủ đề = 100%
4. Số câu và điểm phải khớp với quy định

OUTPUT: JSON theo schema được cung cấp, KHÔNG có text giải thích.`;
}

/**
 * System prompt cho tạo đề - GENERIC
 */
export function buildExamSystemPrompt(policyText: string): string {
  return `Bạn là chuyên gia giáo dục Việt Nam, chuyên soạn đề kiểm tra theo các quy định hiện hành.

NHIỆM VỤ: Dựa trên ma trận đề đã cho, sinh nội dung câu hỏi cụ thể cho từng mức độ và loại câu hỏi.

QUY ĐỊNH ÁP DỤNG:
${policyText}

YÊU CẦU:
1. MCQ: 4 lựa chọn A/B/C/D, 1 đáp án đúng
2. TF (Đúng/Sai): Mỗi câu có 4 mệnh đề, học sinh chọn Đ/S cho từng mệnh đề
3. SHORT: Câu trả lời ngắn 1-2 từ/số
4. ESSAY: Câu hỏi tự luận yêu cầu giải thích, phân tích

PHONG CÁCH:
- Ngôn ngữ chuẩn, rõ ràng
- Phù hợp với trình độ học sinh
- Có tính thực tiễn, liên hệ đời sống khi phù hợp
- Đáp án chính xác và có giải thích ngắn gọn

OUTPUT: JSON theo schema ExamContent, KHÔNG có text giải thích.`;
}

// Legacy exports for backward compatibility
// Chú thích: Các prompt cũ vẫn giữ để không break code hiện có, nhưng deprecated
/** @deprecated Dùng buildMatrixSystemPrompt(policyText) thay thế */
export const MATRIX_SYSTEM_PROMPT = buildMatrixSystemPrompt(
  '- Thời gian: 60 phút\n- Tổng điểm: 10 điểm\n- Tỷ lệ NB/TH/VD: 40/30/30'
);

/** @deprecated Dùng buildExamSystemPrompt(policyText) thay thế */
export const EXAM_SYSTEM_PROMPT = buildExamSystemPrompt(
  '- Đề kiểm tra định kỳ theo quy định hiện hành'
);

// Schema hint cho matrix output
export const MATRIX_SCHEMA_HINT = `
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

// Schema hint cho exam output
export const EXAM_SCHEMA_HINT = `
{
  "title": "Đề kiểm tra ...",
  "subject": "Môn học",
  "grade": 10,
  "duration": 60,
  "sections": [
    {
      "id": "section_1",
      "title": "Phần I. Trắc nghiệm",
      "type": "MCQ",
      "questions": [
        {
          "id": "q1",
          "content": "Nội dung câu hỏi",
          "level": "NB",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctAnswer": "A",
          "explanation": "Giải thích ngắn"
        }
      ]
    },
    {
      "id": "section_2", 
      "title": "Phần II. Đúng/Sai",
      "type": "TF",
      "questions": [
        {
          "id": "tf1",
          "content": "Cho các mệnh đề sau:",
          "level": "NB",
          "statements": [
            { "id": "a", "text": "Mệnh đề a", "isTrue": true },
            { "id": "b", "text": "Mệnh đề b", "isTrue": false }
          ]
        }
      ]
    },
    {
      "id": "section_3",
      "title": "Phần III. Trả lời ngắn", 
      "type": "SHORT",
      "questions": [
        {
          "id": "s1",
          "content": "Câu hỏi trả lời ngắn",
          "level": "TH",
          "correctAnswer": "đáp án"
        }
      ]
    },
    {
      "id": "section_4",
      "title": "Phần IV. Tự luận",
      "type": "ESSAY",
      "questions": [
        {
          "id": "e1",
          "content": "Câu hỏi tự luận",
          "level": "VD",
          "points": 1.5,
          "rubric": "Hướng dẫn chấm"
        }
      ]
    }
  ]
}`;

// ===== AI CALL FUNCTIONS =====

interface AICallOptions {
  systemPrompt: string;
  userPrompt: string;
  jsonMode?: boolean;
}

/**
 * Gọi AI trực tiếp từ frontend
 * Chú thích: Sử dụng API key của user từ localStorage
 */
export async function callAI(options: AICallOptions): Promise<string> {
  const { apiKey, providerId, modelId } = getAIConfig();

  if (!apiKey) {
    throw new Error('Vui lòng cấu hình API Key trong phần Cài đặt.');
  }
  if (!modelId) {
    throw new Error('Vui lòng chọn Model trong phần Cài đặt.');
  }

  console.info('[callAI] Starting request:', { providerId, modelId, jsonMode: options.jsonMode });

  const messages = [
    { role: 'system' as const, content: options.systemPrompt },
    { role: 'user' as const, content: options.userPrompt }
  ];

  let url: string;
  let headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Chú thích: Xử lý từng provider khác nhau
  if (providerId === 'openrouter') {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['HTTP-Referer'] = window.location.origin;
    headers['X-Title'] = 'Kien Tao Viet';
  } else if (providerId === 'google') {
    // Google Gemini có format khác
    url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;
    const googleBody = {
      contents: [{ role: 'user', parts: [{ text: options.userPrompt }] }],
      systemInstruction: { parts: [{ text: options.systemPrompt }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
        ...(options.jsonMode && { responseMimeType: 'application/json' })
      }
    };
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(googleBody) });
    if (!res.ok) {
      const errText = await res.text();
      console.error('[callAI] Google error:', res.status, errText);
      throw new Error(`Google API lỗi (${res.status}): ${errText.slice(0, 150)}`);
    }
    const data = await res.json();
    console.info('[callAI] Google response received');
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!content) {
      console.error('[callAI] Empty Google response:', JSON.stringify(data).slice(0, 500));
      throw new Error('Google AI trả về response rỗng.');
    }
    return content;
  } else {
    // OpenAI-compatible providers
    const baseUrl = AI_ENDPOINTS[providerId] || AI_ENDPOINTS.openai;
    url = `${baseUrl}/chat/completions`;
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Standard OpenAI-compatible request
  // Chú thích: Không dùng json_mode cho OpenRouter vì nhiều free models không hỗ trợ
  const useJsonMode = options.jsonMode && providerId !== 'openrouter';

  const body = {
    model: modelId,
    messages,
    temperature: 0.7,
    max_tokens: 8192,
    ...(useJsonMode && { response_format: { type: 'json_object' } }),
  };

  console.info('[callAI] Sending request to:', url.split('?')[0]);

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[callAI] API error:', response.status, errorText);
    throw new Error(`API lỗi (${response.status}): ${errorText.slice(0, 150)}`);
  }

  const data = await response.json();
  console.info('[callAI] Response received:', {
    hasChoices: !!data.choices,
    choicesLength: data.choices?.length,
    contentLength: data.choices?.[0]?.message?.content?.length
  });

  const content = data.choices?.[0]?.message?.content || '';

  if (!content) {
    console.error('[callAI] Empty response data:', JSON.stringify(data).slice(0, 1000));
    throw new Error('AI trả về response rỗng. Có thể model không khả dụng hoặc API key hết quota.');
  }

  return content;
}

/**
 * Gọi AI và parse JSON response
 */
export async function callAIJson<T>(options: AICallOptions): Promise<T> {
  const content = await callAI({ ...options, jsonMode: true });

  console.info('[callAIJson] Content received, length:', content.length);
  console.info('[callAIJson] Content preview:', content.slice(0, 300));

  // Tìm JSON trong response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('[callAIJson] No JSON found in content:', content.slice(0, 500));
    throw new Error('AI không trả về JSON hợp lệ. Vui lòng thử lại hoặc chọn model khác.');
  }

  try {
    return JSON.parse(jsonMatch[0]) as T;
  } catch (e) {
    console.error('[callAIJson] Parse error:', e, content.slice(0, 500));
    throw new Error('Không thể parse JSON từ AI. Vui lòng thử lại.');
  }
}

// ===== HIGH-LEVEL FUNCTIONS =====

export interface MatrixConstraints {
  subject: string;
  grade: number;
  duration?: number;
  numTopics?: number;
  scope?: string[];
  documentContext?: string; // NEW: Nội dung tài liệu từ thư viện (SGK, sách bài tập)
}

/**
 * Sinh ma trận đề từ frontend
 * Chú thích: Nếu có documentContext, AI sẽ dựa vào nội dung thực tế để tạo ma trận chuẩn xác
 */
export async function generateMatrixFrontend(constraints: MatrixConstraints): Promise<any> {
  // Chú thích: Xây dựng phần tài liệu nguồn nếu có
  const documentSection = constraints.documentContext
    ? `
TÀI LIỆU NGUỒN (SGK/Sách bài tập):
---
${constraints.documentContext.slice(0, 50000)}
---

Dựa trên tài liệu nguồn trên, hãy xác định các chủ đề và đơn vị kiến thức THỰC TẾ có trong tài liệu.
Tạo ma trận đề bám sát nội dung tài liệu, đảm bảo các câu hỏi có thể được trả lời từ nội dung đã cung cấp.
`
    : '';

  const userPrompt = `${documentSection}
Môn học: ${constraints.subject}
Lớp: ${constraints.grade}
Thời gian: ${constraints.duration || 60} phút
Số chủ đề: ${constraints.numTopics || 4}
${constraints.scope ? `Phạm vi: ${constraints.scope.join(', ')}` : ''}

Tạo ma trận đề với ${constraints.numTopics || 4} chủ đề, đảm bảo:
- Tổng điểm = 10 (MCQ 3đ + TF 2đ + SHORT 2đ + ESSAY 3đ)
- Tỷ lệ NB/TH/VD = 40/30/30
- Các đơn vị kiến thức phù hợp với nội dung môn học lớp ${constraints.grade}
${constraints.documentContext ? '- Các chủ đề và đơn vị kiến thức PHẢI dựa trên tài liệu nguồn đã cung cấp' : ''}

Schema mẫu:
${MATRIX_SCHEMA_HINT}

Trả về JSON theo schema Matrix.`;

  return await callAIJson({
    systemPrompt: MATRIX_SYSTEM_PROMPT,
    userPrompt,
  });
}

/**
 * Sinh đề thi từ ma trận
 * Chú thích: Nếu có documentContext, AI sẽ tạo câu hỏi dựa trên nội dung thực tế
 */
export async function generateExamFrontend(matrix: any, documentContext?: string): Promise<any> {
  // Chú thích: Xây dựng phần tài liệu nguồn nếu có
  const documentSection = documentContext
    ? `
TÀI LIỆU NGUỒN (SGK/Sách bài tập):
---
${documentContext.slice(0, 50000)}
---

QUAN TRỌNG: Tất cả câu hỏi PHẢI được tạo dựa trên nội dung tài liệu nguồn trên.
Đảm bảo câu hỏi có thể được trả lời bằng thông tin trong tài liệu.
Trích dẫn hoặc tham chiếu đến bài học/chương cụ thể khi phù hợp.
`
    : '';

  const userPrompt = `${documentSection}
Dựa trên ma trận đề sau, sinh nội dung câu hỏi cụ thể:

MA TRẬN:
${JSON.stringify(matrix, null, 2)}

YÊU CẦU:
- Tạo đủ số câu hỏi theo ma trận
- MCQ: 4 lựa chọn, có đáp án và giải thích
- TF: 4 mệnh đề Đ/S cho mỗi câu
- SHORT: Đáp án ngắn gọn
- ESSAY: Có rubric chấm điểm
${documentContext ? '- Nội dung câu hỏi PHẢI bám sát tài liệu nguồn đã cung cấp' : ''}

Schema mẫu:
${EXAM_SCHEMA_HINT}

Trả về JSON theo schema ExamContent.`;

  return await callAIJson({
    systemPrompt: EXAM_SYSTEM_PROMPT,
    userPrompt,
  });
}

// ===== NEW: Policy-Driven Generation Functions =====

export interface MatrixConstraintsV2 extends MatrixConstraints {
  assessmentType?: 'school_assessment' | 'graduation_exam';
}

export interface GenerationMetadata {
  policyRefs: string[];
  policyVersion: string;
  promptVersion: string;
  model?: string;
  generatedAt: string;
}

/**
 * Sinh ma trận với policy context từ API (NEW - data-driven)
 * Chú thích: Thay vì hardcode CV7991, lấy policyText từ /policy-context/matrix
 */
export async function generateMatrixWithPolicy(
  constraints: MatrixConstraintsV2
): Promise<{ matrix: any; metadata: GenerationMetadata }> {
  // 1. Fetch policy context từ API
  const policyContext = await fetchPolicyContext('matrix', {
    grade: constraints.grade,
    subject: constraints.subject,
    assessmentType: constraints.assessmentType,
  });

  console.info('[generateMatrixWithPolicy] Policy context loaded:', {
    policyRefs: policyContext.policyRefs,
    policyVersion: policyContext.policyVersion,
  });

  // 2. Build system prompt với policyText
  const systemPrompt = buildMatrixSystemPrompt(policyContext.policyText);

  // 3. Build user prompt
  const documentSection = constraints.documentContext
    ? `
TÀI LIỆU NGUỒN:
---
${constraints.documentContext.slice(0, 50000)}
---
Tạo ma trận bám sát tài liệu nguồn.
`
    : '';

  const userPrompt = `${documentSection}
Môn học: ${constraints.subject}
Lớp: ${constraints.grade}
Thời gian: ${constraints.duration || 60} phút
Số chủ đề: ${constraints.numTopics || 4}
${constraints.scope ? `Phạm vi: ${constraints.scope.join(', ')}` : ''}

Schema mẫu:
${JSON.stringify(policyContext.schemaHints, null, 2)}

Trả về JSON theo schema Matrix.`;

  // 4. Call AI
  const matrix = await callAIJson({
    systemPrompt,
    userPrompt,
  });

  // 5. Return with metadata
  const aiConfig = getAIConfig();
  return {
    matrix,
    metadata: {
      policyRefs: policyContext.policyRefs,
      policyVersion: policyContext.policyVersion,
      promptVersion: 'matrix-agent-v2.0.0',
      model: aiConfig.modelId || undefined,
      generatedAt: new Date().toISOString(),
    },
  };
}

/**
 * Sinh đề với policy context từ API (NEW - data-driven)
 */
export async function generateExamWithPolicy(
  matrix: any,
  options: {
    grade: number;
    subject: string;
    assessmentType?: 'school_assessment' | 'graduation_exam';
    documentContext?: string;
    sourceMode?: 'from_docs' | 'general_knowledge';
  }
): Promise<{ exam: any; metadata: GenerationMetadata }> {
  // 1. Fetch policy context
  const policyContext = await fetchPolicyContext('exam', {
    grade: options.grade,
    subject: options.subject,
    assessmentType: options.assessmentType,
  });

  console.info('[generateExamWithPolicy] Policy context loaded:', {
    policyRefs: policyContext.policyRefs,
    policyVersion: policyContext.policyVersion,
  });

  // 2. Build system prompt
  const systemPrompt = buildExamSystemPrompt(policyContext.policyText);

  // 3. Build user prompt
  const documentSection = options.documentContext
    ? `
TÀI LIỆU NGUỒN:
---
${options.documentContext.slice(0, 50000)}
---
${options.sourceMode === 'from_docs' ? 'Tất cả câu hỏi PHẢI dựa trên tài liệu. Thêm sources[] cho mỗi câu.' : ''}
`
    : '';

  const userPrompt = `${documentSection}
Dựa trên ma trận đề sau, sinh nội dung câu hỏi:

MA TRẬN:
${JSON.stringify(matrix, null, 2)}

YÊU CẦU:
- Tạo đủ số câu hỏi theo ma trận
- MCQ: 4 lựa chọn, có đáp án và giải thích
- TF: 4 mệnh đề Đ/S cho mỗi câu
- SHORT: Đáp án ngắn gọn
- ESSAY: Có rubric chấm điểm
${options.sourceMode === 'from_docs' ? '- Thêm sources[] với chunkId và quote cho mỗi câu' : ''}

Schema mẫu:
${JSON.stringify(policyContext.schemaHints, null, 2)}

Trả về JSON theo schema ExamContent.`;

  // 4. Call AI
  const exam = await callAIJson({
    systemPrompt,
    userPrompt,
  });

  // 5. Return with metadata
  const aiConfig = getAIConfig();
  return {
    exam,
    metadata: {
      policyRefs: policyContext.policyRefs,
      policyVersion: policyContext.policyVersion,
      promptVersion: 'exam-agent-v2.0.0',
      model: aiConfig.modelId || undefined,
      generatedAt: new Date().toISOString(),
    },
  };
}
