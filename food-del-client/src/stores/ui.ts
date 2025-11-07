/**
 * UI状態管理Store
 * モーダル、ローディング、通知などのUI状態
 */

import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
        id: string;
        type: ToastType;
        title: string;
        message?: string;
        duration?: number;
        action?: {
                label: string;
                onClick: () => void;
        };
}

export interface Modal {
        id: string;
        component: React.ComponentType<any>;
        props?: Record<string, any>;
        onClose?: () => void;
}

interface UIState {
        // ローディング状態
        isLoading: boolean;
        loadingMessage?: string;

        // サイドバー状態
        isSidebarOpen: boolean;

        // モーダル状態
        modals: Modal[];

        // トースト通知
        toasts: Toast[];

        // 検索状態
        searchQuery: string;
        isSearchFocused: boolean;

        // フィルター状態
        activeFilters: Record<string, any>;

        // アクション
        setLoading: (loading: boolean, message?: string) => void;
        toggleSidebar: () => void;
        openSidebar: () => void;
        closeSidebar: () => void;

        // モーダル管理
        openModal: (modal: Omit<Modal, 'id'>) => string;
        closeModal: (id: string) => void;
        closeAllModals: () => void;

        // トースト管理
        addToast: (toast: Omit<Toast, 'id'>) => string;
        removeToast: (id: string) => void;
        clearToasts: () => void;

        // 検索管理
        setSearchQuery: (query: string) => void;
        setSearchFocus: (focused: boolean) => void;
        clearSearch: () => void;

        // フィルター管理
        setFilter: (key: string, value: any) => void;
        removeFilter: (key: string) => void;
        clearFilters: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
        // 初期状態
        isLoading: false,
        loadingMessage: undefined,
        isSidebarOpen: false,
        modals: [],
        toasts: [],
        searchQuery: '',
        isSearchFocused: false,
        activeFilters: {},

        // ローディング状態管理
        setLoading: (loading, message) => {
                set({ isLoading: loading, loadingMessage: message });
        },

        // サイドバー管理
        toggleSidebar: () => {
                set(state => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        openSidebar: () => {
                set({ isSidebarOpen: true });
        },

        closeSidebar: () => {
                set({ isSidebarOpen: false });
        },

        // モーダル管理
        openModal: (modal) => {
                const id = `modal-${Date.now()}-${Math.random()}`;
                const newModal = { ...modal, id };

                set(state => ({
                        modals: [...state.modals, newModal]
                }));

                return id;
        },

        closeModal: (id) => {
                const state = get();
                const modal = state.modals.find(m => m.id === id);

                if (modal?.onClose) {
                        modal.onClose();
                }

                set(state => ({
                        modals: state.modals.filter(m => m.id !== id)
                }));
        },

        closeAllModals: () => {
                const state = get();

                // すべてのモーダルのonCloseを実行
                state.modals.forEach(modal => {
                        if (modal.onClose) {
                                modal.onClose();
                        }
                });

                set({ modals: [] });
        },

        // トースト管理
        addToast: (toast) => {
                const id = `toast-${Date.now()}-${Math.random()}`;
                const newToast = { ...toast, id };

                set(state => ({
                        toasts: [...state.toasts, newToast]
                }));

                // 自動削除タイマー
                const duration = toast.duration || 5000;
                setTimeout(() => {
                        get().removeToast(id);
                }, duration);

                return id;
        },

        removeToast: (id) => {
                set(state => ({
                        toasts: state.toasts.filter(t => t.id !== id)
                }));
        },

        clearToasts: () => {
                set({ toasts: [] });
        },

        // 検索管理
        setSearchQuery: (query) => {
                set({ searchQuery: query });
        },

        setSearchFocus: (focused) => {
                set({ isSearchFocused: focused });
        },

        clearSearch: () => {
                set({ searchQuery: '', isSearchFocused: false });
        },

        // フィルター管理
        setFilter: (key, value) => {
                set(state => ({
                        activeFilters: {
                                ...state.activeFilters,
                                [key]: value
                        }
                }));
        },

        removeFilter: (key) => {
                set(state => {
                        const { [key]: _, ...rest } = state.activeFilters;
                        return { activeFilters: rest };
                });
        },

        clearFilters: () => {
                set({ activeFilters: {} });
        },
}));

// セレクター関数
export const selectIsLoading = (state: UIState) => state.isLoading;
export const selectLoadingMessage = (state: UIState) => state.loadingMessage;
export const selectIsSidebarOpen = (state: UIState) => state.isSidebarOpen;
export const selectModals = (state: UIState) => state.modals;
export const selectToasts = (state: UIState) => state.toasts;
export const selectSearchQuery = (state: UIState) => state.searchQuery;
export const selectActiveFilters = (state: UIState) => state.activeFilters;
export const selectHasActiveFilters = (state: UIState) => Object.keys(state.activeFilters).length > 0;