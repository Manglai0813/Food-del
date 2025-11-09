import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { authService, apiClient } from '@/api';
import { useAuthStore, useCartStore } from '@/stores';
import type {
    LoginRequest,
    RegisterRequest,
    UpdateProfileRequest,
    ChangePasswordRequest,
} from '@/types';

// クエリキー
const AUTH_KEYS = {
    profile: ['auth', 'profile'] as const,
    checkAuth: ['auth', 'check'] as const,
} as const;

// 認証状態フック
export function useAuth() {
    const queryClient = useQueryClient();
    const { setAuth, clearAuth, user: persistedUser, setUser } = useAuthStore();
    const token = useAuthStore((state) => state.token);
    const hasCheckedAuthRef = useRef(false);

    // プロフィール取得クエリ
    const {
        data: user,
        isLoading: isCheckingAuth,
        error: authError,
    } = useQuery({
        queryKey: AUTH_KEYS.profile,
        queryFn: async () => {
            const currentToken = useAuthStore.getState().token;
            if (currentToken) {
                apiClient.setAuthToken(currentToken);
            } else {
                apiClient.setAuthToken(null);
            }
            const response = await authService.getProfile();

            if (response.success && response.data) {
                const newToken = (response as unknown as { data?: { token?: string } }).data?.token;
                if (newToken) {
                    useAuthStore.getState().setToken(newToken);
                }
                setUser(response.data);
            }

            return response.data;
        },
        enabled: !hasCheckedAuthRef.current && (!!persistedUser || !!token),
        staleTime: 5 * 60 * 1000,
        retry: false,
    });

    // 認証チェック完了後にフラグを設定
    useEffect(() => {
        if (!isCheckingAuth && (user || authError)) {
            hasCheckedAuthRef.current = true;
            if (authError) {
                clearAuth();
            }
        }
    }, [isCheckingAuth, user, authError, clearAuth]);

    // 認証状態
    const isAuthenticated = !!user;
    const isAdmin = user?.role === 'admin';

    // ログイン
    const loginMutation = useMutation({
        mutationFn: (credentials: LoginRequest) => authService.login(credentials),
        onSuccess: (response) => {
            if (response.success && response.data) {
                // Zustand storeに認証情報を保存
                // 【注意】refreshTokenはサーバーがHttpOnly Cookieで自動管理
                setAuth({
                    user: response.data.user,
                    token: response.data.token,
                });
                // プロフィールキャッシュを更新
                queryClient.setQueryData(AUTH_KEYS.profile, response.data.user);
                // 他のクエリを無効化（ユーザー固有データの再取得）
                queryClient.invalidateQueries({ queryKey: ['user-data'] });
            }
        },
        onError: () => {
            // エラー時は認証情報をクリア
            clearAuth();
            queryClient.removeQueries({ queryKey: AUTH_KEYS.profile });
        },
    });

    // 登録
    const registerMutation = useMutation({
        mutationFn: (userData: RegisterRequest) => authService.register(userData),
        onSuccess: (response) => {
            if (response.success && response.data) {
                // Zustand storeに認証情報を保存
                // 【注意】refreshTokenはサーバーがHttpOnly Cookieで自動管理
                setAuth({
                    user: response.data.user,
                    token: response.data.token,
                });
                // プロフィールキャッシュを設定
                queryClient.setQueryData(AUTH_KEYS.profile, response.data.user);
                queryClient.invalidateQueries({ queryKey: ['user-data'] });
            }
        },
        onError: () => {
            // エラー時は認証情報をクリア
            clearAuth();
        },
    });

    // ログアウト
    const logoutMutation = useMutation({
        mutationFn: () => authService.logout(),
        onSettled: () => {
            // 成功・失敗に関わらず認証情報をクリア
            clearAuth();
            // カートデータもクリア
            useCartStore.getState().clearCart();
            // 全てのクエリキャッシュをクリア
            queryClient.clear();
        },
    });

    // プロフィール更新
    const updateProfileMutation = useMutation({
        mutationFn: (profileData: UpdateProfileRequest) => authService.updateProfile(profileData),
        onSuccess: (response) => {
            if (response.success && response.data) {
                // プロフィールキャッシュを更新
                queryClient.setQueryData(AUTH_KEYS.profile, response.data);
            }
        },
    });

    // パスワード変更
    const changePasswordMutation = useMutation({
        mutationFn: (passwordData: ChangePasswordRequest) => authService.changePassword(passwordData),
    });

    return {
        // 状態
        user,
        isAuthenticated,
        isAdmin,
        isCheckingAuth,
        authError,

        // アクション
        login: loginMutation.mutateAsync,
        register: registerMutation.mutateAsync,
        logout: logoutMutation.mutateAsync,
        updateProfile: updateProfileMutation.mutateAsync,
        changePassword: changePasswordMutation.mutateAsync,

        // ローディング状態
        isLoggingIn: loginMutation.isPending,
        isRegistering: registerMutation.isPending,
        isLoggingOut: logoutMutation.isPending,
        isUpdatingProfile: updateProfileMutation.isPending,
        isChangingPassword: changePasswordMutation.isPending,

        // エラー状態
        loginError: loginMutation.error,
        registerError: registerMutation.error,
        logoutError: logoutMutation.error,
        updateProfileError: updateProfileMutation.error,
        changePasswordError: changePasswordMutation.error,
    };
}

// トークン管理フック
export function useToken() {
    const queryClient = useQueryClient();
    const { setToken, clearAuth } = useAuthStore();

    // トークン更新
    const refreshTokenMutation = useMutation({
        mutationFn: (refreshToken: string) => authService.refreshToken({ refreshToken }),
        onSuccess: (response) => {
            if (response.success && response.data) {
                setToken(response.data.token);
                queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
            }
        },
        onError: () => {
            // トークン更新失敗時はログアウト
            clearAuth();
            queryClient.clear();
        },
    });

    return {
        refreshToken: refreshTokenMutation.mutateAsync,
        isRefreshing: refreshTokenMutation.isPending,
        refreshError: refreshTokenMutation.error,
    };
}

// 認証ガードフック
export function useRequireAuth() {
    const { isAuthenticated, isCheckingAuth } = useAuth();

    return {
        isAuthenticated,
        isCheckingAuth,
        shouldShowLogin: !isCheckingAuth && !isAuthenticated,
    };
}

// 管理者権限フック
export function useRequireAdmin() {
    const { isAdmin, isCheckingAuth, isAuthenticated } = useAuth();

    return {
        isAdmin,
        isCheckingAuth,
        hasAccess: isAuthenticated && isAdmin,
        shouldShowAccessDenied: !isCheckingAuth && (!isAuthenticated || !isAdmin),
    };
}