import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/api';

interface AuthProviderProps {
    children: ReactNode;
}

// 認証プロバイダーコンポーネント
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const token = useAuthStore((state) => state.token);

    // アプリケーション起動時・トークン変更時にapiClientにトークンを設定
    useEffect(() => {
        if (token) {
            apiClient.setAuthToken(token);
        } else {
            apiClient.setAuthToken(null);
        }
    }, [token]);

    return <>{children}</>;
};