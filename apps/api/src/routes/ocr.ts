
import { Hono } from 'hono';
import { OCRService } from '../services/OCRService';
import { authMiddleware } from '../middleware/auth';
import type { Env } from '../types';

const ocr = new Hono<{ Bindings: Env }>();

ocr.use('*', authMiddleware);

ocr.post('/upload', async (c) => {
    try {
        const body = await c.req.parseBody();
        const file = body['file'];

        if (!file || !(file instanceof File)) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        const ocrService = new OCRService(c.env);
        const key = await ocrService.uploadToR2(file);

        // In real app, we might trigger an async job here. 
        // For simple demo, we process immediately (note: Worker has execution time limit)
        // Ideally: Return key, client polls status. 

        // Mocking the process for now:
        const extractedText = await ocrService.processImage(key);

        return c.json({
            success: true,
            key,
            extractedText
        });
    } catch (error) {
        console.error('OCR Upload error:', error);
        return c.json({ error: 'Processing failed' }, 500);
    }
});

export default ocr;
