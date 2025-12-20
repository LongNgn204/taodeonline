declare class ApiClient {
    private baseUrl;
    constructor(baseUrl: string);
    private request;
    get(path: string): Promise<Response>;
    post(path: string, body?: unknown): Promise<Response>;
    put(path: string, body?: unknown): Promise<Response>;
    delete(path: string): Promise<Response>;
    uploadFile(path: string, file: ArrayBuffer): Promise<Response>;
}
export declare const api: ApiClient;
export {};
//# sourceMappingURL=api.d.ts.map