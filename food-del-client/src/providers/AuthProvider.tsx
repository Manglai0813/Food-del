/**
 * 認証プロバイダーコンポーネント
 * アプリケーション起動時にlocalStorageからトークンを復元
 */

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores';
import { apiClient } from '@/api';

interface AuthProviderProps {
        children: ReactNode;
}

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
