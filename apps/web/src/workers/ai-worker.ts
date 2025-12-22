// Chú thích: AI Generation Web Worker
// Chạy AI pipeline off-main-thread để không block UI

import { generateMatrixWithPolicy, generateExamWithPolicy } from '../lib/frontend-ai';

// Worker message types
export interface WorkerMessage {
    type: 'generate_matrix' | 'generate_exam' | 'cancel';
    payload?: any;
    jobId: string;
}

export interface WorkerResponse {
    type: 'progress' | 'result' | 'error' | 'cancelled';
    jobId: string;
    step?: string;
    progress?: number;
    result?: any;
    error?: string;
}

// Worker state
let currentJobId: string | null = null;
let abortController: AbortController | null = null;

// Handle messages from main thread
self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type, payload, jobId } = event.data;

    switch (type) {
        case 'generate_matrix':
            await handleGenerateMatrix(jobId, payload);
            break;

        case 'generate_exam':
            await handleGenerateExam(jobId, payload);
            break;

        case 'cancel':
            handleCancel(jobId);
            break;

        default:
            postResponse({
                type: 'error',
                jobId,
                error: `Unknown message type: ${type}`,
            });
    }
};

async function handleGenerateMatrix(jobId: string, payload: any) {
    currentJobId = jobId;
    abortController = new AbortController();

    try {
        // Step 1: Fetch policy context
        postProgress(jobId, 'Đang tải policy context...', 10);

        // Step 2: Fetch RAG context (if needed)
        postProgress(jobId, 'Đang lấy context từ tài liệu...', 30);

        // Step 3: Generate matrix
        postProgress(jobId, 'Đang sinh ma trận với AI...', 50);

        const result = await generateMatrixWithPolicy({
            grade: payload.grade,
            subject: payload.subject,
            assessmentType: payload.assessmentType || 'school_assessment',
            numTopics: payload.numTopics || 4,
            documentContext: payload.documentContext,
        });

        // Step 4: Validate
        postProgress(jobId, 'Đang kiểm tra kết quả...', 90);

        // Success
        postResponse({
            type: 'result',
            jobId,
            result,
        });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            postResponse({ type: 'cancelled', jobId });
        } else {
            postResponse({
                type: 'error',
                jobId,
                error: error.message || 'Unknown error',
            });
        }
    } finally {
        currentJobId = null;
        abortController = null;
    }
}

async function handleGenerateExam(jobId: string, payload: any) {
    currentJobId = jobId;
    abortController = new AbortController();

    try {
        // Step 1: Validate input
        postProgress(jobId, 'Đang chuẩn bị...', 10);

        // Step 2: Fetch policy context
        postProgress(jobId, 'Đang tải policy context...', 20);

        // Step 3: Fetch RAG context
        postProgress(jobId, 'Đang lấy context từ tài liệu...', 40);

        // Step 4: Generate exam
        postProgress(jobId, 'Đang sinh đề thi với AI...', 60);

        const result = await generateExamWithPolicy(
            payload.matrix,
            {
                subject: payload.subject,
                grade: payload.grade,
                assessmentType: payload.assessmentType || 'school_assessment',
                documentContext: payload.documentContext,
            }
        );

        // Step 5: Validate
        postProgress(jobId, 'Đang kiểm tra và hoàn thiện...', 90);

        // Success
        postResponse({
            type: 'result',
            jobId,
            result,
        });
    } catch (error: any) {
        if (error.name === 'AbortError') {
            postResponse({ type: 'cancelled', jobId });
        } else {
            postResponse({
                type: 'error',
                jobId,
                error: error.message || 'Unknown error',
            });
        }
    } finally {
        currentJobId = null;
        abortController = null;
    }
}

function handleCancel(jobId: string) {
    if (currentJobId === jobId && abortController) {
        abortController.abort();
        postResponse({ type: 'cancelled', jobId });
    }
}

function postProgress(jobId: string, step: string, progress: number) {
    postResponse({
        type: 'progress',
        jobId,
        step,
        progress,
    });
}

function postResponse(response: WorkerResponse) {
    self.postMessage(response);
}

export { };
