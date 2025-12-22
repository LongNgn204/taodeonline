// Chú thích: API routes cho research jobs - background processing
// Cho phép tạo job, poll status, và resume khi user quay lại

import { Hono } from 'hono';
import type { Bindings } from '../types';
import { authMiddleware } from '../middleware/auth';
import { nanoid } from 'nanoid';

interface ResearchJob {
    id: string;
    user_id: string;
    library_id: string;
    status: 'pending' | 'reading' | 'analyzing' | 'generating' | 'done' | 'failed';
    progress: number;
    current_stage: string;
    matrix_json?: string;
    exam_json?: string;
    error_message?: string;
    created_at: string;
    updated_at: string;
}

const researchJobs = new Hono<{ Bindings: Bindings }>();

// Auth required for all routes
researchJobs.use('*', authMiddleware);

// Chú thích: Tạo research job mới
researchJobs.post('/create', async (c) => {
    const userId = c.get('userId');
    const { libraryId, numTopics, policyId, documentContext, totalTokens, documentsCount } = await c.req.json();

    if (!libraryId) {
        return c.json({ error: 'libraryId is required' }, 400);
    }

    const jobId = nanoid();

    try {
        await c.env.DB.prepare(`
            INSERT INTO research_jobs (
                id, user_id, library_id, num_topics, policy_id,
                document_context, total_tokens, documents_count,
                status, progress, current_stage
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 'reading')
        `).bind(
            jobId,
            userId,
            libraryId,
            numTopics || 4,
            policyId || null,
            documentContext || null,
            totalTokens || 0,
            documentsCount || 0
        ).run();

        return c.json({
            success: true,
            jobId,
            message: 'Job created successfully'
        });
    } catch (err: any) {
        console.error('[research-jobs] create error:', err);
        return c.json({ error: err.message || 'Failed to create job' }, 500);
    }
});

// Chú thích: Lấy status của job (polling endpoint)
researchJobs.get('/:jobId', async (c) => {
    const userId = c.get('userId');
    const jobId = c.req.param('jobId');

    try {
        const job = await c.env.DB.prepare(`
            SELECT * FROM research_jobs WHERE id = ? AND user_id = ?
        `).bind(jobId, userId).first<ResearchJob>();

        if (!job) {
            return c.json({ error: 'Job not found' }, 404);
        }

        return c.json({
            job: {
                id: job.id,
                status: job.status,
                progress: job.progress,
                currentStage: job.current_stage,
                matrix: job.matrix_json ? JSON.parse(job.matrix_json) : null,
                exam: job.exam_json ? JSON.parse(job.exam_json) : null,
                error: job.error_message,
                createdAt: job.created_at,
                updatedAt: job.updated_at,
            }
        });
    } catch (err: any) {
        console.error('[research-jobs] get error:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Chú thích: Update job status (internal use)
researchJobs.patch('/:jobId', async (c) => {
    const userId = c.get('userId');
    const jobId = c.req.param('jobId');
    const { status, progress, currentStage, matrixJson, examJson, errorMessage } = await c.req.json();

    try {
        // Verify job belongs to user
        const existing = await c.env.DB.prepare(`
            SELECT id FROM research_jobs WHERE id = ? AND user_id = ?
        `).bind(jobId, userId).first();

        if (!existing) {
            return c.json({ error: 'Job not found' }, 404);
        }

        // Build update query dynamically
        const updates: string[] = ["updated_at = datetime('now')"];
        const values: any[] = [];

        if (status) {
            updates.push('status = ?');
            values.push(status);
        }
        if (typeof progress === 'number') {
            updates.push('progress = ?');
            values.push(progress);
        }
        if (currentStage) {
            updates.push('current_stage = ?');
            values.push(currentStage);
        }
        if (matrixJson) {
            updates.push('matrix_json = ?');
            values.push(JSON.stringify(matrixJson));
        }
        if (examJson) {
            updates.push('exam_json = ?');
            values.push(JSON.stringify(examJson));
        }
        if (errorMessage !== undefined) {
            updates.push('error_message = ?');
            values.push(errorMessage);
        }
        if (status === 'done' || status === 'failed') {
            updates.push("completed_at = datetime('now')");
        }

        values.push(jobId);

        await c.env.DB.prepare(`
            UPDATE research_jobs SET ${updates.join(', ')} WHERE id = ?
        `).bind(...values).run();

        return c.json({ success: true });
    } catch (err: any) {
        console.error('[research-jobs] update error:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Chú thích: Lấy danh sách jobs của user (recent, pending first)
researchJobs.get('/', async (c) => {
    const userId = c.get('userId');
    const limit = parseInt(c.req.query('limit') || '10');

    try {
        const jobs = await c.env.DB.prepare(`
            SELECT id, library_id, status, progress, current_stage, created_at, updated_at
            FROM research_jobs 
            WHERE user_id = ?
            ORDER BY 
                CASE WHEN status IN ('pending', 'reading', 'analyzing', 'generating') THEN 0 ELSE 1 END,
                created_at DESC
            LIMIT ?
        `).bind(userId, limit).all();

        return c.json({ jobs: jobs.results || [] });
    } catch (err: any) {
        console.error('[research-jobs] list error:', err);
        return c.json({ error: err.message }, 500);
    }
});

// Chú thích: Xóa job
researchJobs.delete('/:jobId', async (c) => {
    const userId = c.get('userId');
    const jobId = c.req.param('jobId');

    try {
        await c.env.DB.prepare(`
            DELETE FROM research_jobs WHERE id = ? AND user_id = ?
        `).bind(jobId, userId).run();

        return c.json({ success: true });
    } catch (err: any) {
        console.error('[research-jobs] delete error:', err);
        return c.json({ error: err.message }, 500);
    }
});

export { researchJobs };
