export interface AIConfig {
    apiKey: string;
    providerId: string;
    modelId: string;
    visionModelId: string;
}

export const getAIConfig = (): AIConfig => {
    const encodedKey = localStorage.getItem('ai_api_key') || '';
    let apiKey = encodedKey;

    // Chú thích: Settings.tsx luôn lưu key đã encode bằng btoa()
    // Đơn giản: thử decode, nếu fail thì dùng original (backward compat)
    if (encodedKey) {
        try {
            const decoded = atob(encodedKey);
            // Nếu decode thành công và có nội dung, dùng decoded
            // (key thật không bao giờ là base64 hợp lệ của chính nó)
            if (decoded && decoded.length > 0) {
                apiKey = decoded;
            }
        } catch (e) {
            // Not base64, dùng original (key chưa encode từ phiên bản cũ)
            apiKey = encodedKey;
        }
    }

    return {
        apiKey,
        providerId: localStorage.getItem('ai_provider_id') || 'openai',
        modelId: localStorage.getItem('ai_selected_model') || '',
        visionModelId: localStorage.getItem('ai_vision_model') || ''
    };
};

export const AI_ENDPOINTS: Record<string, string> = {
    openai: 'https://api.openai.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    groq: 'https://api.groq.com/openai/v1',
    deepseek: 'https://api.deepseek.com',
    mistral: 'https://api.mistral.ai/v1',
    perplexity: 'https://api.perplexity.ai',
    together: 'https://api.together.xyz/v1',
    // Anthropic and Google have different SDKs/Endpoints structure
    anthropic: 'https://api.anthropic.com/v1',
    google: 'https://generativelanguage.googleapis.com/v1beta'
};
