/**
 * 認証状態管理Store
 * ユーザー認証情報とトークン管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
        // 状態
        user: User | null;
        token: string | null;
        refreshToken: string | null;
        isAuthenticated: boolean;
        isLoading: boolean;

        // アクション
        setAuth: (auth: { user: User; token: string; refreshToken?: string }) => void;
        setUser: (user: User) => void;
        setTokens: (tokens: { token: string; refreshToken?: string }) => void;
        clearAuth: () => void;
        setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
        persist(
                (set) => ({
                        // 初期状態
                        user: null,
                        token: null,
                        refreshToken: null,
                        isAuthenticated: false,
                        isLoading: false,

                        // 認証情報設定
                        setAuth: ({ user, token, refreshToken }) => {
                                set({
                                        user,
                                        token,
                                        refreshToken,
                                        isAuthenticated: true,
                                        isLoading: false,
                                });
                        },

                        // ユーザー情報更新
                        setUser: (user) => {
                                set({ user });
                        },

                        // トークン更新
                        setTokens: ({ token, refreshToken }) => {
                                set({ token, refreshToken });
                        },

                        // 認証情報クリア
                        clearAuth: () => {
                                set({
                                        user: null,
                                        token: null,
                                        refreshToken: null,
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
                        name: 'auth-storage', // localStorage キー
                        partialize: (state) => ({
                                // persistする項目を指定
                                token: state.token,
                                refreshToken: state.refreshToken,
                                user: state.user,
                                isAuthenticated: state.isAuthenticated,
                        }),
                        // 旧データからの移行処理
                        migrate: (persistedState: any) => {
                                // accessToken から token への移行
                                if (persistedState && persistedState.accessToken && !persistedState.token) {
                                        return {
                                                ...persistedState,
                                                token: persistedState.accessToken,
                                                accessToken: undefined,
                                        };
                                }
                                return persistedState;
                        },
                        version: 1, // バージョン管理
                }
        )
);

// セレクター関数
export const selectIsAdmin = (state: AuthState) => state.user?.role === 'admin';
export const selectUserId = (state: AuthState) => state.user?.id;
export const selectUserEmail = (state: AuthState) => state.user?.email;