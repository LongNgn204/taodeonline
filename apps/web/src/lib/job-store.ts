// Chú thích: Client Job Store - IndexedDB cho lưu trữ job state
// M1: Cho phép resume, progress tracking, và cancel
// Sử dụng IndexedDB để persist job state ngay cả khi reload page

// ===== Types =====

export type JobStatus = 'pending' | 'running' | 'paused' | 'done' | 'failed' | 'cancelled';

export interface JobState {
    id: string;
    type: 'matrix' | 'exam' | 'lessonplan' | 'skkn';
    status: JobStatus;
    progress: number; // 0-100
    currentStage: string;

    // Input
    input: Record<string, unknown>;
    policyRefs?: string[];

    // Intermediate results
    partialResult?: unknown;
    checkpoint?: unknown;

    // Final result
    result?: unknown;
    error?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;
    completedAt?: string;
}

// ===== IndexedDB Store =====

const DB_NAME = 'TaoDeOnline';
const DB_VERSION = 1;
const STORE_NAME = 'jobs';

let dbInstance: IDBDatabase | null = null;

/**
 * Open IndexedDB
 */
async function openDB(): Promise<IDBDatabase> {
    if (dbInstance) return dbInstance;

    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(request.result);
        };

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;

            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('status', 'status', { unique: false });
                store.createIndex('type', 'type', { unique: false });
                store.createIndex('createdAt', 'createdAt', { unique: false });
            }
        };
    });
}

/**
 * Save job to IndexedDB
 */
export async function saveJob(job: JobState): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(job);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Get job by ID
 */
export async function getJob(id: string): Promise<JobState | undefined> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
    });
}

/**
 * Get all jobs
 */
export async function getAllJobs(): Promise<JobState[]> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result || []);
    });
}

/**
 * Get pending/running jobs
 */
export async function getActiveJobs(): Promise<JobState[]> {
    const all = await getAllJobs();
    return all.filter(j => j.status === 'pending' || j.status === 'running');
}

/**
 * Delete job
 */
export async function deleteJob(id: string): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
    });
}

/**
 * Clean old completed jobs (keep last 20)
 */
export async function cleanOldJobs(): Promise<void> {
    const all = await getAllJobs();
    const completed = all
        .filter(j => j.status === 'done' || j.status === 'failed' || j.status === 'cancelled')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Keep first 20, delete rest
    const toDelete = completed.slice(20);
    for (const job of toDelete) {
        await deleteJob(job.id);
    }
}

// ===== Job Manager =====

/**
 * Create a new job
 */
export function createJob(
    type: JobState['type'],
    input: Record<string, unknown>
): JobState {
    return {
        id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        type,
        status: 'pending',
        progress: 0,
        currentStage: 'Khởi tạo...',
        input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Update job progress
 */
export async function updateJobProgress(
    id: string,
    update: Partial<Pick<JobState, 'progress' | 'currentStage' | 'partialResult' | 'checkpoint'>>
): Promise<void> {
    const job = await getJob(id);
    if (!job) return;

    await saveJob({
        ...job,
        ...update,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Complete job with result
 */
export async function completeJob(id: string, result: unknown): Promise<void> {
    const job = await getJob(id);
    if (!job) return;

    await saveJob({
        ...job,
        status: 'done',
        progress: 100,
        currentStage: 'Hoàn thành',
        result,
        completedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Fail job with error
 */
export async function failJob(id: string, error: string): Promise<void> {
    const job = await getJob(id);
    if (!job) return;

    await saveJob({
        ...job,
        status: 'failed',
        currentStage: 'Lỗi',
        error,
        updatedAt: new Date().toISOString(),
    });
}

/**
 * Cancel job
 */
export async function cancelJob(id: string): Promise<void> {
    const job = await getJob(id);
    if (!job) return;

    await saveJob({
        ...job,
        status: 'cancelled',
        currentStage: 'Đã hủy',
        updatedAt: new Date().toISOString(),
    });
}
