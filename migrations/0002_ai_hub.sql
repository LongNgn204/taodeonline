-- Migration: AI Literacy Hub
-- Theo dõi tiến độ học AI của giáo viên

-- Courses table - Khóa học AI
CREATE TABLE IF NOT EXISTS ai_hub_courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,        -- 'prompting', 'verification', 'assessment', 'general'
  difficulty TEXT DEFAULT 'beginner', -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INTEGER DEFAULT 30,
  content_json TEXT NOT NULL,    -- Nội dung khóa học dạng JSON
  order_index INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- User progress tracking
CREATE TABLE IF NOT EXISTS ai_hub_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  current_section INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  completed_at TEXT,
  last_accessed_at TEXT DEFAULT (datetime('now')),
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (course_id) REFERENCES ai_hub_courses(id),
  UNIQUE(user_id, course_id)
);

-- Resources library - Tài liệu tham khảo
CREATE TABLE IF NOT EXISTS ai_hub_resources (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT NOT NULL,   -- 'document', 'video', 'example', 'template'
  category TEXT NOT NULL,
  url TEXT,
  content TEXT,
  tags TEXT,                     -- JSON array of tags
  view_count INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Coach tips - Gợi ý khi thao tác
CREATE TABLE IF NOT EXISTS ai_hub_coach_tips (
  id TEXT PRIMARY KEY,
  trigger_context TEXT NOT NULL, -- 'matrix_creation', 'question_generation', 'level_selection'
  tip_title TEXT NOT NULL,
  tip_content TEXT NOT NULL,
  tip_type TEXT DEFAULT 'info',  -- 'info', 'warning', 'suggestion'
  priority INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_ai_progress_user ON ai_hub_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_progress_course ON ai_hub_progress(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_resources_category ON ai_hub_resources(category);
CREATE INDEX IF NOT EXISTS idx_ai_coach_context ON ai_hub_coach_tips(trigger_context);

-- Insert default courses
INSERT OR IGNORE INTO ai_hub_courses (id, title, description, category, difficulty, duration_minutes, content_json, order_index) VALUES
('course_prompting_101', 'AI Prompting cơ bản', 'Học cách viết prompt hiệu quả để tạo câu hỏi chất lượng', 'prompting', 'beginner', 20, '{"sections":[{"title":"Giới thiệu Prompt Engineering","content":"Prompt là..."},{"title":"Cấu trúc prompt hiệu quả","content":"..."},{"title":"Thực hành","content":"..."}]}', 1),
('course_verification', 'Kiểm chứng đáp án AI', 'Kỹ năng đánh giá và kiểm tra độ chính xác của AI', 'verification', 'beginner', 25, '{"sections":[{"title":"Tại sao cần kiểm chứng","content":"..."},{"title":"Các bước kiểm tra","content":"..."},{"title":"Công cụ hỗ trợ","content":"..."}]}', 2),
('course_bloom_taxonomy', 'Phân loại Bloom và AI', 'Hiểu mức độ nhận thức trong đánh giá', 'assessment', 'intermediate', 30, '{"sections":[{"title":"Thang Bloom","content":"..."},{"title":"Áp dụng với AI","content":"..."}]}', 3);

-- Insert default coach tips
INSERT OR IGNORE INTO ai_hub_coach_tips (id, trigger_context, tip_title, tip_content, tip_type, priority) VALUES
('tip_ratio_reminder', 'matrix_creation', 'Tỷ lệ phân bổ', 'Theo CV 7991, tỷ lệ chuẩn là: Nhận biết 40% - Thông hiểu 30% - Vận dụng 30%', 'info', 1),
('tip_source_check', 'question_generation', 'Kiểm tra nguồn', 'Hãy đảm bảo mỗi câu hỏi có trích dẫn nguồn từ SGK để tránh thông tin sai lệch', 'warning', 2),
('tip_level_nb', 'level_selection', 'Mức Nhận biết', 'Câu hỏi Nhận biết yêu cầu học sinh nhớ lại, nhận ra kiến thức đã học', 'suggestion', 1),
('tip_level_th', 'level_selection', 'Mức Thông hiểu', 'Câu hỏi Thông hiểu yêu cầu học sinh giải thích, diễn đạt lại kiến thức', 'suggestion', 2),
('tip_level_vd', 'level_selection', 'Mức Vận dụng', 'Câu hỏi Vận dụng yêu cầu học sinh áp dụng kiến thức vào tình huống mới', 'suggestion', 3);
