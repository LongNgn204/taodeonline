// Chú thích: Export routes - xuất Excel và Word

import { Hono } from 'hono';
import { generateId, isoNow, safeJsonParse, validateExamForm } from '@exam-matrix/shared';
import type { Matrix, ExamContent } from '@exam-matrix/shared';
import { exportMatrixToExcel } from '@exam-matrix/export';
import { exportExamToWord } from '@exam-matrix/export';
import type { Env } from '../types.js';

const exports = new Hono<{ Bindings: Env }>();

// POST /exports/:examId/matrix-xlsx - Xuất ma trận sang Excel
exports.post('/:examId/matrix-xlsx', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('examId');

    // Get exam
    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?')
        .bind(examId, user.id)
        .first<{ id: string; matrix_json: string; title: string }>();

    if (!exam) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Parse matrix
    const matrix = safeJsonParse<Matrix | null>(exam.matrix_json, null);
    if (!matrix) {
        return c.json({ error: 'invalid_matrix', message: 'Ma trận không hợp lệ' }, 400);
    }

    // Generate Excel
    const buffer = await exportMatrixToExcel(matrix);

    // Upload to R2
    const r2Key = `exports/${user.id}/${examId}/matrix_${Date.now()}.xlsx`;
    await c.env.R2.put(r2Key, buffer, {
        httpMetadata: {
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
    });

    // Save export record
    const exportId = generateId('exp');
    await c.env.DB.prepare(
        'INSERT INTO exports (id, exam_id, user_id, type, r2_key, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
        .bind(exportId, examId, user.id, 'matrix_xlsx', r2Key, isoNow())
        .run();

    // Generate signed URL for download (1 hour)
    // Note: R2 signed URLs need custom implementation
    // For now, return direct download through API
    console.info('[export] matrix xlsx created', { examId, exportId });

    return c.json({
        success: true,
        exportId,
        downloadUrl: `/exports/${exportId}/download`,
    });
});

// POST /exports/:examId/exam-docx - Xuất đề thi sang Word
exports.post('/:examId/exam-docx', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const examId = c.req.param('examId');

    const exam = await c.env.DB.prepare('SELECT * FROM exams WHERE id = ? AND user_id = ?')
        .bind(examId, user.id)
        .first<{ id: string; exam_json: string; title: string; form_id?: string }>();

    if (!exam || !exam.exam_json) {
        return c.json({ error: 'no_exam_content', message: 'Chưa có nội dung đề thi' }, 400);
    }

    const examContent = safeJsonParse<ExamContent | null>(exam.exam_json, null);
    if (!examContent) {
        return c.json({ error: 'invalid_exam', message: 'Nội dung đề thi không hợp lệ' }, 400);
    }
    if (!examContent.formId && exam.form_id) {
        examContent.formId = exam.form_id;
    }

    const formValidation = validateExamForm(examContent);
    if (!formValidation.valid) {
        console.warn('[export] form validation failed', { examId, issues: formValidation.issues });
        return c.json(
            {
                error: 'invalid_exam_form',
                message: 'Form đề thi không hợp lệ',
                details: formValidation.issues,
            },
            400
        );
    }

    // Generate Word
    const buffer = await exportExamToWord(examContent);

    // Upload to R2
    const r2Key = `exports/${user.id}/${examId}/exam_${Date.now()}.docx`;
    await c.env.R2.put(r2Key, buffer, {
        httpMetadata: {
            contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
    });

    // Save export record
    const exportId = generateId('exp');
    await c.env.DB.prepare(
        'INSERT INTO exports (id, exam_id, user_id, type, r2_key, created_at) VALUES (?, ?, ?, ?, ?, ?)'
    )
        .bind(exportId, examId, user.id, 'exam_docx', r2Key, isoNow())
        .run();

    console.info('[export] exam docx created', { examId, exportId });

    return c.json({
        success: true,
        exportId,
        downloadUrl: `/exports/${exportId}/download`,
    });
});

// GET /exports/:exportId/download - Download file
exports.get('/:exportId/download', async (c) => {
    const user = c.get('user');
    if (!user) return c.json({ error: 'unauthorized' }, 401);

    const exportId = c.req.param('exportId');

    const exp = await c.env.DB.prepare('SELECT * FROM exports WHERE id = ? AND user_id = ?')
        .bind(exportId, user.id)
        .first<{ r2_key: string; type: string }>();

    if (!exp) {
        return c.json({ error: 'not_found' }, 404);
    }

    // Get from R2
    const object = await c.env.R2.get(exp.r2_key);
    if (!object) {
        return c.json({ error: 'file_not_found' }, 404);
    }

    // Determine content type and filename
    let contentType = 'application/octet-stream';
    let filename = 'download';

    if (exp.type === 'matrix_xlsx') {
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        filename = 'ma_tran_de.xlsx';
    } else if (exp.type === 'exam_docx' || exp.type === 'answer_docx') {
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        filename = exp.type === 'exam_docx' ? 'de_thi.docx' : 'dap_an.docx';
    }

    return new Response(object.body, {
        headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
});

export { exports as exportRoutes };
