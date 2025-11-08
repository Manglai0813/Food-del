/**
 * 認証状態管理Store
 *
 * ユーザー認証情報とトークン管理を行うZustandストア。
 * セキュリティ対策により、トークンはメモリのみに保持し、
 * 永続化には使用しない（HttpOnly Cookieはサーバーで自動管理）。
 *
 * 【トークン管理方式】
 * - アクセストークン: HttpOnly Cookie + メモリ（自動同期）
 * - リフレッシュトークン: HttpOnly Cookie（サーバー管理）
 * - ユーザー情報: localStorage にシリアライズして保存
 *
 * 【セキュリティ対策】
 * - トークンを localStorage に保存しない（XSS攻撃対策）
 * - メモリのみで管理し、ページリロード時は再取得
 * - HttpOnly Cookie でトークン保管（JavaScript アクセス不可）
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
        // 状態
        user: User | null;
        token: string | null;           // メモリのみ（リロード時はnullになる）
        isAuthenticated: boolean;
        isLoading: boolean;

        // アクション
        setAuth: (auth: { user: User; token?: string }) => void;
        setUser: (user: User) => void;
        setToken: (token: string | null) => void;
        clearAuth: () => void;
        setLoading: (loading: boolean) => void;
}

/**
 * 認証ストア
 *
 *【注意】
 * refreshToken はこのストアで管理しない
 * - サーバーが HttpOnly Cookie で自動管理
 * - クライアント側から読み取り/操作不可（セキュリティ）
 * - トークン更新は API レスポンスで自動実施
 */
export const useAuthStore = create<AuthState>()(
        persist(
                (set) => ({
                        // 初期状態
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,

                        /**
                         * 認証情報設定
                         *
                         * ログイン成功時に呼び出される。
                         * token はメモリのみに保持される。
                         *
                         * @param auth - ユーザー情報とトークン
                         */
                        setAuth: ({ user, token }) => {
                                set({
                                        user,
                                        token: token || null,
                                        isAuthenticated: true,
                                        isLoading: false,
                                });
                        },

                        /**
                         * ユーザー情報更新
                         *
                         * プロフィール更新時等に使用。
                         *
                         * @param user - 新しいユーザー情報
                         */
                        setUser: (user) => {
                                set({ user });
                        },

                        /**
                         * トークン設定
                         *
                         * トークン更新時に使用。
                         * HttpOnly Cookie によるトークン管理に伴い、
                         * メモリのトークンを同期する。
                         *
                         * @param token - 新しいアクセストークン、またはnull
                         */
                        setToken: (token) => {
                                set({ token });
                        },

                        /**
                         * 認証情報クリア
                         *
                         * ログアウト時に呼び出される。
                         * メモリ上のトークンとユーザー情報をクリア。
                         * HttpOnly Cookie はサーバーが処理。
                         */
                        clearAuth: () => {
                                set({
                                        user: null,
                                        token: null,
                                        isAuthenticated: false,
                                        isLoading: false,
                                });
                        },

                        /**
                         * ローディング状態設定
                         *
                         * 認証処理中かどうかを管理。
                         *
                         * @param isLoading - ローディング状態
                         */
                        setLoading: (isLoading) => {
                                set({ isLoading });
                        },
                }),
                {
                        name: 'auth-storage',
                        // 【セキュリティ】ユーザー情報のみを永続化
                        // トークンは永続化しない（メモリのみ）
                        partialize: (state) => ({
                                user: state.user,
                                isAuthenticated: state.isAuthenticated,
                                // ❌ token を除外（XSS攻撃対策）
                                // ❌ refreshToken を除外（サーバー管理）
                        }),

                        /**
                         * 旧データからの移行処理
                         *
                         * バージョン更新時のデータ互換性を保証する。
                         * accessToken → token への移行をサポート。
                         */
                        migrate: (persistedState: unknown, version: number): AuthState => {
                                if (version === 0 && persistedState) {
                                        // v0 → v1 移行
                                        // accessToken を削除（永続化しない）
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