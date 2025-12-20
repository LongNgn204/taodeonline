-- Migration: Analytics và Phân tích đề thi
-- Thống kê độ khó, phân biệt và kết quả học sinh

-- Student attempts - Lưu bài làm của học sinh
CREATE TABLE IF NOT EXISTS student_attempts (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  student_name TEXT,
  student_id TEXT,
  version_code TEXT DEFAULT 'A',     -- Mã đề (A, B, C, ...)
  answers_json TEXT NOT NULL,        -- JSON câu trả lời
  score REAL,                        -- Điểm đạt được
  max_score REAL DEFAULT 10,
  time_taken_minutes INTEGER,
  started_at TEXT,
  submitted_at TEXT DEFAULT (datetime('now')),
  graded_at TEXT,
  graded_by TEXT,                    -- 'auto' hoặc user_id
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Item statistics - Thống kê từng câu hỏi
CREATE TABLE IF NOT EXISTS item_stats (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  attempts_count INTEGER DEFAULT 0,   -- Số lượt làm
  correct_count INTEGER DEFAULT 0,    -- Số lần đúng
  difficulty_index REAL,              -- Tỷ lệ đúng (0-1)
  discrimination_index REAL,          -- Chỉ số phân biệt
  distractor_analysis TEXT,           -- JSON phân tích các đáp án nhiễu
  avg_time_seconds INTEGER,           -- Thời gian TB làm câu
  last_calculated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Exam statistics - Thống kê tổng hợp đề thi
CREATE TABLE IF NOT EXISTS exam_stats (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL UNIQUE,
  attempts_count INTEGER DEFAULT 0,
  avg_score REAL,
  min_score REAL,
  max_score REAL,
  std_deviation REAL,
  avg_time_minutes REAL,
  pass_rate REAL,                     -- Tỷ lệ đạt (>= 5 điểm)
  score_distribution TEXT,            -- JSON phân bố điểm
  topic_performance TEXT,             -- JSON hiệu suất theo chủ đề
  level_performance TEXT,             -- JSON hiệu suất theo mức độ
  last_calculated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Improvement suggestions - Gợi ý cải thiện câu hỏi
CREATE TABLE IF NOT EXISTS question_suggestions (
  id TEXT PRIMARY KEY,
  question_id TEXT NOT NULL,
  exam_id TEXT NOT NULL,
  suggestion_type TEXT NOT NULL,      -- 'difficulty', 'discrimination', 'distractor', 'wording'
  severity TEXT DEFAULT 'info',       -- 'info', 'warning', 'critical'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  is_resolved INTEGER DEFAULT 0,
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON student_attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON student_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_item_stats_exam ON item_stats(exam_id);
CREATE INDEX IF NOT EXISTS idx_item_stats_question ON item_stats(question_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_exam ON question_suggestions(exam_id);
