// Chú thích: Hook để sử dụng AI Worker
// Quản lý Web Worker cho AI generation

import { useCallback, useRef, useState, useEffect } from 'react';
import type { WorkerMessage, WorkerResponse } from '../workers/ai-worker';

interface UseAiWorkerOptions {
    onProgress?: (step: string, progress: number) => void;
    onResult?: (result: any) => void;
    onError?: (error: string) => void;
}

interface JobState {
    jobId: string;
    status: 'idle' | 'running' | 'completed' | 'error' | 'cancelled';
    progress: number;
    step: string;
    result?: any;
    error?: string;
}

export function useAiWorker(options: UseAiWorkerOptions = {}) {
    const workerRef = useRef<Worker | null>(null);
    const [job, setJob] = useState<JobState>({
        jobId: '',
        status: 'idle',
        progress: 0,
        step: '',
    });

    // Initialize worker
    useEffect(() => {
        // Worker sẽ được lazy load khi cần
        return () => {
            if (workerRef.current) {
                workerRef.current.terminate();
                workerRef.current = null;
            }
        };
    }, []);

    const getWorker = useCallback(() => {
        if (!workerRef.current) {
            // Lazy load worker
            workerRef.current = new Worker(
                new URL('../workers/ai-worker.ts', import.meta.url),
                { type: 'module' }
            );

            workerRef.current.onmessage = (event: MessageEvent<WorkerResponse>) => {
                const { type, step, progress, result, error } = event.data;

                switch (type) {
                    case 'progress':
                        setJob(prev => ({
                            ...prev,
                            progress: progress || prev.progress,
                            step: step || prev.step,
                        }));
                        if (step && progress !== undefined) {
                            options.onProgress?.(step, progress);
                        }
                        break;

                    case 'result':
                        setJob(prev => ({
                            ...prev,
                            status: 'completed',
                            progress: 100,
                            result,
                        }));
                        options.onResult?.(result);
                        break;

                    case 'error':
                        setJob(prev => ({
                            ...prev,
                            status: 'error',
                            error,
                        }));
                        options.onError?.(error || 'Unknown error');
                        break;

                    case 'cancelled':
                        setJob(prev => ({
                            ...prev,
                            status: 'cancelled',
                        }));
                        break;
                }
            };

            workerRef.current.onerror = (error) => {
                console.error('[AI Worker] Error:', error);
                setJob(prev => ({
                    ...prev,
                    status: 'error',
                    error: error.message,
                }));
                options.onError?.(error.message);
            };
        }
        return workerRef.current;
    }, [options]);

    const generateMatrix = useCallback((payload: {
        grade: number;
        subject: string;
        assessmentType?: string;
        numTopics?: number;
        documentContext?: string;
    }) => {
        const jobId = `matrix-${Date.now()}`;
        const worker = getWorker();

        setJob({
            jobId,
            status: 'running',
            progress: 0,
            step: 'Khởi tạo...',
        });

        worker.postMessage({
            type: 'generate_matrix',
            jobId,
            payload,
        } as WorkerMessage);

        return jobId;
    }, [getWorker]);

    const generateExam = useCallback((payload: {
        matrix: any;
        subject: string;
        grade: number;
        assessmentType?: string;
        documentContext?: string;
    }) => {
        const jobId = `exam-${Date.now()}`;
        const worker = getWorker();

        setJob({
            jobId,
            status: 'running',
            progress: 0,
            step: 'Khởi tạo...',
        });

        worker.postMessage({
            type: 'generate_exam',
            jobId,
            payload,
        } as WorkerMessage);

        return jobId;
    }, [getWorker]);

    const cancel = useCallback(() => {
        if (job.jobId && job.status === 'running' && workerRef.current) {
            workerRef.current.postMessage({
                type: 'cancel',
                jobId: job.jobId,
            } as WorkerMessage);
        }
    }, [job.jobId, job.status]);

    const reset = useCallback(() => {
        setJob({
            jobId: '',
            status: 'idle',
            progress: 0,
            step: '',
        });
    }, []);

    return {
        job,
        generateMatrix,
        generateExam,
        cancel,
        reset,
        isRunning: job.status === 'running',
        isCompleted: job.status === 'completed',
        isError: job.status === 'error',
    };
}
