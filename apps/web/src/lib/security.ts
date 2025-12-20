
// Simple client-side security helpers
// Note: Real security must be enforced on the backend. Client-side checks are for UX and basic deterrence.

export async function calculateSubmissionHash(data: any, secret: string = 'exam-client-secret'): Promise<string> {
    const message = JSON.stringify(data) + secret;
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

export function generateExamSessionId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}
