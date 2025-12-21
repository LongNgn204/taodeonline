-- Migration number: 0009 	 2025-02-01T00:00:00.000Z
-- Description: Add form_id to exams to store exam form selection

ALTER TABLE exams ADD COLUMN form_id TEXT;
