/**
 * 認証関連カスタムフック
 * TanStack Queryを使用した認証状態管理
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
        const { setAuth, clearAuth } = useAuthStore();
        const token = useAuthStore((state) => state.token);

        // プロフィール取得 - tokenがある場合のみ実行
        const {
                data: user,
                isLoading: isCheckingAuth,
                error: authError,
        } = useQuery({
                queryKey: AUTH_KEYS.profile,
                queryFn: async () => {
                        // queryFn実行時に改めてstoreからtokenを取得してapiClientに設定
                        const currentToken = useAuthStore.getState().token;
                        if (currentToken) {
                                apiClient.setAuthToken(currentToken);
                        }
                        const response = await authService.getProfile();
                        return response.data;
                },
                enabled: !!token, // tokenがある時だけクエリを実行
                staleTime: 5 * 60 * 1000, // 5分間キャッシュ
                retry: false,
        });

        // 認証状態
        const isAuthenticated = !!user;
        const isAdmin = user?.role === 'admin';

        // ログイン
        const loginMutation = useMutation({
                mutationFn: (credentials: LoginRequest) => authService.login(credentials),
                onSuccess: (response) => {
                        if (response.success && response.data) {
                                // Zustand storeに認証情報を保存
                                setAuth({
                                        user: response.data.user,
                                        token: response.data.token,
                                        refreshToken: response.data.refreshToken,
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
                                setAuth({
                                        user: response.data.user,
                                        token: response.data.token,
                                        refreshToken: response.data.refreshToken,
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
        const { setTokens, clearAuth } = useAuthStore();

        // リフレッシュトークンによる自動更新
        const refreshTokenMutation = useMutation({
                mutationFn: (refreshToken: string) => authService.refreshToken({ refreshToken }),
                onSuccess: (response) => {
                        if (response.success && response.data) {
                                // Zustand storeにトークンを保存
                                setTokens({
                                        token: response.data.token,
                                        refreshToken: response.data.refreshToken,
                                });
                                // ユーザー情報を再取得
                                queryClient.invalidateQueries({ queryKey: AUTH_KEYS.profile });
                        }
                },
                onError: () => {
                        // リフレッシュ失敗時はログアウト
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