-- Migration: Generation Logs table
-- Chú thích: Lưu lịch sử tạo ma trận/đề từ frontend AI calls

CREATE TABLE IF NOT EXISTS generation_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    library_id TEXT,
    type TEXT NOT NULL DEFAULT 'unknown', -- 'matrix' | 'exam' | 'chat'
    provider TEXT,
    model TEXT,
    result_json TEXT, -- JSON của kết quả (truncated nếu quá dài)
    tokens_in INTEGER,
    tokens_out INTEGER,
    latency_ms INTEGER,
    created_at TEXT NOT NULL,
    
    FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE SET NULL
);

-- Index cho query theo user và thời gian
CREATE INDEX IF NOT EXISTS idx_generation_logs_user ON generation_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generation_logs_library ON generation_logs(library_id);
