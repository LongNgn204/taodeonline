-- Migration number: 0009  2025-01-10T00:00:00.000Z
-- Description: Ensure policy, pack, blueprint, compliance models exist (aligned with plan3.md)

CREATE TABLE IF NOT EXISTS policies (
    id TEXT PRIMARY KEY,
    doc_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    policy_type TEXT,
    version TEXT,
    rules_json TEXT,
    summary_md TEXT,
    evidence_json TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS policy_packs (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    mode TEXT NOT NULL,
    scope TEXT,
    owner_id TEXT,
    is_public INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS policy_pack_items (
    id TEXT PRIMARY KEY,
    pack_id TEXT NOT NULL REFERENCES policy_packs(id) ON DELETE CASCADE,
    policy_id TEXT NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    precedence INTEGER NOT NULL DEFAULT 10,
    override_strategy TEXT DEFAULT 'merge',
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_policy_pack_items_pack_prec ON policy_pack_items(pack_id, precedence);

CREATE TABLE IF NOT EXISTS exam_blueprints (
    id TEXT PRIMARY KEY,
    mode TEXT NOT NULL,
    subject TEXT NOT NULL,
    version TEXT,
    blueprint_json TEXT,
    effective_from TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS compliance_reports (
    id TEXT PRIMARY KEY,
    exam_id TEXT NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    validator_version TEXT,
    result TEXT,
    issues_json TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
