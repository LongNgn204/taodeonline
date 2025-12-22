-- Chú thích: Migration cho research jobs - cho phép AI tiếp tục chạy khi user thoát trang
-- Tracks: job status, progress, results, và cho phép resume

CREATE TABLE IF NOT EXISTS research_jobs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    library_id TEXT NOT NULL,
    
    -- Job configuration
    num_topics INTEGER DEFAULT 4,
    policy_id TEXT,
    
    -- Document context (cached to avoid re-fetching)
    document_context TEXT, -- Combined text from documents
    total_tokens INTEGER DEFAULT 0,
    documents_count INTEGER DEFAULT 0,
    
    -- Progress tracking
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reading', 'analyzing', 'generating', 'done', 'failed')),
    progress INTEGER DEFAULT 0, -- 0-100
    current_stage TEXT DEFAULT 'reading',
    
    -- Results
    matrix_json TEXT, -- Generated matrix
    exam_json TEXT, -- Generated exam (if applicable)
    error_message TEXT,
    
    -- Timestamps
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    completed_at TEXT,
    
    -- Indexes
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (library_id) REFERENCES libraries(id) ON DELETE CASCADE
);

-- Index để query jobs theo user và status
CREATE INDEX IF NOT EXISTS idx_research_jobs_user ON research_jobs(user_id, status);
CREATE INDEX IF NOT EXISTS idx_research_jobs_library ON research_jobs(library_id);
