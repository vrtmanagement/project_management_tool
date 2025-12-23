'use client'
import { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const normalizeUser = (userData) => {
        if (!userData) return null;
        return {
            ...userData,
            role: userData.role || 'member',
        };
    };

    const persistUser = (userData) => {
        if (!userData) {
            localStorage.removeItem('user');
            setUser(null);
            return;
        }

        const normalizedUser = normalizeUser(userData);

        setUser(normalizedUser);
        localStorage.setItem('user', JSON.stringify(normalizedUser));
    };

    // Check if user is already logged in on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const parsedUser = JSON.parse(storedUser);
                const normalizedUser = normalizeUser(parsedUser);
                if (normalizedUser) {
                    setUser(normalizedUser);
                    localStorage.setItem('user', JSON.stringify(normalizedUser));
                }
            } catch {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });

            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                persistUser(response.data.user);
                router.push('/dashboard');
                return { success: true };
            } else {
                return { success: false, error: response.data.error };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Network error' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        router.push('/login');
    };

    const register = async (name, email, password) => {
        try {
            const response = await axios.post('/api/auth/register', { name, email, password });
            if (response.data.success) {
                return { success: true };
            } else {
                return { success: false, error: response.data.error };
            }
        } catch (error) {
            return { 
                success: false, 
                error: error.response?.data?.error || 'Network error' 
            };
        }
    };

    const isAdmin = user?.role === 'admin';

    return (
        <AuthContext.Provider value={{ user, isAdmin, login, loading, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to use the AuthContext
export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}