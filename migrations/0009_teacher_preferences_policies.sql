-- Migration number: 0009     2024-12-21T14:35:00.000Z
-- Description: Teacher Preferences và Policy Document enhancements

-- 1. Teacher Preferences - lưu mong muốn của giáo viên
CREATE TABLE teacher_preferences (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    library_id TEXT, -- Optional: gắn với library cụ thể
    notes TEXT, -- Ghi chú tự do (max 2000 chars)
    preferences_json TEXT, -- JSON preferences detail
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_teacher_prefs_user ON teacher_preferences(user_id);
CREATE INDEX idx_teacher_prefs_library ON teacher_preferences(user_id, library_id);

-- 2. Built-in Policy Documents (static policies từ core package)
-- Dùng để track policy nào được dùng cho exam nào
CREATE TABLE policy_documents (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL UNIQUE, -- "TT32-2018", "CV7991-2024"
    title TEXT NOT NULL,
    issuer TEXT NOT NULL CHECK(issuer IN ('MOE', 'DOE', 'School')),
    issued_date TEXT,
    effective_from TEXT,
    effective_to TEXT,
    scope TEXT, -- JSON: ["THCS", "THPT"]
    mode TEXT NOT NULL, -- 'curriculum', 'school_assessment', 'graduation_exam'
    rules_json TEXT, -- JSON policy rules
    evidence_json TEXT, -- JSON evidence refs
    summary TEXT, -- UI description
    is_builtin INTEGER DEFAULT 1, -- 1 = from core package, 0 = user uploaded
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_policy_documents_mode ON policy_documents(mode);
CREATE INDEX idx_policy_documents_effective ON policy_documents(effective_from, effective_to);

-- 3. Add teacher_prefs_id to exams table
-- Nếu cột đã tồn tại, lệnh này sẽ fail silently
ALTER TABLE exams ADD COLUMN teacher_prefs_id TEXT REFERENCES teacher_preferences(id);
ALTER TABLE exams ADD COLUMN policy_doc_id TEXT REFERENCES policy_documents(id);

-- 4. Seed built-in policies từ CTGDPT 2018 và CV 7991
INSERT OR IGNORE INTO policy_documents (id, code, title, issuer, issued_date, effective_from, scope, mode, summary, is_builtin)
VALUES 
('tt32-2018', 'TT32-2018', 'Thông tư 32/2018/TT-BGDĐT - CTGDPT 2018', 'MOE', '2018-12-26', '2019-02-15', '["THCS", "THPT"]', 'curriculum', 'Chương trình giáo dục phổ thông 2018 baseline', 1),
('tt22-2021', 'TT22-2021', 'Thông tư 22/2021/TT-BGDĐT - Quy định KTĐG THCS/THPT', 'MOE', '2021-07-20', '2021-09-05', '["THCS", "THPT"]', 'school_assessment', 'Quy định đánh giá học sinh THCS và THPT', 1),
('tt17-2025', 'TT17-2025', 'Thông tư 17/2025/TT-BGDĐT - Sửa đổi CTGDPT', 'MOE', '2025-06-12', '2025-09-12', '["THCS", "THPT"]', 'curriculum', 'Sửa đổi, bổ sung CTGDPT 2018', 1),
('tt24-2024', 'TT24-2024', 'Thông tư 24/2024/TT-BGDĐT - Quy chế TN THPT', 'MOE', '2024-12-20', '2025-02-08', '["THPT"]', 'graduation_exam', 'Quy chế thi TN THPT từ 2025', 1),
('cv7991-2024', 'CV7991-2024', 'Công văn 7991/BGDĐT-GDTrH - Hướng dẫn KTĐG', 'MOE', '2024-12-17', '2025-01-01', '["THCS", "THPT"]', 'school_assessment', 'Hướng dẫn KTĐG định kỳ: TN 7đ + TL 3đ, tỷ lệ 40/30/30', 1),
('tn-thpt-2025', 'TN-THPT-2025', 'Cấu trúc đề thi TN THPT 2025', 'MOE', '2024-10-15', '2025-01-01', '["THPT"]', 'graduation_exam', 'Toán 90 phút 34 câu, Ngoại ngữ 50 phút 40 câu, 3 dạng TN mới', 1);
