import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartData } from '@/types';

// ローカルカートアイテム型
interface LocalCartItem {
    food_id: number;
    quantity: number;
    tempId: string;
}

interface CartState {
    // サーバー同期データ
    cartData: CartData | null;

    // ローカル状態
    localItems: LocalCartItem[];
    isOpen: boolean;
    lastUpdated: number;
    isSyncing: boolean;

    // アクション
    setCartData: (data: CartData) => void;
    clearCart: () => void;
    addLocalItem: (food_id: number, quantity: number) => void;
    updateLocalItem: (tempId: string, quantity: number) => void;
    removeLocalItem: (tempId: string) => void;
    clearLocalItems: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;
    setSyncing: (syncing: boolean) => void;
}

// カートストア
export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            // 初期状態
            cartData: null,
            localItems: [],
            isOpen: false,
            lastUpdated: Date.now(),
            isSyncing: false,

            // サーバーカートデータ設定
            setCartData: (data) => {
                set({
                    cartData: data,
                    lastUpdated: Date.now(),
                });
            },

            // カート全体クリア
            clearCart: () => {
                set({
                    cartData: null,
                    localItems: [],
                    lastUpdated: Date.now(),
                });
            },

            // ローカルアイテム追加
            addLocalItem: (food_id, quantity) => {
                const state = get();
                const existingItemIndex = state.localItems.findIndex(
                    item => item.food_id === food_id
                );

                let updatedItems: LocalCartItem[];

                if (existingItemIndex >= 0) {
                    updatedItems = state.localItems.map((item, index) =>
                        index === existingItemIndex
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    const newItem: LocalCartItem = {
                        food_id,
                        quantity,
                        tempId: `temp-${Date.now()}-${Math.random()}`,
                    };
                    updatedItems = [...state.localItems, newItem];
                }

                set({
                    localItems: updatedItems,
                    lastUpdated: Date.now(),
                });
            },

            // ローカルアイテム更新
            updateLocalItem: (tempId, quantity) => {
                const state = get();
                const updatedItems = state.localItems.map(item =>
                    item.tempId === tempId ? { ...item, quantity } : item
                );

                set({
                    localItems: updatedItems,
                    lastUpdated: Date.now(),
                });
            },

            // ローカルアイテム削除
            removeLocalItem: (tempId) => {
                const state = get();
                const updatedItems = state.localItems.filter(item => item.tempId !== tempId);

                set({
                    localItems: updatedItems,
                    lastUpdated: Date.now(),
                });
            },

            // ローカルアイテムクリア
            clearLocalItems: () => {
                set({
                    localItems: [],
                    lastUpdated: Date.now(),
                });
            },

            // カートドロワー開閉
            toggleCart: () => {
                set(state => ({ isOpen: !state.isOpen }));
            },

            openCart: () => {
                set({ isOpen: true });
            },

            closeCart: () => {
                set({ isOpen: false });
            },

            // 同期状態設定
            setSyncing: (isSyncing) => {
                set({ isSyncing });
            },
        }),
        {
            name: 'cart-storage',
            partialize: (state) => ({
                localItems: state.localItems,
                lastUpdated: state.lastUpdated,
            }),
        }
    )
);

// セレクター
export const selectCartItemCount = (state: CartState) =>
    state.cartData?.summary.totalItems || state.localItems.reduce((sum, item) => sum + item.quantity, 0);

// 合計金額セレクター
export const selectCartTotal = (state: CartState) =>
    state.cartData?.summary.totalAmount || 0;

// カートが空かどうかのセレクター
export const selectCartIsEmpty = (state: CartState) =>
    !state.cartData?.cart_items.length && !state.localItems.length;

// カート内アイテムセレクター
export const selectCartItems = (state: CartState) =>
    state.cartData?.cart_items || [];

// ローカルアイテムセレクター
export const selectLocalItems = (state: CartState) =>
    state.localItems;