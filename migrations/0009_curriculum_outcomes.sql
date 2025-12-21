-- Migration number: 0009 	 2025-02-05T00:00:00.000Z
-- Description: Curriculum outcomes for CTGDPT 2018

CREATE TABLE IF NOT EXISTS curriculum_outcomes (
  id TEXT PRIMARY KEY,
  subject TEXT NOT NULL,
  grade INTEGER NOT NULL,
  topic TEXT NOT NULL,
  outcome TEXT NOT NULL, -- Yêu cầu cần đạt
  unit TEXT NOT NULL, -- Đơn vị kiến thức
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_curriculum_outcomes_subject_grade
  ON curriculum_outcomes(subject, grade);

CREATE INDEX IF NOT EXISTS idx_curriculum_outcomes_topic
  ON curriculum_outcomes(topic);
