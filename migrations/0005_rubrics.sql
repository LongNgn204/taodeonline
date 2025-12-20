-- Migration: Rubric và chấm tự luận
-- Essay grading với AI assistance

-- Rubrics - Định nghĩa tiêu chí chấm
CREATE TABLE IF NOT EXISTS rubrics (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  subject TEXT,
  description TEXT,
  criteria_json TEXT NOT NULL,     -- [{criterion, levels: [{level, points, description}]}]
  max_score REAL DEFAULT 10,
  is_template INTEGER DEFAULT 0,   -- Có phải template mẫu không
  times_used INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Essay grades - Kết quả chấm tự luận
CREATE TABLE IF NOT EXISTS essay_grades (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL,
  question_id TEXT NOT NULL,
  rubric_id TEXT,
  student_response TEXT,           -- Bài làm của học sinh
  ai_suggested_score REAL,         -- Điểm AI gợi ý
  ai_feedback_json TEXT,           -- JSON feedback theo từng tiêu chí
  ai_confidence REAL,              -- Độ tin cậy của AI (0-1)
  final_score REAL,                -- Điểm cuối cùng (giáo viên quyết định)
  teacher_feedback TEXT,           -- Nhận xét của giáo viên
  graded_by TEXT,                  -- 'ai' hoặc user_id
  graded_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (attempt_id) REFERENCES student_attempts(id),
  FOREIGN KEY (rubric_id) REFERENCES rubrics(id)
);

-- Personalized feedback templates
CREATE TABLE IF NOT EXISTS feedback_templates (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,          -- 'grammar', 'content', 'structure', 'suggestion'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rubrics_user ON rubrics(user_id);
CREATE INDEX IF NOT EXISTS idx_rubrics_subject ON rubrics(subject);
CREATE INDEX IF NOT EXISTS idx_essay_grades_attempt ON essay_grades(attempt_id);
CREATE INDEX IF NOT EXISTS idx_feedback_templates_user ON feedback_templates(user_id);
