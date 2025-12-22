Rõ. Với **Option A (BYOK strict)** thì bạn suy luận đúng: **LLM call chạy từ frontend** nên không thể “chạy nền server” theo kiểu job backend được. Mình sẽ viết lại roadmap theo hướng:

* **Đa Công văn/Thông tư**: dùng **Policy Packs + Policy Engine** (data-driven, không hardcode CV7991 vào prompt).
* **AI bắt buộc đọc thư viện tài liệu user đã upload**: dùng **RAG (hybrid search) + citations**.
* **“Chờ xử lý / user có thể out”** trong phạm vi Option A:

  * user có thể **rời trang trong SPA**, mở tab khác trong app, quay lại xem tiến trình;
  * nhưng **nếu đóng tab/trình duyệt thì job dừng** (bản chất BYOK).
  * để giảm rủi ro “mất tiến trình”, ta làm **Client Job Manager + IndexedDB checkpoint** (resume nếu tab còn sống hoặc user quay lại sớm).

Ngoài ra, bạn nhắc Gemini có thể “chặn backend Cloudflare”. Đúng: nhiều provider có hạn chế theo môi trường. Với BYOK strict, ta ưu tiên **gọi trực tiếp từ browser**; nếu vướng **CORS/blocked** thì có “kế hoạch dự phòng BYOK-local” (proxy chạy trên máy user, key không rời máy).

---

# ROADMAP (Option A — BYOK strict, đa Công văn, AI đọc thư viện user)

## PHASE 1 — Hỗ trợ “đa Công văn” bằng Policy Packs + Policy Engine (bắt buộc)

### 1.1 Regulations Registry (Sổ văn bản)

Tạo entity `regulations`:

* `id`, `title`, `type` (TT/CV/HD…), `issuedDate`, `effectiveFrom`, `status`
* `scope`: cấp học/môn/mục tiêu (KTĐG/ra đề/lessonplan/SKKN)
* `priority`: TT > CV > HD; bản mới hơn ưu tiên hơn
* `sourceUrl`, `sourceHash`, `adminSummary` (tóm tắt đã duyệt)

### 1.2 Policy Packs (Quy tắc dạng dữ liệu)

Entity `policy_packs` (semver):

* `policyPackId`, `version`, `basedOnRegulationIds[]`, `status`
* `constraints` (hard rules): thời lượng, thang điểm, cấu trúc phần, loại câu hỏi
* `rules` (soft/medium): NB/TH/VD, phân bố chủ đề, nguyên tắc ra đề
* `outputRequirements`: bắt buộc có (matrix, bảng đặc tả, rubric, đáp án)
* `validatorKey`

### 1.3 Policy Engine (chọn + merge quy tắc)

Input: `grade, subject, assessmentType, schoolOverrides?`
Output:

* `policyText` (bullet ngắn để đưa vào prompt)
* `policyObject` (đầy đủ để validate)
* `policyRefs` (để trace)

**DoD Phase 1**

* Thêm “công văn mới” chỉ cần add regulation + policy pack + activate, **không sửa prompt**.

---

## PHASE 2 — AI “tự đọc thư viện user upload” (RAG pipeline chuẩn)

### 2.1 Ingestion pipeline (server-side, tự động khi upload)

* Parse PDF/DOCX/TXT → text sạch
* Chunking: 300–800 tokens, overlap vừa đủ
* Lưu `doc_chunks`: `chunkId, docId, page?, titleHint, text, checksum, tags(môn/lớp/chủ đề)`

### 2.2 Index & Retrieval (server-side)

* Hybrid search: BM25 + dense embeddings
* Filter theo `userId`, `libraryId`, tags môn/lớp/chủ đề
* Rerank khi cần (bật dần)

**API tối thiểu**

* `GET /rag/context?taskType=matrix|exam|lessonplan|skkn&grade=&subject=&topic=`
  → trả `contextChunks[]` (kèm `chunkId`, `page`, `docId`) + `contextSummary` (nếu có)

### 2.3 Citation contract (chuẩn hoá)

Mọi output “dựa tài liệu” phải trả:

* `sources: [{ chunkId, quote, docId, page? }]`

**DoD Phase 2**

* Khi user upload tài liệu, AI sinh đề có citations theo chunk.

---

## PHASE 3 — Agent prompts “data-driven” + output schema chuẩn (không gắn cứng CV7991)

> Thay vì “update prompt theo CV7991”, ta **update prompt để tuân thủ policyText**.

### 3.1 Matrix Agent (tạo ma trận + bảng đặc tả)

**Output JSON chuẩn**:

* `matrix` (topics/units/percent/NB-TH-VD)
* `blueprintSpec` (bảng đặc tả: yêu cầu cần đạt → dạng câu → mức độ → số câu/điểm)
* `complianceCheck` (self-check: percent=100, points match, counts match) để debug nhanh

### 3.2 Exam Agent (tạo đề + đáp án + rubric + sources)

**Output JSON chuẩn**:

* `exam`: sections, questions
* `answerKey`
* `rubric` (nhất là tự luận)
* `sources[]` theo từng câu (nếu task mode = “from_docs”)
* `sourceMode`: `from_docs | general_knowledge`

### 3.3 Prompt versioning tách lớp

* `matrix-agent-vX.Y.Z`, `exam-agent-vX.Y.Z`
* `policy-pack-*-vX.Y.Z`

**DoD Phase 3**

* Agent không cần biết “công văn nào”; chỉ cần policyText + schema.

---

## PHASE 4 — Client Job Manager (Option A) + Progress + Cancel + Checkpoint

Vì LLM chạy ở client, “job system” phải nằm ở client.

### 4.1 Job state (IndexedDB)

Tạo `client_jobs`:

* `jobId`, `type`, `status`, `progress`, `step`, `createdAt`
* `inputsHash`, `policyRefs`, `contextRefs`
* `partialResult` (matrix/exam từng phần)
* `errors[]`

### 4.2 Web Worker để chạy AI không block UI

* Main thread: UI + progress
* Worker: chạy pipeline

  1. fetch policy-context (server)
  2. fetch rag context (server)
  3. call LLM provider (client)
  4. parse/repair JSON
  5. client-side sanity checks
  6. POST validate/save/export (server)

### 4.3 UX “có thể out”

* User có thể:

  * rời trang trong app (route khác) → job vẫn chạy vì worker vẫn sống trong tab
  * quay lại xem progress
  * bấm Cancel
* **Nếu đóng tab**: job dừng (đúng Option A). Khi mở lại:

  * nếu có `partialResult` → cho “resume từ checkpoint” (nhưng thực tế chỉ resume được nếu provider/context còn phù hợp; tối thiểu là “khôi phục matrix đã sinh”)

### 4.4 Safety

* Không log prompt/raw chunks lên console
* Không lưu API key vào job record (chỉ lưu `provider`, `model`)

**DoD Phase 4**

* Có progress bar theo step; cancel hoạt động; không mất kết quả nếu user chỉ “rời trang trong app”.

---

## PHASE 5 — “Đa Công văn” mở rộng ra Lesson Plan + SKKN(SÁNG KIẾN KINH NGHIỆM) (cùng framework)

### 5.1 Lesson Plan

* Input: môn/lớp/chủ đề + policyText + rag context
* Output: mục tiêu, tiến trình, hoạt động, đánh giá, rubric, học liệu
* Export Word/PDF

### 5.2 SKKN (SÁNG KIẾN KINH NGHIỆM)

* Output: đề cương + bài hoàn chỉnh + checklist logic minh chứng
* Có “logic checker” (thiếu số liệu/trước-sau → cảnh báo)

**DoD Phase 5**

* Lesson plan/SKKN cũng có citations khi dựa trên tài liệu upload.

---

## PHASE 6 — QA tối thiểu + “LLM smoke eval” + guardrails (không tách phase DevOps)

Bạn bỏ Phase 0 ok, nhưng Phase 6 phải có **bộ kiểm chứng tối thiểu** để public không lỗi hàng loạt.

### 6.1 Validator tests (server)

* Unit test các rule: tổng % = 100, counts/points/sections đúng policy

### 6.2 Client smoke eval (LLM)

* 10–30 case preset:

  * JSON hợp lệ
  * đủ trường bắt buộc
  * không vượt constraints
  * sources có khi from_docs

### 6.3 Guardrails

* PII redaction trước khi đưa vào prompt (nếu user upload có thông tin HS)
* Filter nội dung nhạy cảm
* Fallback: thiếu tài liệu → chuyển mode `general_knowledge` + cảnh báo

**DoD Phase 6**

* Mỗi lần đổi policy/agent đều chạy smoke eval trước khi release.

---

# Phần quan trọng: Gemini/Provider bị chặn backend hoặc CORS TÔI MUỐN API KHÔNG CHẠY CORS QUA BACKEND NỮA NHÉ

Bạn nói “Gemini có thể chặn backend Cloudflare”. Với BYOK strict, ta ưu tiên browser call, nhưng vẫn có 2 rủi ro:

1. **CORS chặn gọi trực tiếp từ browser** (một số endpoint yêu cầu server-to-server).
2. Provider hạn chế “API key trên client” (khuyến nghị dùng server).

### Kế hoạch dự phòng BYOK vẫn “strict”

**Option A+ (khuyến nghị có để không kẹt provider): Local Relay**

* Cung cấp một “local relay” nhỏ chạy trên máy user (Node CLI hoặc desktop helper):

  * user dán key vào local relay (key vẫn ở máy)
  * browser gọi `http://localhost:port` → relay forward tới provider
* Ưu điểm: vượt CORS, vẫn BYOK, không qua Cloudflare backend.
* Nhược: user phải bật relay khi dùng.

> Nếu bạn muốn public cho số đông, Option A+ là “lối thoát” rất đáng làm sớm để tránh bị chặn bởi nhà cung cấp.

---

# Thứ tự triển khai khuyến nghị (đúng nhu cầu bạn)

1. **Phase 1** Policy Packs + Policy Engine (đa công văn)
2. **Phase 2** RAG đọc thư viện user
3. **Phase 3** Prompts data-driven + schema + citations
4. **Phase 4** Client Job Manager (progress/cancel/checkpoint)
5. **Phase 5** Lesson Plan + SKKN
6. **Phase 6** Smoke eval + guardrails

