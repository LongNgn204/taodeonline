// Chú thích: Entry point cho Cloudflare Worker API
// Sử dụng Hono làm router, modular theo routes

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRoutes } from './routes/auth.js';
import { libraryRoutes } from './routes/libraries.js';
import { documentRoutes } from './routes/documents.js';
import { examRoutes } from './routes/exams.js';
import { exportRoutes } from './routes/exports.js';
import { gradingRoutes } from './routes/grading.js';
import { blueprintRoutes } from './routes/blueprints.js';
import { packRoutes } from './routes/packs.js';
import { examRoutesV2 } from './routes/exams_new.js';
import aiHubRoutes from './routes/aiHub.js';
import { authMiddleware } from './middleware/auth.js';
import type { Env } from './types.js';

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', logger());
app.use(
    '*',
    cors({
        origin: [
            'http://localhost:5173',
            'https://exam-matrix.pages.dev',
            'https://kientaoviet.pages.dev', // Production frontend
        ],
        credentials: true,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: ['Content-Type', 'Authorization'],
    })
);

// Health check
app.get('/', (c) => {
    return c.json({
        name: 'Hệ thống Tạo Đề Thi AI API',
        version: '0.1.0',
        status: 'ok',
        timestamp: new Date().toISOString(),
    });
});

// Public routes
app.route('/auth', authRoutes);

// Protected routes - cần auth
app.use('/libraries/*', authMiddleware);
app.use('/documents/*', authMiddleware);
app.use('/exams/*', authMiddleware);
app.use('/exports/*', authMiddleware);
app.use('/grading/*', authMiddleware);
app.use('/me', authMiddleware);

app.route('/libraries', libraryRoutes);
app.route('/documents', documentRoutes);
app.route('/exams', examRoutes);
app.route('/exports', exportRoutes);
app.route('/exports', exportRoutes);
app.route('/grading', gradingRoutes);

// New Routes (Multi-doc + 2 Modes)
app.route('/blueprints', blueprintRoutes);
app.route('/packs', packRoutes);
app.route('/exams-v2', examRoutesV2);

// Public Exams (Student Portal)
import publicExams from './routes/public_exams.js';
app.route('/public/exams', publicExams);

// AI Hub routes (optional auth - some endpoints work without auth)
app.use('/ai-hub/*', authMiddleware);
app.route('/ai-hub', aiHubRoutes);

// Analytics routes
import analyticsRoutes from './routes/analytics.js';
app.use('/analytics/*', authMiddleware);
app.route('/analytics', analyticsRoutes);

// Question Bank routes
import questionBankRoutes from './routes/questionBank.js';
app.use('/question-bank/*', authMiddleware);
app.route('/question-bank', questionBankRoutes);

// OCR routes
// OCR routes
import ocrRoutes from './routes/ocr.js';
app.use('/ocr/*', authMiddleware);
app.route('/ocr', ocrRoutes);

// Community routes
import { communityRoutes } from './routes/community.js';
app.use('/community/*', authMiddleware);
app.route('/community', communityRoutes);

// Policy routes (multi-policy support)
import { policyRoutes } from './routes/policies.js';
app.route('/policies', policyRoutes); // Public - no auth required

// Teacher Preferences routes
import { preferencesRoutes } from './routes/preferences.js';
app.use('/preferences/*', authMiddleware);
app.route('/preferences', preferencesRoutes);

// Research Jobs routes (background processing)
import { researchJobs } from './routes/research-jobs.js';
app.use('/research-jobs/*', authMiddleware);
app.route('/research-jobs', researchJobs);

// Get current user
app.get('/me', (c) => {
    const user = c.get('user');
    return c.json({ user });
});

// Error handler
app.onError((err, c) => {
    console.error('[API Error]', err);
    return c.json(
        {
            error: 'internal_error',
            message: err.message || 'An unexpected error occurred',
        },
        500
    );
});

// 404 handler
app.notFound((c) => {
    return c.json(
        {
            error: 'not_found',
            message: 'Endpoint not found',
        },
        404
    );
});

export { CollaborationDO } from './durable_objects/CollaborationDO';
import collaborationRoutes from './routes/collaboration.js';

app.use('/collab/*', authMiddleware);
app.route('/collab', collaborationRoutes);

export default app;
