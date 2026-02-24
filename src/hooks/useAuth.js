'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '@/services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = useCallback(() => {
        const currentUser = authService.getCurrentUser();

        if (currentUser) {
            setUser(currentUser);
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (phoneOrEmail, password) => {
        setLoading(true);
        const result = await authService.login(phoneOrEmail, password);

        if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
        }

        setLoading(false);
        return result;
    };

    const register = async (userData) => {
        setLoading(true);
        const result = await authService.register(userData);

        if (result.success) {
            setUser(result.user);
            setIsAuthenticated(true);
        }

        setLoading(false);
        return result;
    };

    const logout = async () => {
        setLoading(true);
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        checkAuth,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export default function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }

    return context;
}