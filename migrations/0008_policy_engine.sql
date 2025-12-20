-- Migration 0008: Policy Engine & Document Registry
-- Chú thích: Hỗ trợ tính năng Đa công văn, Validator, và Generation Pipeline

-- 1. Documents: Quản lý văn bản (Thông tư, Công văn)
CREATE TABLE documents (
    id TEXT PRIMARY KEY, -- e.g., "TT17-2025"
    code TEXT NOT NULL, -- Số hiệu văn bản
    title TEXT NOT NULL,
    issue_date TEXT, -- ISO8601
    effective_date TEXT,
    signer TEXT,
    type TEXT NOT NULL, -- "THONG_TU", "CONG_VAN", "QUY_CHE"
    status TEXT DEFAULT 'ACTIVE', -- ACTIVE, REPLACED, DRAFT
    metadata JSON, -- Lưu thêm thông tin khác
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

-- 2. Document Files: Link file gốc (PDF/Docx) lưu trên R2
CREATE TABLE document_files (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    file_path TEXT NOT NULL, -- Path trên R2
    file_type TEXT NOT NULL, -- "PDF", "DOCX"
    version INTEGER DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 3. Document Chunks: Dữ liệu phân mảnh phục vụ RAG/Evidence
CREATE TABLE document_chunks (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    content TEXT NOT NULL,
    embedding BLOB, -- Vector float32
    page_number INTEGER,
    section_ref TEXT, -- e.g., "Điều 5, Khoản 2"
    tokens INTEGER,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 4. Policies: Quy định/Luật trích xuất từ văn bản
CREATE TABLE policies (
    id TEXT PRIMARY KEY,
    document_id TEXT NOT NULL REFERENCES documents(id),
    code TEXT NOT NULL, -- e.g., "RULE_TIME_MATH_2025"
    description TEXT NOT NULL,
    rule_logic JSON NOT NULL, -- Cấu trúc logic check (JSON Logic hoặc Custom schema)
    type TEXT NOT NULL, -- "CONSTRAINT", "FORMAT", "STRUCTURE"
    created_at INTEGER DEFAULT (unixepoch())
);

-- 5. Policy Packs: Bộ quy tắc áp dụng cho kỳ thi cụ thể
CREATE TABLE policy_packs (
    id TEXT PRIMARY KEY, -- e.g., "TN_THPT_2025_MATH"
    name TEXT NOT NULL,
    description TEXT,
    subject TEXT NOT NULL, -- "MATH", "LIT", "ENG"...
    year INTEGER NOT NULL,
    mode TEXT NOT NULL, -- "KTDG", "TN_2025"
    is_active BOOLEAN DEFAULT 1,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 6. Policy Pack Items: Mapping n-n giữa Pack và Policy
CREATE TABLE policy_pack_items (
    pack_id TEXT NOT NULL REFERENCES policy_packs(id),
    policy_id TEXT NOT NULL REFERENCES policies(id),
    priority INTEGER DEFAULT 10,
    PRIMARY KEY (pack_id, policy_id)
);

-- 7. Exam Blueprints: Ma trận/Cấu trúc đề
CREATE TABLE exam_blueprints (
    id TEXT PRIMARY KEY,
    pack_id TEXT REFERENCES policy_packs(id),
    name TEXT NOT NULL,
    structure_json JSON NOT NULL, -- Định nghĩa cấu trúc (Part 1, 2, 3...)
    constraints_json JSON, -- Ràng buộc thêm (số câu NB/TH/VD/VDC)
    created_by TEXT,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 8. Exams: Đề thi đã sinh
CREATE TABLE exams (
    id TEXT PRIMARY KEY,
    blueprint_id TEXT REFERENCES exam_blueprints(id),
    title TEXT NOT NULL,
    subject TEXT,
    duration_minutes INTEGER,
    total_questions INTEGER,
    content_json JSON NOT NULL, -- Nội dung đề full (Items, Answers)
    status TEXT DEFAULT 'DRAFT', -- DRAFT, FINAL, EXPORTED
    metadata JSON,
    created_at INTEGER DEFAULT (unixepoch())
);

-- 9. Exam Specs: Đặc tả đầu vào để sinh đề (lưu lại để tái sinh/debug)
CREATE TABLE exam_spec_logs (
    id TEXT PRIMARY KEY,
    exam_id TEXT REFERENCES exams(id),
    spec_json JSON NOT NULL, -- Input specs từ user
    generation_config JSON, -- Config lúc chạy (model, retry...)
    created_at INTEGER DEFAULT (unixepoch())
);

-- 10. Compliance Reports: Báo cáo tuân thủ policy
CREATE TABLE compliance_reports (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    passed BOOLEAN NOT NULL,
    details_json JSON NOT NULL, -- Chi tiết từng rule pass/fail
    evidence_json JSON, -- Trích dẫn văn bản liên quan
    created_at INTEGER DEFAULT (unixepoch())
);

-- 11. Exports: Lịch sử xuất file
CREATE TABLE exports (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id),
    format TEXT NOT NULL, -- "DOCX", "PDF", "JSON"
    file_path TEXT, -- R2 path nếu lưu
    status TEXT NOT NULL, -- PENDING, COMPLETED, FAILED
    created_at INTEGER DEFAULT (unixepoch())
);

-- Indices
CREATE INDEX idx_documents_type ON documents(type);
CREATE INDEX idx_policies_doc ON policies(document_id);
CREATE INDEX idx_exams_blueprint ON exams(blueprint_id);
