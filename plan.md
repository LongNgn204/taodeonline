Bạn là AI Fullstack Engineer triển khai dự án mã nguồn mở: “Exam Matrix & Test Generator (CV 7991)”.
Mục tiêu: giúp giáo viên tạo “Ma trận đề kiểm tra định kỳ” và “Đề kiểm tra” theo Công văn 7991/BGDĐT-GDTrH (17/12/2024), bám sát CTGDPT 2018. Output phải xuất đúng template Excel/Word, có ký hiệu toán học/hoá học chuẩn.

Yêu cầu nền tảng:
- Frontend: React + Vite + TypeScript, UI đơn giản, rõ ràng cho giáo viên.
- Backend: Cloudflare Workers (TypeScript) + Hono (router).
- Deploy: Cloudflare Pages (frontend) + Workers API; DB: Cloudflare D1; File storage: Cloudflare R2; KV (cache).
- Auth: đăng ký/đăng nhập (email+password) + session JWT HttpOnly cookie.
- Lưu lịch sử: lưu đề đã tạo, ma trận, file export, metadata.
- AI: hỗ trợ chọn nhiều model/provider (OpenAI/Anthropic/…); user nhập API key (khuyến nghị lưu LOCAL trên trình duyệt; backend chỉ dùng key để proxy call và không log).
- Upload file: hỗ trợ PDF/Docx/Xlsx (SGK + Mẫu ma trận CV 7991). Hệ thống phải trích text và dùng làm nguồn duy nhất để sinh nội dung (RAG).
- Tạo ma trận: đúng cấu trúc CV 7991 (cột lớn/cột nhỏ đúng chuẩn), thời gian 60 phút, tổng 10 điểm, TN 7đ + TL 3đ, và tỉ lệ nhận thức 40/30/30.
- Sinh đề: từ ma trận -> tạo câu hỏi đúng số lượng/dạng/điểm; có đáp án; có hướng dẫn chấm (ít nhất phần TN và đúng/sai).
- Chấm tự động: TN nhiều lựa chọn + Đúng/Sai + Trả lời ngắn (theo key); TL để chấm thủ công (giai đoạn 1) + tùy chọn AI gợi ý (giai đoạn 2).
- Export: 
  - Excel: Ma trận theo đúng template (không đổi cấu trúc). 
  - Word: Đề thi + Đáp án + Hướng dẫn chấm (tùy chọn tách file).
- Ký hiệu toán học/hoá học: hỗ trợ superscript/subscript cơ bản (m³, H₂O, CO₂, …), và render/đúng trong Word.

Nguyên tắc “chống sai/ảo tưởng”:
- Khi sinh câu hỏi, bắt buộc mô hình phải dựa trên các đoạn trích từ tài liệu upload. 
- Mỗi câu hỏi phải kèm danh sách “nguồn tham chiếu” (id chunk + trích đoạn) để giáo viên kiểm chứng.
- Có bước “Validator” kiểm tra ma trận đúng ràng buộc (điểm/tỉ lệ/số câu/dạng câu) và kiểm tra đề phù hợp ma trận; nếu sai thì tự sửa.

Tổ chức code:
- Monorepo (pnpm + turbo):
  - apps/web (React Vite)
  - apps/api (Cloudflare Worker)
  - packages/shared (types + schema + utils)
  - packages/export (excel/word generators)
  - packages/rag (chunking + retrieval)
- Dùng TypeScript strict, ESLint, Prettier, Vitest (unit), Playwright (smoke UI).

Luồng nghiệp vụ chính:
1) User đăng nhập.
2) User tạo “Library” (bộ sách): chọn lớp (1-12) + môn + bộ sách + học kỳ + thời lượng 60’.
3) User upload tài liệu (SGK PDF/DOCX + mẫu ma trận XLSX/DOCX). Hệ thống:
   - Lưu file vào R2
   - Trích text (ưu tiên trích trên client cho PDF bằng pdfjs; docx/xlsx parse bằng libs JS; sau đó gửi text về backend)
   - Chunk text + lưu chunks vào D1 (và KV cache).
4) User nhập tham số tạo đề:
   - Môn, lớp, bộ sách, phạm vi (chương/chủ đề), số chủ đề=4, cấu trúc điểm theo CV 7991 (TN 7: MCQ 3đ; Đ/S 2đ; TLN 2đ; TL 3đ), tỉ lệ NB/TH/VD=40/30/30.
5) AI Agent tạo:
   A. MatrixAgent: sinh ma trận ở dạng JSON theo schema chuẩn.
   B. MatrixValidator: kiểm tra tổng điểm, phân bổ, số câu, tỉ lệ; tự điều chỉnh nếu lệch.
   C. ExamAgent: sinh đề từ ma trận. Mỗi câu:
      - lấy top-k chunks theo topic + level (retrieval)
      - prompt model tạo câu hỏi + đáp án + giải thích ngắn + citations
   D. ExamValidator: so khớp số câu/dạng/level với ma trận; rà lỗi hình thức; sửa nếu cần.
6) UI hiển thị:
   - Ma trận dạng bảng preview (giống template)
   - Đề thi preview (phân phần I/II/III)
   - Panel chỉnh sửa thủ công (edit text) + nút “Regenerate câu này”
7) Save -> lưu vào D1.
8) Export:
   - Excel ma trận: điền vào template XLSX gốc (giữ nguyên cấu trúc)
   - Word đề thi: layout chuẩn, font, đánh số, đáp án/HD chấm.

BẮT BUỘC: Thiết kế schema dữ liệu + API contract rõ ràng. Code chạy được end-to-end trên Cloudflare dev (wrangler dev) và build deploy được.

========================
CHI TIẾT CẦN TRIỂN KHAI
========================

A) Data Model (D1)
- users: id, email, password_hash, created_at
- libraries: id, user_id, subject, grade, bookset, term, duration_minutes, created_at
- documents: id, library_id, user_id, filename, file_type, r2_key, extracted_text_status, created_at
- doc_chunks: id, document_id, chunk_index, title_hint, text, tokens_est, created_at
- exams: id, library_id, user_id, title, matrix_json, exam_json, created_at, updated_at
- exports: id, exam_id, user_id, type (matrix_xlsx/exam_docx), r2_key, created_at
- attempts (optional v1.1): id, exam_id, user_id, student_name, answers_json, score_json, created_at

B) API Endpoints (Worker)
Auth:
- POST /auth/register {email,password}
- POST /auth/login {email,password} -> set cookie
- POST /auth/logout
- GET /me

Libraries:
- POST /libraries
- GET /libraries
- GET /libraries/:id

Documents:
- POST /libraries/:id/documents/initiate-upload -> signed upload (R2) OR direct upload stream
- POST /libraries/:id/documents/complete {documentId, extractedText, meta}
- GET /libraries/:id/documents
- GET /documents/:id/chunks

Generation:
- POST /exams/generate-matrix {libraryId, scope, constraints, provider, model, apiKeyFromClient}
- POST /exams/generate-exam {libraryId, matrixJson, provider, model, apiKeyFromClient}
- POST /exams/:id/regenerate-question {questionId, constraints, provider, model, apiKey}
- POST /exams/:id/validate

Persistence:
- POST /exams (save)
- GET /exams?libraryId=
- GET /exams/:id
- PUT /exams/:id

Export:
- POST /exams/:id/export/matrix-xlsx -> returns download url
- POST /exams/:id/export/exam-docx -> returns download url

Grading:
- POST /exams/:id/grade {answersJson} -> score breakdown (MCQ/TF/short)

C) RAG (giai đoạn 1: keyword retrieval)
- Chunking: split theo heading/đoạn; chunk 800-1200 ký tự; overlap 100-150.
- Retrieval: tìm chunk theo keyword (BM25-lite hoặc TF-IDF đơn giản); trả top 5–8 chunks.
- Giai đoạn 1.1: thêm embeddings (tuỳ chọn) + Cloudflare Vectorize.

D) Prompting / Schema (cứng hoá output để parse)
- Tất cả agent output JSON theo Zod schema.
- Matrix schema: topics[4], units[], distribution per type (MCQ/TF/Short/Essay) x levels (NB/TH/VD), points, totals, percent.
- Exam schema: sections (I MCQ, II TF, III Short, IV Essay), questions[] with:
  - id, type, level, topic, unit, prompt, options?, answerKey, solution?, points, sources[{chunkId, quote}]
- Validator schema: list errors + corrected matrix/exam.

E) Export (template-first)
- Repo chứa templates:
  - templates/matrix_template.xlsx (đúng cấu trúc CV 7991)
  - templates/exam_template.docx (header + style)
- Excel export: dùng exceljs load template và fill đúng cell mapping (không đổi merge/cột).
- Word export: dùng docx library; style consistent; hỗ trợ subscript/superscript mapping cho hoá học và đơn vị.

F) UI/UX tối giản (cho giáo viên)
- Sidebar: Library, New Exam, History, Settings (AI models & key)
- Wizard tạo đề:
  Step 1: chọn lớp/môn/bộ sách + upload file
  Step 2: chọn phạm vi/chủ đề + ràng buộc (mặc định CV 7991)
  Step 3: Generate Matrix -> preview -> “Lock matrix”
  Step 4: Generate Exam -> preview -> edit/regenerate -> Save
  Step 5: Export + Grade tools

G) Bảo mật API key
- Mặc định: API key lưu localStorage (client). Backend nhận key trong request và dùng để proxy call model; tuyệt đối không log request body. 
- Thêm “mask” UI và cảnh báo.
- Tùy chọn v1.1: lưu key encrypted (PBKDF2 từ password) nhưng không bắt buộc.

H) Implementation details
- Cloudflare Worker + Hono, middleware auth cookie.
- Password hashing: bcryptjs hoặc scrypt(WebCrypto).
- Rate-limit per user (KV): tránh spam AI.
- CORS: chỉ allow origin của Pages.
- Observability: structured logs + error boundary.

========================
KẾ HOẠCH TRIỂN KHAI (MILESTONES)
========================
M0 (Day 0): Scaffold monorepo + CI + deploy skeleton (Pages/Worker/D1/R2)
M1: Auth + Libraries CRUD + basic UI dashboard
M2: Upload docs -> parse text -> chunk -> store D1 -> view chunks
M3: Model adapters (OpenAI/Anthropic generic) + Settings UI model/key
M4: MatrixAgent + MatrixValidator (JSON schema) + preview table
M5: ExamAgent + ExamValidator + preview exam + regenerate question
M6: Save history + list exams + load exam
M7: Export matrix Excel (template fill) + export exam Word
M8: Auto-grading for objective questions + report score
M9: Polish + docs + OSS release (MIT) + sample dataset + demo

========================
OUTPUT CỦA BẠN (AI AGENT) PHẢI BAO GỒM
========================
1) Repo code đầy đủ theo monorepo structure
2) README: setup local, deploy Cloudflare, env vars, screenshots
3) Migration SQL cho D1
4) Templates (xlsx/docx) + mapping cells
5) Prompt templates + Zod schema
6) E2E demo: tạo library -> upload -> generate matrix -> generate exam -> export

Bắt đầu bằng việc tạo cấu trúc dự án, sau đó triển khai M0->M9 tuần tự.
