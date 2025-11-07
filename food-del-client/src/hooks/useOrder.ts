import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/api';
import type { CreateOrderRequest, CancelOrderRequest, OrderQuery } from '@/types';

/**
 * 注文関連カスタムフック
 */

// クエリキー
const ORDER_KEYS = {
        all: ['orders'] as const,
        lists: () => [...ORDER_KEYS.all, 'list'] as const,
        list: (query?: OrderQuery) => [...ORDER_KEYS.lists(), query] as const,
        details: () => [...ORDER_KEYS.all, 'detail'] as const,
        detail: (id: number) => [...ORDER_KEYS.details(), id] as const,
        history: (id: number) => [...ORDER_KEYS.all, 'history', id] as const,
} as const;

// 注文一覧取得フック
export function useOrders(query?: OrderQuery) {
        return useQuery({
                queryKey: ORDER_KEYS.list(query),
                queryFn: async () => {
                        const response = await orderService.getAll(query);
                        return response.data;
                },
                staleTime: 2 * 60 * 1000,
        });
}

// 注文詳細取得フック
export function useOrder(id: number) {
        return useQuery({
                queryKey: ORDER_KEYS.detail(id),
                queryFn: async () => {
                        const response = await orderService.getById(id);
                        return response.data;
                },
                enabled: !!id,
                staleTime: 60 * 1000,
        });
}

// 注文履歴取得フック
export function useOrderHistory(id: number) {
        return useQuery({
                queryKey: ORDER_KEYS.history(id),
                queryFn: async () => {
                        const response = await orderService.getHistory(id);
                        return response.data;
                },
                enabled: !!id,
                staleTime: 5 * 60 * 1000,
        });
}

// 注文操作フック
export function useOrderOperations() {
        const queryClient = useQueryClient();

        // 注文作成
        const createOrder = useMutation({
                mutationFn: (orderData: CreateOrderRequest) => orderService.create(orderData),
                onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.all });
                },
        });

        // 注文キャンセル
        const cancelOrder = useMutation({
                mutationFn: ({ id, data }: { id: number; data?: CancelOrderRequest }) =>
                        orderService.cancel(id, data),
                onSuccess: (_, { id }) => {
                        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.detail(id) });
                        queryClient.invalidateQueries({ queryKey: ORDER_KEYS.lists() });
                },
        });

        return {
                // アクション関数
                createOrder: createOrder.mutateAsync,
                cancelOrder: cancelOrder.mutateAsync,

                // ローディング状態
                isCreatingOrder: createOrder.isPending,
                isCancellingOrder: cancelOrder.isPending,

                // エラー状態
                createOrderError: createOrder.error,
                cancelOrderError: cancelOrder.error,
        };
}
