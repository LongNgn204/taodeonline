-- Chú thích: Migration cho regulations và policy_packs
-- H1: Entity lưu trữ văn bản pháp lý (TT, CV, HD)
-- H2: Entity lưu trữ policy packs với versioning

-- =============================================
-- REGULATIONS: Sổ văn bản pháp lý
-- =============================================
CREATE TABLE IF NOT EXISTS regulations (
    id TEXT PRIMARY KEY,
    
    -- Thông tin văn bản
    code TEXT NOT NULL UNIQUE,              -- VD: "CV7991-2024", "TT32-2018"
    title TEXT NOT NULL,                    -- Tiêu đề đầy đủ
    type TEXT NOT NULL CHECK (type IN ('TT', 'CV', 'HD', 'QD', 'NQ')), -- Thông tư, Công văn, Hướng dẫn, Quyết định, Nghị quyết
    issuer TEXT NOT NULL DEFAULT 'MOE',     -- MOE, DOE, School
    
    -- Phạm vi áp dụng
    scope TEXT,                             -- JSON: ["THPT", "THCS", "Tiểu học"]
    mode TEXT,                              -- school_assessment, graduation_exam, curriculum
    
    -- Thời hạn
    issued_date TEXT,                       -- Ngày ban hành
    effective_from TEXT,                    -- Ngày có hiệu lực
    effective_to TEXT,                      -- Ngày hết hiệu lực (null = vẫn còn hiệu lực)
    
    -- Nội dung
    summary TEXT,                           -- Tóm tắt do admin nhập
    source_url TEXT,                        -- Link tới văn bản gốc
    source_hash TEXT,                       -- Hash để kiểm tra thay đổi
    rules_json TEXT,                        -- JSON: constraints, question_types, etc.
    
    -- Trạng thái
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'draft')),
    priority INTEGER DEFAULT 10,            -- Dùng để sort (thấp = ưu tiên cao)
    
    -- Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT                         -- Admin user id
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_regulations_code ON regulations(code);
CREATE INDEX IF NOT EXISTS idx_regulations_mode ON regulations(mode, status);
CREATE INDEX IF NOT EXISTS idx_regulations_effective ON regulations(effective_from, effective_to);

-- =============================================
-- POLICY_PACKS: Gói quy tắc đã merge + versioning
-- =============================================
CREATE TABLE IF NOT EXISTS policy_packs (
    id TEXT PRIMARY KEY,
    
    -- Thông tin pack
    name TEXT NOT NULL,                     -- Tên pack: "KTĐG THPT theo CV7991"
    version TEXT NOT NULL,                  -- Semver: "1.0.0"
    
    -- Scope
    mode TEXT NOT NULL,                     -- school_assessment, graduation_exam
    scope TEXT,                             -- JSON: ["THPT", "THCS"]
    grade_range TEXT,                       -- JSON: [10, 11, 12]
    subjects TEXT,                          -- JSON: ["Toán", "Ngữ văn"] hoặc null = tất cả
    
    -- Regulations sử dụng
    based_on_regulation_ids TEXT NOT NULL,  -- JSON array: ["cv7991-2024", "tt32-2018"]
    
    -- Quy tắc đã merge
    resolved_rules_json TEXT NOT NULL,      -- JSON: merged constraints, question_types
    merge_conflicts_json TEXT,              -- JSON: conflicts nếu có
    
    -- Prompt context
    policy_text TEXT,                       -- Text đã generate cho prompt
    schema_hints_json TEXT,                 -- JSON schema hints
    
    -- Trạng thái
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'deprecated', 'draft')),
    is_default INTEGER DEFAULT 0,           -- 1 nếu là default pack cho mode/scope
    
    -- Metadata
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    created_by TEXT,
    
    -- Unique constraint: chỉ 1 version cho mỗi name
    UNIQUE(name, version)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_policy_packs_mode ON policy_packs(mode, status);
CREATE INDEX IF NOT EXISTS idx_policy_packs_name ON policy_packs(name);
CREATE INDEX IF NOT EXISTS idx_policy_packs_default ON policy_packs(is_default, mode);

-- =============================================
-- SEED DATA: Regulations ban đầu
-- =============================================
INSERT OR IGNORE INTO regulations (id, code, title, type, issuer, mode, issued_date, effective_from, summary, priority, status) VALUES
('tt32-2018', 'TT32-2018', 'Thông tư 32/2018 - CTGDPT 2018', 'TT', 'MOE', 'curriculum', '2018-12-26', '2019-02-15', 'Chương trình giáo dục phổ thông 2018 baseline', 10, 'active'),
('tt22-2021', 'TT22-2021', 'Thông tư 22/2021 - Quy định KTĐG THCS/THPT', 'TT', 'MOE', 'school_assessment', '2021-07-20', '2021-09-05', 'Quy định đánh giá học sinh THCS và THPT', 20, 'active'),
('tt17-2025', 'TT17-2025', 'Thông tư 17/2025 - Sửa đổi CTGDPT', 'TT', 'MOE', 'curriculum', '2025-07-30', '2025-09-12', 'Sửa đổi, bổ sung CTGDPT 2018', 15, 'active'),
('tt24-2024', 'TT24-2024', 'Thông tư 24/2024 - Quy chế TN THPT', 'TT', 'MOE', 'graduation_exam', '2024-11-28', '2025-02-08', 'Quy chế thi TN THPT từ 2025', 10, 'active'),
('cv7991-2024', 'CV7991-2024', 'Công văn 7991 - Hướng dẫn KTĐG định kỳ', 'CV', 'MOE', 'school_assessment', '2024-12-17', '2025-01-01', 'Đề 60 phút: TN 7đ (MCQ 3đ + Đ/S 2đ + TLN 2đ), TL 3đ. Tỷ lệ 40/30/30.', 5, 'active'),
('tn-thpt-2025', 'TN-THPT-2025', 'Cấu trúc đề thi TN THPT 2025', 'HD', 'MOE', 'graduation_exam', '2025-01-01', '2025-01-01', 'Toán 90 phút 34 câu, Ngoại ngữ 50 phút 40 câu, 3 dạng trắc nghiệm mới.', 5, 'active');

-- =============================================
-- SEED DATA: Policy Packs mặc định
-- =============================================
INSERT OR IGNORE INTO policy_packs (id, name, version, mode, based_on_regulation_ids, resolved_rules_json, policy_text, status, is_default) VALUES
(
    'pack-school-cv7991-v1',
    'KTĐG theo CV7991',
    '1.0.0',
    'school_assessment',
    '["tt32-2018", "tt22-2021", "cv7991-2024"]',
    '{"constraints":{"duration":{"default":60},"total_score":10,"score_distribution":{"MCQ":3,"TF":2,"SHORT":2,"ESSAY":3},"cognitive_levels":{"NB":40,"TH":30,"VD":30}},"question_types":{"allowed":["MCQ","TF","SHORT","ESSAY"],"tf_items_count":4}}',
    '- Thời gian làm bài: 60 phút\n- Tổng điểm: 10 điểm\n- Phân bổ điểm:\n  + MCQ: 3 điểm\n  + Đúng/Sai: 2 điểm\n  + Trả lời ngắn: 2 điểm\n  + Tự luận: 3 điểm\n- Tỷ lệ mức độ: NB 40%, TH 30%, VD 30%',
    'active',
    1
),
(
    'pack-tnthpt-2025-v1',
    'TN THPT 2025',
    '1.0.0',
    'graduation_exam',
    '["tt32-2018", "tt17-2025", "tt24-2024", "tn-thpt-2025"]',
    '{"constraints":{"duration":{"by_subject":{"Toán":90,"Ngữ văn":120},"default":50},"question_counts":{"by_subject":{"Toán":34,"Tiếng Anh":40},"default":40},"total_score":10},"question_types":{"allowed":["MCQ","TF","SHORT","ESSAY"],"tf_items_count":4}}',
    '- Thời gian theo môn:\n  + Toán: 90 phút\n  + Ngữ văn: 120 phút\n  + Môn khác: 50 phút\n- Số câu theo môn:\n  + Toán: 34 câu\n  + Tiếng Anh: 40 câu\n- Đề thi gồm 3 dạng trắc nghiệm mới',
    'active',
    1
);
