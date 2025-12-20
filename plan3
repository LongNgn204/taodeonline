Hỗ trợ đa công văn/văn bản (Bộ → Sở → Trường) để tạo đề đúng hướng dẫn Việt Nam.

Bám CTGDPT 2018 và cập nhật đến 2025 (bao gồm sửa đổi CTGDPT năm 2025). 
chinhphu.vn

Có 2 chế độ:

KTĐG trong trường (ma trận/đặc tả theo công văn hướng dẫn như 7991…)

Luyện thi/Tạo đề theo cấu trúc thi TN THPT 2025 (3 dạng trắc nghiệm mới; số câu & thời gian theo công bố cấu trúc/định dạng). 
Cục Quản Lý Chất Lượng
+1

0) Nguyên tắc thiết kế (cốt lõi để “đa công văn” không loạn)

Không “train” theo nghĩa fine-tune trước. Thay vào đó:
Document Registry + RAG + Policy Engine + Validator + Golden Tests.
(Dễ mở rộng đa văn bản, có kiểm chứng, truy vết nguồn.)

Tách “Quy tắc” khỏi “Prompt”:
Prompt chỉ sinh nội dung; cấu trúc/format/điều kiện hợp lệ phải nằm trong Blueprint + Validator (bằng code).

Bắt buộc Evidence: mọi đầu ra (ma trận/đề/đáp án) phải kèm “căn cứ” (trích đoạn văn bản + trang/điểm).

1) Phạm vi sản phẩm
1.1. Đối tượng

Giáo viên THPT (tập trung), tổ trưởng chuyên môn, BGH; mở rộng THCS sau.

1.2. Use cases chính

KTĐG trong trường: tạo ma trận + đặc tả + đề + đáp án + rubric theo công văn/hướng dẫn (vd. CV 7991). 
Thư Viện Pháp Luật

TN THPT 2025:

Sinh đề theo cấu trúc/định dạng: Ngữ văn tự luận; môn khác trắc nghiệm trên giấy; có tối đa 3 dạng trắc nghiệm (MCQ, Đúng/Sai 4 ý, Trả lời ngắn). 
Cục Quản Lý Chất Lượng

Áp “blueprint” về thời gian và số câu/lệnh hỏi (Toán 90’–34; Ngoại ngữ 50’–40; môn khác 50’; Văn 120’). 
Cục Quản Lý Chất Lượng

2) Baseline văn bản pháp lý/chuẩn (đến 2025)
2.1. CTGDPT

TT 32/2018/TT-BGDĐT: ban hành CTGDPT 2018 (baseline).

TT 17/2025/TT-BGDĐT: sửa đổi/bổ sung CTGDPT ban hành kèm TT 32/2018; hiệu lực 12/09/2025. 
chinhphu.vn

2.2. Thi TN THPT 2025

TT 24/2024/TT-BGDĐT: Quy chế thi TN THPT; hiệu lực 08/02/2025. 
chinhphu.vn
+1

Cấu trúc/định dạng đề thi TN THPT từ 2025 do cơ quan chuyên môn của Bộ công bố (kèm mô tả 3 dạng trắc nghiệm và thay đổi số câu/thời gian). 
Cục Quản Lý Chất Lượng

2.3. KTĐG trong trường

Công văn/hướng dẫn (ví dụ CV 7991), và các văn bản năm học/địa phương do user nạp. 
Thư Viện Pháp Luật
+1

3) Khái niệm dữ liệu (định nghĩa để code không mơ hồ)

Document: 1 văn bản (PDF/DOCX/URL), có metadata + file gốc + text chunks.

Chunk: đoạn văn bản đã chuẩn hoá, có doc_id, page, offset, hash.

Policy: tập quy tắc rút trích từ Document, biểu diễn bằng JSON “machine-checkable”.

Policy Pack: gói quy tắc được hợp nhất (merge) từ nhiều Policy theo precedence (Bộ → Sở → Trường).

Blueprint: “khung đề” cố định theo Mode/Môn (số phần, số câu, loại câu hỏi, thời lượng, scoring…).

Spec: đặc tả nội dung từng ô/slot (năng lực/yêu cầu cần đạt/chủ đề/mức độ).

Compliance Report: kết quả validator (pass/fail + lý do + evidence).

4) Kiến trúc hệ thống (mô hình triển khai)
4.1. Thành phần

Frontend (Next.js/React):

Module “Văn bản & Gói áp dụng”

Module “Tạo đề – KTĐG”

Module “Tạo đề – TN THPT 2025”

Module “Báo cáo tuân thủ”

API (Cloudflare Workers + Hono):

CRUD documents/packs/blueprints/exams

Ingest pipeline triggers

Generation pipeline orchestration

Storage

R2: file gốc (PDF/DOCX), file xuất (docx/xlsx/pdf), ảnh OCR nếu có

D1: metadata, chunks index, policies, packs, exams, logs

(Tuỳ chọn) Vector DB (Cloudflare Vectorize) cho retrieval; nếu chưa có thì lưu embeddings + cosine.

Real-time (Durable Objects): collaboration (phòng soạn đề, comment, lock section…)

AI Providers (BYOK): text model + vision model (đã có “unified core” theo README repo của bạn).

5) Data model D1 (đề xuất chuẩn hoá)

Mục tiêu: đủ để multi-doc, versioning, evidence, audit, export.

5.1. Bảng văn bản

documents

id (PK, uuid)

title

doc_no (số hiệu: “24/2024/TT-BGDĐT”…)

issuer (Bộ/Sở/Trường)

issued_date (date)

effective_from, effective_to (date nullable)

scope (THPT/THCS/both)

tags (json)

source_type (upload/url)

source_url (nullable)

status (draft/ingested/policy_extracted/error)

created_by, created_at, updated_at

document_files

id, doc_id

r2_key, mime, sha256

pages (nullable)

ocr_used (bool)

created_at

document_chunks

id, doc_id

page_no (int)

chunk_index (int)

text (string)

text_norm (string)

char_start, char_end

hash (sha1)

created_at
Indexes:

(doc_id, page_no)

(doc_id, hash) unique

document_embeddings (nếu chưa dùng Vectorize)

chunk_id (PK/FK)

embedding (blob/json)

model (string)

created_at

5.2. Policy & Pack

policies

id, doc_id

policy_type (assessment_school / exam_graduation_2025 / curriculum / other)

version (string)

rules_json (text/json)

summary_md (text)

evidence_json (text/json) // mapping rule → chunk refs

created_at

policy_packs

id

name

mode (school_assessment / graduation_exam_2025)

scope (THPT/…)

owner_id

is_public (bool)

created_at, updated_at

policy_pack_items

id, pack_id

policy_id

precedence (int; Bộ=10, Sở=20, Trường=30…)

override_strategy (merge/override/disable)

created_at
Index: (pack_id, precedence)

5.3. Blueprint, Spec, Exam

exam_blueprints

id

mode

subject (Toán/Văn/Anh/Lý…)

version

blueprint_json

effective_from

created_at

exams

id

mode, subject

pack_id, blueprint_id

grade (10/11/12 hoặc null đối với TN tập trung 12)

title

status (draft/generated/validated/exported/error)

exam_json (cấu trúc đề)

answer_json

rubric_json (đặc biệt cho Văn)

evidence_json

created_by, created_at, updated_at

exam_specs

id, exam_id

spec_json

created_at

compliance_reports

id, exam_id

validator_version

result (pass/fail)

issues_json (list lỗi + vị trí)

created_at

5.4. Export

exports

id, exam_id

format (docx/xlsx/pdf)

r2_key

created_at

6) API spec (đủ để AI/dev implement)
6.1. Documents

POST /api/documents

body: {title, issuer, doc_no, issued_date, scope, tags, source_type, source_url?}

POST /api/documents/:id/upload (multipart → R2)

POST /api/documents/:id/ingest

parse → chunk → embed → status

GET /api/documents/:id

GET /api/documents/:id/chunks?page_no=

POST /api/documents/:id/extract-policy

output: policy + evidence mapping

6.2. Packs

POST /api/packs

{name, mode, scope, is_public}

POST /api/packs/:id/items

{policy_id, precedence, override_strategy}

GET /api/packs/:id/resolve

output: resolved rules_json (merged) + conflicts

6.3. Blueprints

GET /api/blueprints?mode=&subject=

POST /api/blueprints (admin)

6.4. Exams

POST /api/exams

{mode, subject, pack_id, blueprint_id, title, constraints?}

POST /api/exams/:id/generate-spec

POST /api/exams/:id/generate-items

POST /api/exams/:id/validate

POST /api/exams/:id/export?format=docx|xlsx|pdf

GET /api/exams/:id

7) Policy JSON schema (mẫu chuẩn để trích xuất)
7.1. Common
{
  "meta": {
    "source_doc_id": "uuid",
    "doc_no": "...",
    "issued_date": "YYYY-MM-DD",
    "scope": ["THPT"],
    "mode": "school_assessment|graduation_exam_2025"
  },
  "rules": {
    "terminology": {},
    "constraints": {},
    "question_types": {},
    "scoring": {},
    "matrix_template": {}
  }
}

7.2. Pack B (TN THPT 2025) – rules tối thiểu

constraints.duration_minutes.by_subject

constraints.question_counts.by_subject

question_types.allowed.by_subject

format.answer_sheet (MCQ A-D; True/False 4 statements; Short answer normalized)

scope.curriculum_basis = “CTGDPT 2018 (và sửa đổi 2025)”

Nguồn cấu trúc/định dạng: 3 dạng trắc nghiệm, thời gian, số câu Toán 34, Ngoại ngữ 40… 
Cục Quản Lý Chất Lượng

8) Blueprint chuẩn (Mode B: TN THPT 2025)

Blueprint là “khung đề cứng” để generator lấp nội dung.

8.1. Vietnamese (Ngữ văn)

duration = 120

format = essay_on_paper

sections: (tuỳ bạn chuẩn hoá theo đề minh hoạ, nhưng validator phải kiểm: có rubric, thang điểm, yêu cầu rõ ràng)

8.2. Math (Toán)

duration = 90

question_count = 34 
Cục Quản Lý Chất Lượng

question_types:

mcq_single (A-D)

true_false_4 (mỗi câu 4 ý)

short_answer (đáp án số/biểu thức)

Mỗi câu có:

skill_tag (năng lực thành phần)

cognitive_level

content_domain

8.3. Foreign Language (Ngoại ngữ)

duration = 50

question_count = 40

question_types = [mcq_single] (theo mô tả cấu trúc định dạng). 
Cục Quản Lý Chất Lượng

8.4. Các môn trắc nghiệm khác

duration = 50

question_count = 40 (theo bảng cấu trúc/định dạng; bạn nên lấy theo doc/bảng chính thức từng môn khi ingest). 
Cục Quản Lý Chất Lượng

9) Generation pipeline (chuẩn hoá để ổn định chất lượng)
9.1. Pipeline tổng quát (áp dụng cả 2 modes)

Resolve Pack → rules_json

Load Blueprint → blueprint_json

Build Spec (từng slot):

mapping CTGDPT 2018 → yêu cầu cần đạt/năng lực → mức độ tư duy

Generate Items:

sinh câu hỏi + đáp án + giải thích/nhận xét

Self-check + Validator:

nếu fail: chỉ regenerate slot lỗi

Evidence attach:

gắn căn cứ (doc/chunk/page) cho blueprint/rules đang áp dụng

Export (docx/xlsx/pdf)

9.2. Prompt contracts (bắt buộc JSON)

spec_prompt output phải là JSON schema ExamSpec

items_prompt output phải là JSON schema ExamContent

rubric_prompt output phải là Rubric

Chỉ khi JSON parse OK + validator pass → mới xuất Word/Excel.

10) Validator (điểm sống còn)
10.1. Validator chung

Parse JSON

Check required fields

Check không trùng mã câu hỏi

Check đáp án hợp lệ theo type

Check scoring tổng = 10 hoặc 100 (tuỳ pack)

Check evidence tồn tại (doc_id + page + chunk_id)

10.2. Validator Pack B (TN THPT 2025)

Thời gian theo môn: Văn 120, Toán 90, môn khác 50. 
Cục Quản Lý Chất Lượng

Số câu/lệnh hỏi:

Toán 34

Ngoại ngữ 40

(các môn khác theo cấu trúc/định dạng từng môn; tối thiểu enforce nhóm “các môn khác 50 phút” và rule set theo blueprint bạn lưu từ nguồn chính thức). 
Cục Quản Lý Chất Lượng

Loại câu:

Ngoại ngữ chỉ mcq_single

Môn khác: subset của {mcq_single, true_false_4, short_answer} 
Cục Quản Lý Chất Lượng

Format câu Đúng/Sai:

đúng “4 ý”/câu; mỗi ý T/F 
Cục Quản Lý Chất Lượng

Format câu trả lời ngắn:

đáp án chuẩn hoá: number/string/expr; không được chứa diễn giải dài

10.3. Validator Pack A (KTĐG)

Kiểm ma trận/đặc tả:

tổng số câu theo ma trận = số câu đề

mức độ nhận thức khớp phân bố

dạng câu phù hợp công văn (dựa policy JSON)

Nếu áp CV 7991: enforce template matrix/spec theo phụ lục bạn ingest. 
Thư Viện Pháp Luật
+1

11) Golden Tests (bắt buộc để “đúng công văn”)

Ingest “cấu trúc/định dạng” TN 2025 + đề minh hoạ (từ nguồn Bộ) làm golden fixtures. 
Cục Quản Lý Chất Lượng

Viết test:

validator chạy trên đề minh hoạ phải PASS 100% (format).

generator sinh 50 đề random theo blueprint → PASS ≥ 95% (phần fail phải có lỗi rõ, tái sinh slot lỗi).

12) Quy trình ingest văn bản (đa công văn)
12.1. Steps

Upload/URL → lưu R2

Extract text:

PDF text layer ưu tiên

Nếu scan: OCR (vision model)

Normalize:

bỏ header/footer lặp

chuẩn hoá dấu xuống dòng, unicode

Chunking:

theo heading + đoạn + giới hạn tokens

Metadata extraction:

số hiệu, ngày ban hành, cơ quan, hiệu lực (LLM + regex)

Policy extraction:

LLM tạo rules_json + evidence_json (map rule → chunk refs)

12.2. Conflict detection (khi tạo pack)

Nếu 2 policies cùng định nghĩa constraints.duration_minutes.by_subject.Math khác nhau → báo conflict

Cho phép resolve:

override_by_precedence

manual_override (admin/owner pack)

13) Export (Word/Excel/PDF) – yêu cầu tối thiểu

Word:

Trang bìa: tên đề, môn, thời gian, pack áp dụng, căn cứ văn bản

Đề + đáp án (có thể tách file)

Excel:

Sheet Ma trận

Sheet Đặc tả

Sheet Danh mục câu hỏi

PDF:

bản in đề và đáp án

14) Bảo mật & an toàn

BYOK keys: mã hoá, tách theo user/workspace

Audit log: ai tạo pack, ai export đề, ai sửa nội dung

Rate limit generation theo workspace

Watermark nội bộ (optional): mã đề/uid để truy vết rò rỉ

15) Kế hoạch triển khai theo sprint (kèm Acceptance Criteria)
Sprint 1 — Mode B foundation (TN 2025)

Deliverables

Data model: blueprints + exams + compliance_reports

Blueprints: Toán/Văn/Ngoại ngữ + 1 môn trắc nghiệm khác

Validator Pack B v1 (thời gian, số câu, type format)

UI: switch mode + chọn môn + hiển thị blueprint

Acceptance

Sinh đề Toán: luôn ra 34 câu, đúng 3 dạng, pass validator

Sinh đề Anh: 40 MCQ, pass validator

Sprint 2 — Document registry + policy packs

Deliverables

Upload/ingest/chunk

Extract policy JSON + evidence mapping

Pack builder + resolve + conflict report

Acceptance

Nạp TT 24/2024 và cấu trúc định dạng: tạo Pack “TN 2025 – Bộ” resolve OK, rules xuất ra đầy đủ.

Sprint 3 — Golden fixtures + regression

Deliverables

Import đề minh hoạ/cấu trúc định dạng từ nguồn Bộ

Test suite validator PASS trên fixtures

Acceptance

Validator PASS 100% đề minh hoạ (format)

Sprint 4 — KTĐG mode hardening + multi-doc

Deliverables

Chuẩn hoá ma trận/đặc tả (Pack A)

Conflict resolution precedence (Bộ/Sở/Trường)

Export docx/xlsx ổn định

Acceptance

1 pack có 3 văn bản (Bộ + Sở + Trường) resolve đúng precedence và output có evidence.