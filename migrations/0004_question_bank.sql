-- Migration: Question Bank và cộng tác
-- Ngân hàng câu hỏi, phân quyền, chia sẻ

-- Question Bank - Ngân hàng câu hỏi
CREATE TABLE IF NOT EXISTS question_bank (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  organization_id TEXT,            -- NULL = cá nhân, có giá trị = tổ chức
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  topic TEXT,
  unit TEXT,
  level TEXT,                      -- NB, TH, VD
  type TEXT NOT NULL,              -- MCQ, TF, SHORT, ESSAY
  content_json TEXT NOT NULL,      -- Nội dung câu hỏi đầy đủ
  answer_key TEXT,
  source_book TEXT,
  source_page TEXT,
  times_used INTEGER DEFAULT 0,
  avg_difficulty REAL,
  avg_discrimination REAL,
  is_shared INTEGER DEFAULT 0,     -- Có chia sẻ với tổ chức không
  is_approved INTEGER DEFAULT 0,   -- Đã được reviewer duyệt chưa
  approved_by TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Question tags
CREATE TABLE IF NOT EXISTS question_tags (
  question_id TEXT NOT NULL,
  tag TEXT NOT NULL,
  PRIMARY KEY (question_id, tag),
  FOREIGN KEY (question_id) REFERENCES question_bank(id)
);

-- Organizations - Tổ chức (trường, tổ chuyên môn)
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'school',      -- 'school', 'department', 'group'
  invite_code TEXT UNIQUE,
  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Organization members
CREATE TABLE IF NOT EXISTS org_members (
  organization_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  role TEXT DEFAULT 'member',      -- 'admin', 'reviewer', 'member'
  joined_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (organization_id, user_id),
  FOREIGN KEY (organization_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_qb_user ON question_bank(user_id);
CREATE INDEX IF NOT EXISTS idx_qb_subject ON question_bank(subject, grade);
CREATE INDEX IF NOT EXISTS idx_qb_topic ON question_bank(topic);
CREATE INDEX IF NOT EXISTS idx_qb_type ON question_bank(type);
CREATE INDEX IF NOT EXISTS idx_qb_shared ON question_bank(is_shared);
CREATE INDEX IF NOT EXISTS idx_org_members_user ON org_members(user_id);
