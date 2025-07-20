'use client'

import {
    createContext,
    useContext,
    useState,
    useEffect
} from 'react';
import {
    login as apiLogin,
    register as apiRegister,
    logout as apiLogout,
    getToken
} from '@/api/authApi';
import { useRouter } from 'next/navigation';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = getToken();
        if (token) {
            setUser({ isLoggedIn: true });
        }
        setLoading(false);
    }, []);

    const login = async (data) => {
        setLoading(true);
        try {
            const response = await apiLogin(data);

            if (response.success) {
                setUser(response.user || { isLoggedIn: true });

                if (response.user && response.user.role === 'admin') {
                    router.push('/');
                } else {
                    console.error("User is not admin or role is missing:", response.user?.role);
                }
            }
            return response;
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            const response = await apiLogout();
            if (response.success) {
                setUser(null);
                router.push('/login');
            }
            return response;
        } finally {
            setLoading(false);
        }
    };

    const register = async (data) => {
        setLoading(true);
        try {
            return await apiRegister(data);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            isLoggedIn: () => !!user,
            loading
        }}>
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