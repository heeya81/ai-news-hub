'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type User = {
    id: string;
    email: string;
};

type AuthContextType = {
    user: User | null;
    loading: boolean;
    login: (accessToken: string, refreshToken: string, user: User) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const token = localStorage.getItem('ainews_token');
        const savedUser = localStorage.getItem('ainews_user');

        if (token && savedUser) {
            setUser(JSON.parse(savedUser));
        } else if (!['/', '/auth'].includes(pathname)) {
            router.push('/auth');
        }

        setLoading(false);
    }, [pathname, router]);

    const login = (accessToken: string, refreshToken: string, userData: User) => {
        localStorage.setItem('ainews_token', accessToken);
        localStorage.setItem('ainews_refresh_token', refreshToken);
        localStorage.setItem('ainews_user', JSON.stringify(userData));
        setUser(userData);
        router.push('/dashboard');
    };

    const logout = () => {
        localStorage.removeItem('ainews_token');
        localStorage.removeItem('ainews_refresh_token');
        localStorage.removeItem('ainews_user');
        setUser(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
