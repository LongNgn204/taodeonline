-- L2: Lesson Plans table
-- L3: SKKN (Sáng kiến kinh nghiệm) table

-- Lesson Plans
CREATE TABLE IF NOT EXISTS lesson_plans (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade INTEGER NOT NULL,
    topic TEXT NOT NULL,
    duration INTEGER NOT NULL DEFAULT 45,
    objectives_json TEXT DEFAULT '[]',
    sections_json TEXT DEFAULT '[]',
    assessment_json TEXT DEFAULT '{}',
    sources_json TEXT DEFAULT '[]',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_lesson_plans_user ON lesson_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_plans_subject ON lesson_plans(subject, grade);

-- SKKN (Sáng kiến kinh nghiệm)
CREATE TABLE IF NOT EXISTS skkn (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'teaching_method', 'classroom_management', 'assessment', etc.
    subject TEXT,
    grade INTEGER,
    abstract TEXT,
    content_json TEXT DEFAULT '{}', -- Structured content
    status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected'
    evidence_json TEXT DEFAULT '[]', -- Supporting evidence
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_skkn_user ON skkn(user_id);
CREATE INDEX IF NOT EXISTS idx_skkn_category ON skkn(category);
CREATE INDEX IF NOT EXISTS idx_skkn_status ON skkn(status);

-- Thêm embedding column vào doc_chunks nếu chưa có (for L1 hybrid search)
-- SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we use a workaround
-- Bạn cần chạy lệnh này thủ công nếu column chưa tồn tại:
-- ALTER TABLE doc_chunks ADD COLUMN embedding TEXT;
