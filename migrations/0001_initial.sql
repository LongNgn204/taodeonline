-- Chú thích: Schema D1 cho Exam Matrix Generator
-- Theo cấu trúc CV 7991/BGDĐT-GDTrH

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Libraries (bộ sách)
CREATE TABLE IF NOT EXISTS libraries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  subject TEXT NOT NULL,           -- Môn học: Toán, Lý, Hoá, Sinh, ...
  grade INTEGER NOT NULL,          -- Lớp: 1-12
  bookset TEXT,                    -- Bộ sách: Cánh diều, Kết nối tri thức, ...
  term INTEGER,                    -- Học kỳ: 1 hoặc 2
  duration_minutes INTEGER DEFAULT 60,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Documents (SGK, tài liệu upload)
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  library_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,         -- pdf, docx, xlsx
  r2_key TEXT NOT NULL,
  extracted_text_status TEXT DEFAULT 'pending', -- pending, done, error
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (library_id) REFERENCES libraries(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Document chunks cho RAG
CREATE TABLE IF NOT EXISTS doc_chunks (
  id TEXT PRIMARY KEY,
  document_id TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  title_hint TEXT,                 -- Heading/title của chunk
  text TEXT NOT NULL,
  tokens_est INTEGER,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

-- Exams
CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  library_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  matrix_json TEXT NOT NULL,       -- JSON ma trận
  exam_json TEXT,                  -- JSON đề thi
  answer_key_json TEXT,            -- JSON đáp án
  status TEXT DEFAULT 'draft',     -- draft, final
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (library_id) REFERENCES libraries(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Exports (file đã xuất)
CREATE TABLE IF NOT EXISTS exports (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  type TEXT NOT NULL,              -- matrix_xlsx, exam_docx, answer_docx
  r2_key TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes để tối ưu query
CREATE INDEX IF NOT EXISTS idx_libraries_user ON libraries(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_library ON documents(library_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON doc_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_exams_library ON exams(library_id);
CREATE INDEX IF NOT EXISTS idx_exams_user ON exams(user_id);
CREATE INDEX IF NOT EXISTS idx_exports_exam ON exports(exam_id);
