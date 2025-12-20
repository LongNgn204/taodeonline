
import type { Env } from '../types';
import { Buffer } from 'node:buffer'; // Worker environment usually supports Buffer or Uint8Array

export class OCRService {
    private env: Env;

    constructor(env: Env) {
        this.env = env;
    }

    async processImage(key: string, apiKey: string, provider: string, model: string): Promise<string> {
        // 1. Get file from R2
        const object = await this.env.R2.get(key);
        if (!object) throw new Error('Image not found');

        const arrayBuffer = await object.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mimeType = object.httpMetadata?.contentType || 'image/jpeg';

        // 2. Call AI Provider
        if (provider === 'google') {
            return this.callGoogle(base64, mimeType, apiKey, model);
        } else if (provider === 'openai') {
            return this.callOpenAI(base64, mimeType, apiKey, model);
        }

        throw new Error(`Provider ${provider} not supported for Vision`);
    }

    private async callGoogle(base64: string, mimeType: string, apiKey: string, model: string): Promise<string> {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const prompt = `
            Hãy trích xuất nội dung đề thi từ hình ảnh này.
            Trả về định dạng JSON thuần (không markdown) theo cấu trúc:
            {
                "title": "Tên đề thi",
                "questions": [
                    {
                        "content": "Nội dung câu hỏi...",
                        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
                        "level": "NB/TH/VD/VDC" (dự đoán)
                    }
                ]
            }
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType, data: base64 } }
                    ]
                }]
            })
        });

        const data: any = await response.json();
        if (data.error) throw new Error(data.error.message);

        return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }

    private async callOpenAI(base64: string, mimeType: string, apiKey: string, model: string): Promise<string> {
        const url = 'https://api.openai.com/v1/chat/completions';

        const prompt = `
            Extract exam content from this image.
            Return ONLY raw JSON (no markdown formatting) with structure:
            {
                "title": "Exam Title",
                "questions": [
                    {
                        "content": "Question text...",
                        "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
                        "level": "NB/TH/VD/VDC" (predict)
                    }
                ]
            }
        `;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [
                    {
                        role: 'user',
                        content: [
                            { type: 'text', text: prompt },
                            { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } }
                        ]
                    }
                ],
                max_tokens: 4000
            })
        });

        const data: any = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.choices?.[0]?.message?.content || '';
    }

    async uploadToR2(file: File): Promise<string> {
        const key = `ocr-uploads/${Date.now()}-${file.name}`;
        await this.env.R2.put(key, file, {
            httpMetadata: { contentType: file.type }
        });
        return key;
    }
}
