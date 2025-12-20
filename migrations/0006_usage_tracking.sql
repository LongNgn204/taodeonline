-- Migration: Usage tracking và Infrastructure
-- Theo dõi token, chi phí, cache

-- API usage tracking
CREATE TABLE IF NOT EXISTS api_usage (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  provider TEXT NOT NULL,          -- openai, anthropic, google, etc.
  model TEXT NOT NULL,
  endpoint TEXT,                   -- 'generate-matrix', 'generate-exam', etc.
  input_tokens INTEGER,
  output_tokens INTEGER,
  total_tokens INTEGER,
  cost_usd REAL,
  latency_ms INTEGER,
  success INTEGER DEFAULT 1,
  error_message TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily usage summary
CREATE TABLE IF NOT EXISTS usage_daily_summary (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  date TEXT NOT NULL,              -- YYYY-MM-DD
  total_requests INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  total_cost_usd REAL DEFAULT 0,
  success_count INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  UNIQUE(user_id, date),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Cache entries (for RAG and question bank)
CREATE TABLE IF NOT EXISTS cache_entries (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  expires_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_api_usage_user ON api_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_api_usage_date ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_provider ON api_usage(provider);
CREATE INDEX IF NOT EXISTS idx_usage_summary_user ON usage_daily_summary(user_id, date);
CREATE INDEX IF NOT EXISTS idx_cache_expires ON cache_entries(expires_at);
