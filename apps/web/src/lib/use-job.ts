// Chú thích: React Hook cho Job Manager
// M1: useJob hook với progress tracking và cancellation

import { useState, useCallback, useRef, useEffect } from 'react';
import {
    JobState,
    createJob,
    saveJob,
    getJob,
    updateJobProgress,
    completeJob,
    failJob,
    cancelJob as cancelJobStore,
} from './job-store';

// ===== Types =====

export interface UseJobOptions<TInput, TResult> {
    type: JobState['type'];
    execute: (
        input: TInput,
        callbacks: {
            onProgress: (progress: number, stage: string) => void;
            onCheckpoint: (checkpoint: unknown) => void;
            signal: AbortSignal;
        }
    ) => Promise<TResult>;
}

export interface UseJobReturn<TInput, TResult> {
    // State
    job: JobState | null;
    isRunning: boolean;
    progress: number;
    stage: string;
    error: string | null;
    result: TResult | null;

    // Actions
    start: (input: TInput) => Promise<void>;
    cancel: () => void;
    reset: () => void;
}

// ===== Hook =====

export function useJob<TInput extends Record<string, unknown>, TResult>(
    options: UseJobOptions<TInput, TResult>
): UseJobReturn<TInput, TResult> {
    const { type, execute } = options;

    const [job, setJob] = useState<JobState | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [stage, setStage] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<TResult | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);
    const jobIdRef = useRef<string | null>(null);

    // Progress callback
    const handleProgress = useCallback((newProgress: number, newStage: string) => {
        setProgress(newProgress);
        setStage(newStage);

        if (jobIdRef.current) {
            updateJobProgress(jobIdRef.current, {
                progress: newProgress,
                currentStage: newStage,
            }).catch(console.error);
        }
    }, []);

    // Checkpoint callback
    const handleCheckpoint = useCallback((checkpoint: unknown) => {
        if (jobIdRef.current) {
            updateJobProgress(jobIdRef.current, { checkpoint }).catch(console.error);
        }
    }, []);

    // Start job
    const start = useCallback(async (input: TInput) => {
        // Cancel any existing job
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Reset state
        setError(null);
        setResult(null);
        setProgress(0);
        setStage('Bắt đầu...');
        setIsRunning(true);

        // Create new job
        const newJob = createJob(type, input);
        newJob.status = 'running';
        await saveJob(newJob);
        setJob(newJob);
        jobIdRef.current = newJob.id;

        // Create abort controller
        abortControllerRef.current = new AbortController();

        try {
            console.info('[useJob] Starting', { jobId: newJob.id, type });

            const jobResult = await execute(input, {
                onProgress: handleProgress,
                onCheckpoint: handleCheckpoint,
                signal: abortControllerRef.current.signal,
            });

            // Success
            setResult(jobResult);
            setProgress(100);
            setStage('Hoàn thành');
            await completeJob(newJob.id, jobResult);

            console.info('[useJob] Completed', { jobId: newJob.id });
        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                // Cancelled
                setStage('Đã hủy');
                await cancelJobStore(newJob.id);
                console.info('[useJob] Cancelled', { jobId: newJob.id });
            } else {
                // Error
                const errMsg = err instanceof Error ? err.message : 'Lỗi không xác định';
                setError(errMsg);
                setStage('Lỗi');
                await failJob(newJob.id, errMsg);
                console.error('[useJob] Failed', { jobId: newJob.id, error: errMsg });
            }
        } finally {
            setIsRunning(false);
            abortControllerRef.current = null;
        }
    }, [type, execute, handleProgress, handleCheckpoint]);

    // Cancel job
    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
    }, []);

    // Reset state
    const reset = useCallback(() => {
        setJob(null);
        setProgress(0);
        setStage('');
        setError(null);
        setResult(null);
        jobIdRef.current = null;
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, []);

    return {
        job,
        isRunning,
        progress,
        stage,
        error,
        result,
        start,
        cancel,
        reset,
    };
}

// ===== Example Usage =====
/*
const { isRunning, progress, stage, error, result, start, cancel } = useJob({
    type: 'matrix',
    execute: async (input, { onProgress, signal }) => {
        onProgress(10, 'Đang tải policy context...');
        const policyContext = await fetchPolicyContext('matrix', input);
        
        if (signal.aborted) throw new DOMException('Cancelled', 'AbortError');
        
        onProgress(30, 'Đang gọi AI...');
        const result = await generateMatrixWithPolicy({
            ...input,
            // AI call with abort signal handling
        });
        
        onProgress(100, 'Hoàn thành');
        return result;
    },
});

// In component:
<button onClick={() => start({ subject: 'Toán', grade: 10 })} disabled={isRunning}>
    Generate
</button>
<button onClick={cancel} disabled={!isRunning}>
    Cancel
</button>
<ProgressBar value={progress} label={stage} />
{error && <Alert>{error}</Alert>}
*/
