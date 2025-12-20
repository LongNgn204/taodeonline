interface User {
    id: string;
    email: string;
}
export declare function useAuth(): {
    user: User | null;
    loading: boolean;
    error: string | null;
    checkAuth: () => Promise<void>;
    login: (email: string, password: string) => Promise<boolean>;
    register: (email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
};
export {};
//# sourceMappingURL=useAuth.d.ts.map