Dưới đây là **Codebase Review + Gap Analysis (so với Plan21 Option A – BYOK strict)** và **kế hoạch triển khai dạng “backlog cho AI code”**. Mình bám đúng mô tả bạn đưa (coi là nguồn sự thật), và tập trung vào các “điểm gãy” quan trọng để bạn gửi AI chỉnh lại cho **chuẩn đa công văn + RAG đọc thư viện + progress/cancel**.

---

## 1) Tổng quan Codebase hiện tại (đúng hướng, nhưng thiếu vài “mảnh ghép chuẩn hóa”)

### Những nền tảng đã đúng (đáng giữ)

* **BYOK**: frontend gọi AI trực tiếp (không proxy backend) → phù hợp Option A.
* **Policy merge** đã có `mergePolicies()` theo precedence → tốt, chỉ thiếu “hệ quy chiếu” (regulations entity + versioning + policy-context).
* **Documents → Extract → Chunk** đã có pipeline và lưu trữ.
* **RAG retriever** có TF-IDF → đủ MVP, nhưng thiếu API/context contract & citations.
* **Export** DOCX/XLSX đã có → thuận lợi để chuẩn hóa output (matrix/spec/rubric).

### Điểm yếu mang tính “kiến trúc sản phẩm”

1. **Prompt đang hardcode CV7991** trong `frontend-ai.ts`
   → làm hệ thống *không thể* mở rộng “đa công văn” một cách sạch (mỗi văn bản mới lại phải sửa prompt).
2. **Thiếu “policy-context” contract**
   → frontend không có một “gói luật đã resolve” để nhét vào prompt/validate.
3. **RAG chưa có endpoint `/rag/context` + chưa có citation contract**
   → AI không “tự đọc thư viện” theo chuẩn có trích dẫn.
4. **Không có Client Job Manager + Web Worker**
   → UX “đang chạy” dễ bị đứng UI, không có cancel/checkpoint, khó rời trang.

---

## 2) Gap Analysis (chuẩn hóa lại theo Plan21 – Option A)

### PHASE 1 — Policy Packs + Policy Engine (đa công văn)

| Yêu cầu                                    | Hiện trạng | Gap thực tế                                             | Hướng sửa                                                                                                 |
| ------------------------------------------ | ---------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `regulations` entity                       | ❌          | thiếu DB table + CRUD + status/effective/priority       | thêm bảng `regulations` + admin CRUD                                                                      |
| `policy_packs` semver + activate/deprecate | ⚠️         | có DEFAULT_PACKS nhưng thiếu versioning/trace           | thêm bảng `policy_packs` + semver + mapping basedOn                                                       |
| `/policy-context/*`                        | ⚠️         | có `/policies/resolve` nhưng chưa tách “context output” | tạo `/policy-context/matrix` & `/policy-context/exam` trả `policyText+constraints+schemaHints+policyRefs` |
| Prompt data-driven (nhận policyText)       | ❌          | prompt hardcode CV7991                                  | refactor `frontend-ai.ts`: system prompt “generic”, inject `policyText` từ API                            |

**Critical fix #1:** refactor prompts thành data-driven, bỏ hardcode CV7991.

---

### PHASE 2 — RAG Pipeline “AI tự đọc thư viện”

| Yêu cầu                            | Hiện trạng | Gap thực tế                                    | Hướng sửa                                                       |
| ---------------------------------- | ---------- | ---------------------------------------------- | --------------------------------------------------------------- |
| `/rag/context` API                 | ❌          | chưa có endpoint trả chunks theo query/filters | tạo endpoint mới                                                |
| Hybrid search                      | ❌          | TF-IDF basic                                   | giữ TF-IDF trước; thiết kế interface để nâng cấp embeddings sau |
| Filter theo môn/lớp/chủ đề/library | ⚠️         | có logic nhưng chưa hook API/UX                | wire filters vào `/rag/context`                                 |
| Citation contract                  | ❌          | output schema chưa có `sources[]`              | thêm `sources[]` vào schema + prompt + export                   |

**Critical fix #2:** tạo `/rag/context` và chuẩn hóa `contextChunks[]` + `sources[]`.

---

### PHASE 3 — Agent output schema + citations + versioning

| Yêu cầu                                      | Hiện trạng | Gap thực tế                           | Hướng sửa                                        |                    |
| -------------------------------------------- | ---------- | ------------------------------------- | ------------------------------------------------ | ------------------ |
| Matrix output chuẩn (matrix + blueprintSpec) | ⚠️         | schema hint có, nhưng chưa “bắt buộc” | update schema + validator bắt buộc               |                    |
| Exam output + `sources[]`                    | ❌          | chưa có                               | update schema, prompt, export                    |                    |
| `sourceMode`                                 | ❌          | chưa có                               | add `from_docs                                   | general_knowledge` |
| Prompt versioning                            | ❌          | chưa có                               | add `PROMPT_VERSION` constants; lưu vào metadata |                    |

---

### PHASE 4 — Client Job Manager (Option A)

| Yêu cầu                    | Hiện trạng | Gap thực tế         | Hướng sửa                                                               |
| -------------------------- | ---------- | ------------------- | ----------------------------------------------------------------------- |
| IndexedDB job state        | ❌          | chưa có             | tạo `client_jobs` store                                                 |
| Web Worker                 | ❌          | AI chạy main thread | tách worker để chạy pipeline                                            |
| Progress/Cancel/Checkpoint | ❌          | chưa có             | implement step-based progress, abort controller                         |
| “Rời trang vẫn chạy”       | ❌          | chưa có             | trong **cùng tab** vẫn chạy (worker), đóng tab thì dừng (đúng Option A) |

---

### PHASE 5 — Lesson Plan + SKKN

Hoàn toàn mới (Medium), để sau khi core “đa công văn + RAG + jobs” chạy ổn.

---

### PHASE 6 — QA + Guardrails

Chưa có. Với vibecoding bạn có thể làm “tối thiểu nhưng hiệu quả”:

* validator unit tests (bắt buộc)
* smoke test pipeline (mock LLM output)
* PII redaction trước khi đưa chunk vào prompt
* content filter tối thiểu

---

## 3) Plan triển khai ưu tiên (để AI của bạn code theo ticket)

### CRITICAL (làm ngay – nếu không làm thì “đa công văn” không đúng nghĩa)

#### Epic C1 — Refactor prompts thành data-driven

**Goal:** `frontend-ai.ts` không còn hardcode CV7991.

**Tickets**

1. **API: `GET /policy-context/matrix`**

   * Input: grade/subject/assessmentType (+ optional school overrides)
   * Output: `{ policyText, constraints, schemaHints, policyRefs, policyVersion }`
2. **API: `GET /policy-context/exam`**

   * Output tương tự, kèm blueprint/structure hints.
3. **FE: update `frontend-ai.ts`**

   * System prompt “generic”
   * Inject `policyText` từ `/policy-context/*`
   * Lưu `policyRefs + promptVersion + model` vào metadata của kết quả

**Acceptance criteria**

* Thay policy pack là đổi hành vi prompt mà không sửa code prompt.
* Không có chuỗi “CV7991” hardcode trong system prompt.

---

#### Epic C2 — `/rag/context` + contextChunks contract

**Goal:** AI tự đọc thư viện user.

**Tickets**

1. **API: `GET /rag/context`**

   * Params: `taskType, libraryId?, subject?, grade?, topic?, query?`
   * Output:

     * `contextChunks[]: { chunkId, docId, page?, titleHint, text }`
     * `retrievalMeta: { method:'tfidf', topK, filtersApplied }`
2. **FE: trước khi gọi LLM**

   * nếu mode “from_docs” → gọi `/rag/context`
   * build prompt: include chunks + yêu cầu citations
3. **Schema: thêm `sources[]`**

   * Matrix: optional (nếu matrix dựa trên doc)
   * Exam: **bắt buộc** per-question (khi from_docs)

**Acceptance criteria**

* Sinh đề có `sources[]` (chunkId + quote) khi from_docs.
* Nếu không có chunk phù hợp → fallback rõ ràng (`sourceMode=general_knowledge`) hoặc yêu cầu user upload thêm (tùy UX).

---

### HIGH (làm tiếp – để hệ thống “chuẩn và bền”)

#### Epic H1 — `regulations` entity + CRUD + status/effective

* DB table + admin endpoints
* UI admin tối thiểu (hoặc CLI)
* Mọi policy pack trỏ `basedOnRegulationIds[]`

#### Epic H2 — Policy pack versioning (semver) + activate/deprecate

* DB `policy_packs`: `policyPackId`, `version`, `status`, `basedOn`, JSON payload
* `resolve` chọn bản active mới nhất theo scope

#### Epic H3 — Validator “bắt buộc schema”

* Server validate:

  * tổng % = 100
  * counts/points khớp constraints
  * sections đúng blueprint
  * nếu `from_docs` → `sources[]` không rỗng

---

### MEDIUM (để UX tốt, giảm “đứng app”)

#### Epic M1 — Client Job Manager + Web Worker (Option A)

**Goal:** user rời trang trong SPA vẫn thấy tiến trình; cancel được; đóng tab thì dừng (đúng BYOK strict).

**Tickets**

* `client_jobs` in IndexedDB: jobId, status, progress, step, partialResult
* Web Worker chạy pipeline:

  1. fetch policy-context
  2. fetch rag-context
  3. call provider
  4. parse/repair JSON
  5. validate/save/export
* UI progress component + cancel

**Acceptance criteria**

* UI không bị freeze khi generate dài.
* Cancel dừng request (AbortController).
* Nếu refresh tab: khôi phục “partial result” (ít nhất matrix).

---

### LATER (sau khi core chạy ổn)

#### Epic L1 — Hybrid search (BM25 + embeddings)

* Giữ TF-IDF làm baseline
* Thiết kế interface retriever để plug embeddings sau
* Embedding có thể chạy server-side (không mâu thuẫn BYOK vì BYOK chỉ áp dụng LLM generation)

#### Epic L2 — Lesson Plan module

* schema + editor + export

#### Epic L3 — SKKN module + logic checker

* template + checklist + export

#### Epic L4 — QA + Guardrails tối thiểu

* validator unit tests
* smoke tests với mock outputs
* PII redaction (email/phone/student id) trước khi đưa chunk vào prompt
* content filter tối thiểu

---

## 4) Thiết kế prompt “chuẩn đa công văn” (để AI sửa `frontend-ai.ts`)

### Nguyên tắc

* System prompt **không nhắc CV nào**.
* Mọi quy tắc nằm trong `policyText` do engine resolve.
* Khi from_docs: bắt buộc citations.

### Prompt skeleton đề xuất

* `SYSTEM`: vai trò + output JSON + không bịa + tuân thủ policyText
* `POLICY_TEXT`: bullet constraints/rules
* `CONTEXT_CHUNKS`: kèm chunkId/docId/page + text
* `TASK`: generate matrix/exam
* `OUTPUT_SCHEMA_HINT`: schema JSON

---

## 5) Lưu ý quan trọng về “user out khi AI đang làm” (Option A)

Bạn chọn Option A là đúng logic: **LLM chạy trên browser** thì:

* Rời route trong SPA: vẫn chạy (nếu worker sống trong tab)
* Đóng tab/trình duyệt: job dừng (không tránh được)
* Cách giảm rủi ro: **checkpoint ra IndexedDB** theo step (matrix trước, exam sau)

---

## 6) “Kết luận hành động” (1 dòng cho AI của bạn)

> Ưu tiên 1: bỏ hardcode CV7991 trong prompt → gọi `/policy-context/*` để lấy `policyText`.
> Ưu tiên 2: thêm `/rag/context` + output `sources[]` chuẩn citations.
> Ưu tiên 3: client Job Manager + Web Worker để progress/cancel.

---

