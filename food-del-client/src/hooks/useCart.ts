/**
 * ショッピングカート関連カスタムフック
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartService } from '@/api';
import { useCartStore } from '@/stores';
import { useAuthStore } from '@/stores';
import type { AddToCartRequest, UpdateCartItemRequest } from '@/types';

// クエリキー
const CART_KEYS = {
        all: ['cart'] as const,
        cart: () => [...CART_KEYS.all, 'data'] as const,
} as const;

// カート取得フック
export function useCart() {
        const { setCartData } = useCartStore();
        const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

        return useQuery({
                queryKey: CART_KEYS.cart(),
                queryFn: async () => {
                        const response = await cartService.getCart();
                        if (response.success && response.data) {
                                setCartData(response.data);
                        }
                        return response.data;
                },
                enabled: isAuthenticated, // ログイン時のみカートを取得
                staleTime: 5 * 1000, // 5秒間はキャッシュを使用
                refetchOnMount: false, // マウント時の自動再取得を無効化
                refetchOnWindowFocus: false, // フォーカス時の自動再取得を無効化
                retry: false, // 401エラー時にリトライしない
        });
}

// カート操作フック
export function useCartOperations() {
        const queryClient = useQueryClient();

        // カートアイテム追加
        const addItem = useMutation({
                mutationFn: (itemData: AddToCartRequest) => cartService.addItem(itemData),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
                },
        });

        // カートアイテム更新
        const updateItem = useMutation({
                mutationFn: ({ itemId, data }: { itemId: number; data: UpdateCartItemRequest }) =>
                        cartService.updateItem(itemId, data),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
                },
        });

        // カートアイテム削除
        const removeItem = useMutation({
                mutationFn: (itemId: number) => cartService.removeItem(itemId),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: CART_KEYS.all });
                },
        });

        // カート全体クリア
        const clearCart = useMutation({
                mutationFn: () => cartService.clearCart(),
                onSuccess: () => {
                        queryClient.removeQueries({ queryKey: CART_KEYS.all });
                },
        });

        // チェックアウト
        const checkout = useMutation({
                mutationFn: (orderData: { delivery_address: string; phone: string; notes?: string }) =>
                        cartService.checkout(orderData),
                onSuccess: () => {
                        queryClient.removeQueries({ queryKey: CART_KEYS.all });
                },
        });

        return {
                // アクション関数
                addItem: addItem.mutateAsync,
                updateItem: updateItem.mutateAsync,
                removeItem: removeItem.mutateAsync,
                clearCart: clearCart.mutateAsync,
                checkout: checkout.mutateAsync,

                // ローディング状態
                isAddingItem: addItem.isPending,
                isUpdatingItem: updateItem.isPending,
                isRemovingItem: removeItem.isPending,
                isClearingCart: clearCart.isPending,
                isCheckingOut: checkout.isPending,

                // エラー状態
                addItemError: addItem.error,
                updateItemError: updateItem.error,
                removeItemError: removeItem.error,
                clearCartError: clearCart.error,
                checkoutError: checkout.error,
        };
}
