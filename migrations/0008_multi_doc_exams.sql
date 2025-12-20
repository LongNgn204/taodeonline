-- Migration number: 0008 	 2024-12-21T00:00:00.000Z
-- Description: Multi-document support, Policy Engine, and Exam Generation (Mode KTĐG & TN THPT 2025)

-- 1. Document Registry
CREATE TABLE documents (
    id TEXT PRIMARY KEY, -- UUID
    title TEXT NOT NULL,
    doc_no TEXT, -- Số hiệu: "24/2024/TT-BGDĐT"
    issuer TEXT, -- Bộ/Sở/Trường
    issued_date TEXT, -- ISO8601 Date
    effective_from TEXT,
    effective_to TEXT,
    scope TEXT, -- JSON array ["THPT", "THCS"] or string 'THPT'
    tags TEXT, -- JSON array
    source_type TEXT NOT NULL, -- 'upload', 'url'
    source_url TEXT,
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'ingested', 'policy_extracted', 'error'
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE document_files (
    id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    r2_key TEXT NOT NULL,
    mime TEXT NOT NULL,
    sha256 TEXT,
    pages INTEGER,
    ocr_used INTEGER DEFAULT 0, -- boolean
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE document_chunks (
    id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    page_no INTEGER,
    chunk_index INTEGER,
    text TEXT,
    text_norm TEXT,
    char_start INTEGER,
    char_end INTEGER,
    hash TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_document_chunks_doc_page ON document_chunks(doc_id, page_no);
CREATE UNIQUE INDEX idx_document_chunks_hash ON document_chunks(doc_id, hash);

-- 2. Policy Engine
CREATE TABLE policies (
    id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    policy_type TEXT, -- 'assessment_school', 'exam_graduation_2025', 'curriculum'
    version TEXT,
    rules_json TEXT, -- JSON rules
    summary_md TEXT,
    evidence_json TEXT, -- JSON mapping rule -> chunk refs
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE policy_packs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mode TEXT NOT NULL, -- 'school_assessment', 'graduation_exam_2025'
    scope TEXT,
    owner_id TEXT,
    is_public INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE policy_pack_items (
    id TEXT PRIMARY KEY,
    pack_id TEXT NOT NULL REFERENCES policy_packs(id) ON DELETE CASCADE,
    policy_id TEXT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    precedence INTEGER NOT NULL DEFAULT 10, -- Lower/Higher number logic (Bộ=10, Sở=20...)
    override_strategy TEXT DEFAULT 'merge', -- 'merge', 'override', 'disable'
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_policy_pack_items_pack_prec ON policy_pack_items(pack_id, precedence);

-- 3. Blueprints & Exams
CREATE TABLE exam_blueprints (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL,
    subject TEXT NOT NULL,
    version TEXT,
    blueprint_json TEXT, -- JSON structure
    effective_from TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE exams (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL,
    subject TEXT NOT NULL,
    pack_id TEXT REFERENCES policy_packs(id),
    blueprint_id TEXT REFERENCES exam_blueprints(id),
    grade INTEGER,
    title TEXT,
    status TEXT DEFAULT 'draft', -- 'draft', 'generated', 'validated', 'exported', 'error'
    exam_json TEXT, -- Final exam structure
    answer_json TEXT,
    rubric_json TEXT, -- Valid for essay types
    evidence_json TEXT, -- Traceability
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE exam_specs (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    spec_json TEXT, -- Specification details
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE compliance_reports (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    validator_version TEXT,
    result TEXT, -- 'pass', 'fail'
    issues_json TEXT, -- List of issues
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE exports (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    format TEXT NOT NULL, -- 'docx', 'xlsx', 'pdf'
    r2_key TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
