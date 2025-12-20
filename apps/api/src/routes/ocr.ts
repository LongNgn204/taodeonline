
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
        const apiKey = body['apiKey'] as string;
        const provider = body['provider'] as string;
        const model = body['model'] as string;

        if (!file || !(file instanceof File)) {
            return c.json({ error: 'No file uploaded' }, 400);
        }

        if (!apiKey || !provider || !model) {
            return c.json({ error: 'Missing AI credentials (apiKey, provider, model)' }, 400);
        }

        const ocrService = new OCRService(c.env);
        const key = await ocrService.uploadToR2(file);

        // Process with AI
        const extractedText = await ocrService.processImage(key, apiKey, provider, model);

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
