-- Create shared_matrices table
CREATE TABLE IF NOT EXISTS shared_matrices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    original_matrix_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    grade TEXT,
    matrix_json TEXT NOT NULL,
    downloads INTEGER DEFAULT 0,
    created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shared_matrices_created_at ON shared_matrices(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_shared_matrices_subject_grade ON shared_matrices(subject, grade);
