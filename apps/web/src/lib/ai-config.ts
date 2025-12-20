export interface AIConfig {
    apiKey: string;
    providerId: string;
    modelId: string;
    visionModelId: string;
}

export const getAIConfig = (): AIConfig => {
    const encodedKey = localStorage.getItem('ai_api_key') || '';
    let apiKey = encodedKey;

    // Try to decode if looks like base64 (hacky check but works for simple obfuscation)
    // Real keys usually don't have == at the end unless base64, but providers like Google/OpenAI use specific charsets.
    // Safest way: try atob, if fail or result looks garbage, keep original?
    // Since we CONTROL the saving in Settings.tsx, we know we use btoa.
    // But for backward compatibility with existing keys in user browser:
    try {
        const decoded = atob(encodedKey);
        // Basic heuristic: if decoded key looks clean (e.g. starts with sk-, AIza), use it.
        // Or simply trust our Settings page always saves in base64.
        // For robustness:
        if (decoded && (decoded.startsWith('sk-') || decoded.startsWith('AIza') || decoded.startsWith('gsk_'))) {
            apiKey = decoded;
        } else {
            // If decoding fails to produce a known prefix, maybe it wasnt encoded? 
            // But valid key checked in Settings starts with known prefix.
            // If original string starts with known prefix, use original.
            if (encodedKey.startsWith('sk-') || encodedKey.startsWith('AIza') || encodedKey.startsWith('gsk_')) {
                apiKey = encodedKey;
            } else {
                // Assume encoded
                apiKey = decoded;
            }
        }
    } catch (e) {
        // Not base64
        apiKey = encodedKey;
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
