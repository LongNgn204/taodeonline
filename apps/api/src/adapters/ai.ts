// Chú thích: Multi-provider AI adapter - hỗ trợ nhiều LLM providers
// User tự nhập API key, lưu localStorage, backend chỉ proxy call

export interface ChatMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface ChatRequest {
    provider: string;
    model: string;
    apiKey: string;
    messages: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    jsonMode?: boolean;
}

export interface ChatResponse {
    content: string;
    tokensIn: number;
    tokensOut: number;
    model: string;
    latencyMs: number;
}

// Provider configs
const PROVIDER_CONFIGS: Record<
    string,
    {
        baseUrl: string;
        authHeader: (key: string) => Record<string, string>;
        buildBody: (req: ChatRequest) => unknown;
        parseResponse: (data: unknown) => { content: string; tokensIn: number; tokensOut: number };
    }
> = {
    openai: {
        baseUrl: 'https://api.openai.com/v1/chat/completions',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            ...(req.jsonMode && { response_format: { type: 'json_object' } }),
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },

    anthropic: {
        baseUrl: 'https://api.anthropic.com/v1/messages',
        authHeader: (key) => ({
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
        }),
        buildBody: (req) => {
            // Anthropic tách system message
            const systemMsg = req.messages.find((m) => m.role === 'system');
            const otherMsgs = req.messages.filter((m) => m.role !== 'system');

            return {
                model: req.model,
                max_tokens: req.maxTokens ?? 4096,
                ...(systemMsg && { system: systemMsg.content }),
                messages: otherMsgs.map((m) => ({
                    role: m.role === 'assistant' ? 'assistant' : 'user',
                    content: m.content,
                })),
            };
        },
        parseResponse: (data: any) => ({
            content: data.content?.[0]?.text || '',
            tokensIn: data.usage?.input_tokens || 0,
            tokensOut: data.usage?.output_tokens || 0,
        }),
    },

    google: {
        baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
        authHeader: () => ({}), // Key goes in URL
        buildBody: (req) => ({
            contents: req.messages
                .filter((m) => m.role !== 'system')
                .map((m) => ({
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }],
                })),
            systemInstruction: req.messages.find((m) => m.role === 'system')
                ? { parts: [{ text: req.messages.find((m) => m.role === 'system')!.content }] }
                : undefined,
            generationConfig: {
                temperature: req.temperature ?? 0.7,
                maxOutputTokens: req.maxTokens ?? 4096,
                ...(req.jsonMode && { responseMimeType: 'application/json' }),
            },
        }),
        parseResponse: (data: any) => ({
            content: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
            tokensIn: data.usageMetadata?.promptTokenCount || 0,
            tokensOut: data.usageMetadata?.candidatesTokenCount || 0,
        }),
    },

    groq: {
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            ...(req.jsonMode && { response_format: { type: 'json_object' } }),
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },

    deepseek: {
        baseUrl: 'https://api.deepseek.com/chat/completions',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            ...(req.jsonMode && { response_format: { type: 'json_object' } }),
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },

    mistral: {
        baseUrl: 'https://api.mistral.ai/v1/chat/completions',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            ...(req.jsonMode && { response_format: { type: 'json_object' } }),
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },

    cohere: {
        baseUrl: 'https://api.cohere.ai/v1/chat',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => {
            const systemMsg = req.messages.find((m) => m.role === 'system');
            const history = req.messages
                .filter((m) => m.role !== 'system')
                .slice(0, -1)
                .map((m) => ({
                    role: m.role === 'assistant' ? 'CHATBOT' : 'USER',
                    message: m.content,
                }));
            const lastMsg = req.messages.filter((m) => m.role !== 'system').slice(-1)[0];

            return {
                model: req.model,
                message: lastMsg?.content || '',
                chat_history: history,
                ...(systemMsg && { preamble: systemMsg.content }),
                temperature: req.temperature ?? 0.7,
                max_tokens: req.maxTokens ?? 4096,
            };
        },
        parseResponse: (data: any) => ({
            content: data.text || '',
            tokensIn: data.meta?.tokens?.input_tokens || 0,
            tokensOut: data.meta?.tokens?.output_tokens || 0,
        }),
    },

    together: {
        baseUrl: 'https://api.together.xyz/v1/chat/completions',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            ...(req.jsonMode && { response_format: { type: 'json_object' } }),
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },

    // OpenRouter - Unified API for multiple models
    openrouter: {
        baseUrl: 'https://openrouter.ai/api/v1/chat/completions',
        authHeader: (key) => ({
            Authorization: `Bearer ${key}`,
            'HTTP-Referer': 'https://kientaoviet.pages.dev',
            'X-Title': 'Kiến Tạo Việt - Exam Matrix Generator',
        }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
            ...(req.jsonMode && { response_format: { type: 'json_object' } }),
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },

    // Perplexity - Search-focused AI
    perplexity: {
        baseUrl: 'https://api.perplexity.ai/chat/completions',
        authHeader: (key) => ({ Authorization: `Bearer ${key}` }),
        buildBody: (req) => ({
            model: req.model,
            messages: req.messages,
            temperature: req.temperature ?? 0.7,
            max_tokens: req.maxTokens ?? 4096,
        }),
        parseResponse: (data: any) => ({
            content: data.choices?.[0]?.message?.content || '',
            tokensIn: data.usage?.prompt_tokens || 0,
            tokensOut: data.usage?.completion_tokens || 0,
        }),
    },
};

/**
 * Gọi LLM provider với unified interface
 * Không log apiKey, chỉ dùng để proxy call
 */
export async function chat(req: ChatRequest): Promise<ChatResponse> {
    const startTime = Date.now();
    const config = PROVIDER_CONFIGS[req.provider];

    if (!config) {
        throw new Error(`Unsupported provider: ${req.provider}`);
    }

    // Build URL (Google cần model trong URL)
    let url = config.baseUrl;
    if (req.provider === 'google') {
        url = `${config.baseUrl}/${req.model}:generateContent?key=${req.apiKey}`;
    }

    // Build headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...config.authHeader(req.apiKey),
    };

    // Build body
    const body = config.buildBody(req);

    // Call API
    const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ai-adapter] ${req.provider} error:`, response.status, errorText.slice(0, 200));
        throw new Error(`${req.provider} API error: ${response.status}`);
    }

    const data = await response.json();
    const parsed = config.parseResponse(data);
    const latencyMs = Date.now() - startTime;

    // Log metrics (không log key)
    console.info('[ai-adapter] call completed', {
        provider: req.provider,
        model: req.model,
        tokensIn: parsed.tokensIn,
        tokensOut: parsed.tokensOut,
        latencyMs,
    });

    return {
        content: parsed.content,
        tokensIn: parsed.tokensIn,
        tokensOut: parsed.tokensOut,
        model: req.model,
        latencyMs,
    };
}

/**
 * Chat với JSON output - tự động parse và retry nếu lỗi
 */
export async function chatJson<T>(
    req: ChatRequest,
    schema?: { parse: (data: unknown) => T }
): Promise<{ data: T; usage: { tokensIn: number; tokensOut: number; latencyMs: number } }> {
    // Enable JSON mode nếu provider hỗ trợ
    const jsonReq = { ...req, jsonMode: true };

    const response = await chat(jsonReq);

    // Parse JSON
    let parsed: T;
    try {
        // Tìm JSON trong response (có thể có text xung quanh)
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }
        parsed = JSON.parse(jsonMatch[0]);

        // Validate với schema nếu có
        if (schema) {
            parsed = schema.parse(parsed);
        }
    } catch (e) {
        console.error('[ai-adapter] JSON parse error:', e);
        throw new Error(`Failed to parse JSON response: ${e}`);
    }

    return {
        data: parsed,
        usage: {
            tokensIn: response.tokensIn,
            tokensOut: response.tokensOut,
            latencyMs: response.latencyMs,
        },
    };
}
