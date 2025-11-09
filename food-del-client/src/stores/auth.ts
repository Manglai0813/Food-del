import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
    // 状態
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // アクション
    setAuth: (auth: { user: User; token?: string }) => void;
    setUser: (user: User) => void;
    setToken: (token: string | null) => void;
    clearAuth: () => void;
    setLoading: (loading: boolean) => void;
}

// 認証ストア
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // 初期状態
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,

            // 認証情報設定
            setAuth: ({ user, token }) => {
                set({
                    user,
                    token: token || null,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            // ユーザー情報更新
            setUser: (user) => {
                set({ user });
            },

            // トークン設定
            setToken: (token) => {
                set({ token });
            },

            // 認証情報クリア
            clearAuth: () => {
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            },

            // ローディング状態設定
            setLoading: (isLoading) => {
                set({ isLoading });
            },
        }),
        {
            name: 'auth-storage',
            // 認証情報をlocalStorageに永続化
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),

            // 旧データからの移行処理
            migrate: (persistedState: unknown, version: number): AuthState => {
                if (version === 0 && persistedState) {
                    // v0からv1への移行処理
                    const state = persistedState as Record<string, unknown>;
                    return {
                        ...state,
                        token: null,
                        isAuthenticated: state.isAuthenticated as boolean ?? false,
                        isLoading: state.isLoading as boolean ?? false,
                        user: state.user ?? null,
                    } as AuthState;
                }
                return persistedState as AuthState;
            },

            version: 1,
        }
    )
);

// セレクター関数
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectUserId = (state: AuthState) => state.user?.id;
export const selectUserEmail = (state: AuthState) => state.user?.email;