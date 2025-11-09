import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, LoginResponse } from '@/types/auth';

// Zustand Storeの状態定義
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (data: LoginResponse) => void;
    setUser: (user: User) => void;
    setLoading: (loading: boolean) => void;
    clearAuth: () => void;
    updateToken: (token: string) => void;
}

// 初期状態
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
};

// 認証状態管理Store
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            ...initialState,

            // ログイン成功時の状態設定
            setAuth: (data: LoginResponse) => {
                set({
                    user: data.user,
                    token: data.token,
                    isAuthenticated: true,
                    isLoading: false,
                });
            },

            // ユーザー情報更新
            setUser: (user: User) => {
                set({ user });
            },

            // ローディング状態設定
            setLoading: (isLoading: boolean) => {
                set({ isLoading });
            },

            // ログアウト処理
            clearAuth: () => {
                set(initialState);
            },

            // Token更新
            updateToken: (token: string) => {
                set({ token });
            },

        }),
        {
            name: 'food-del-auth',
            storage: createJSONStorage(() => localStorage),

            // トークン情報のみ永続化
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),

            // 復元時の処理
            onRehydrateStorage: () => (state) => {
                if (!state?.token || !state?.user) {
                    state?.clearAuth();
                }
            },
        }
    )
);

// 認証状態取得用のselector関数
export const useAuth = () => {
    const state = useAuthStore();
    return {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
    };
};

// 認証操作用のselector関数
export const useAuthActions = () => {
    const state = useAuthStore();
    return {
        setAuth: state.setAuth,
        setUser: state.setUser,
        setLoading: state.setLoading,
        clearAuth: state.clearAuth,
        updateToken: state.updateToken,
    };
};