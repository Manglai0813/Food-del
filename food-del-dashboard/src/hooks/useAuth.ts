import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useLogin, useLogout } from '@/api/authApi';
import type { LoginRequest } from '@/types/auth';

/**
 * Dashboard管理者認証Hook
 * - 管理者認証状態の提供
 * - ログイン・ログアウト操作
 * - 管理者権限チェック
 */
export const useAuth = () => {
        const navigate = useNavigate();

        // Store状態とアクション
        const { user, isAuthenticated, isLoading } = useAuthStore();
        const { clearAuth } = useAuthStore();

        // API Hooks
        const loginMutation = useLogin();
        const logoutMutation = useLogout();

        // ログイン処理
        const login = useCallback(async (credentials: LoginRequest) => {
                try {
                        await loginMutation.mutateAsync(credentials);
                        navigate('/');
                } catch (error: unknown) {
                        const err = error as { response?: { data?: { message?: string } } };
                        throw new Error(err.response?.data?.message || 'Login failed');
                }
        }, [loginMutation, navigate]);

        // ログアウト処理
        const logout = useCallback(async () => {
                try {
                        await logoutMutation.mutateAsync();
                } catch {
                        // ログアウト失敗でもローカル状態clear
                }
        }, [logoutMutation]);

        // 強制ログアウト (ネットワークエラーなど)
        const forceLogout = useCallback(() => {
                clearAuth();
                navigate('/login');
        }, [clearAuth, navigate]);

        // 権限チェック
        const hasRole = useCallback((roles: string | string[]) => {
                if (!user) return false;

                const allowedRoles = Array.isArray(roles) ? roles : [roles];
                return allowedRoles.includes(user.role);
        }, [user]);

        // 管理者権限チェック
        const isAdmin = useCallback(() => {
                return hasRole('admin');
        }, [hasRole]);


        return {
                // 状態
                user,
                isAuthenticated,
                isLoading: isLoading || loginMutation.isPending,

                // アクション
                login,
                logout,
                forceLogout,

                // 権限チェック
                hasRole,
                isAdmin,

                // エラー状態
                loginError: loginMutation.error,
        };
};

export default useAuth;