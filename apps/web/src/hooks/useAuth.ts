// Chú thích: Auth hook để quản lý authentication state

import { useState, useCallback } from 'react';
import { api } from '../lib/api';

interface User {
    id: string;
    email: string;
}

// Simple global state (production nên dùng Context hoặc Zustand)
let globalUser: User | null = null;
let listeners: (() => void)[] = [];

function notifyListeners() {
    listeners.forEach((l) => l());
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(globalUser);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Subscribe to global state changes
    useState(() => {
        const listener = () => setUser(globalUser);
        listeners.push(listener);
        return () => {
            listeners = listeners.filter((l) => l !== listener);
        };
    });

    const checkAuth = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/me');
            if (res.ok) {
                const data = await res.json();
                globalUser = data.user;
                setUser(data.user);
            } else {
                globalUser = null;
                setUser(null);
            }
        } catch {
            globalUser = null;
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            const res = await api.post('/auth/login', { email, password });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Đăng nhập thất bại');
                return false;
            }

            globalUser = data.user;
            setUser(data.user);
            notifyListeners();
            return true;
        } catch (e) {
            setError('Lỗi kết nối server');
            return false;
        }
    }, []);

    const register = useCallback(async (email: string, password: string) => {
        setError(null);
        try {
            const res = await api.post('/auth/register', { email, password });
            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Đăng ký thất bại');
                return false;
            }

            globalUser = data.user;
            setUser(data.user);
            notifyListeners();
            return true;
        } catch (e) {
            setError('Lỗi kết nối server');
            return false;
        }
    }, []);

    const logout = useCallback(async () => {
        try {
            await api.post('/auth/logout');
        } finally {
            globalUser = null;
            setUser(null);
            notifyListeners();
        }
    }, []);

    return {
        user,
        loading,
        error,
        checkAuth,
        login,
        register,
        logout,
    };
}
