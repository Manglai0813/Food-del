import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/lib/httpClient';
import { queryKeys } from '@/lib/query-client-config';
import { API_ENDPOINTS } from '@/lib/apiConstants';
import type { ApiResponse } from '@/types/auth';
import type {
	Order,
	OrderListItem,
	OrderSearchQuery,
	UpdateOrderStatusRequest,
} from '@/types/order';

/**
 * 注文管理API統合
 * TanStack Query + httpClient統合で注文データ取得・更新
 */

// ページネーション対応レスポンス型
interface PaginatedOrderResponse {
	success: boolean;
	message: string;
	data: OrderListItem[];
	pagination?: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
		hasNext: boolean;
		hasPrev: boolean;
	};
}

/**
 * 注文一覧取得フック（管理者専用）
 */
export const useOrders = (query?: OrderSearchQuery) => {
	return useQuery({
		queryKey: [...queryKeys.orders, query],
		queryFn: async (): Promise<OrderListItem[]> => {
			const response: PaginatedOrderResponse = await httpClient.get(
				API_ENDPOINTS.ORDERS.ADMIN_LIST,
				{ params: query }
			);

			if (!response.success) {
				throw new Error(response.message || '注文一覧の取得に失敗しました');
			}

			return response.data;
		},
		staleTime: 1 * 60 * 1000, // 1分間キャッシュ有効（注文データは頻繁に更新される）
	});
};

/**
 * 注文詳細取得フック（管理者専用）
 */
export const useOrder = (orderId: string | number) => {
	return useQuery({
		queryKey: queryKeys.order(String(orderId)),
		queryFn: async (): Promise<Order> => {
			const response: ApiResponse<Order> = await httpClient.get(
				API_ENDPOINTS.ORDERS.ADMIN_DETAIL(orderId)
			);

			if (!response.success || !response.data) {
				throw new Error(response.message || '注文詳細の取得に失敗しました');
			}

			return response.data;
		},
		enabled: !!orderId, // orderIdが存在する場合のみクエリを実行
		staleTime: 30 * 1000, // 30秒間キャッシュ有効
	});
};

/**
 * 注文ステータス更新Mutation（管理者専用）
 */
export const useUpdateOrderStatus = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			orderId,
			status,
			note,
		}: UpdateOrderStatusRequest & { orderId: number }) => {
			const payload: UpdateOrderStatusRequest = { status };
			if (note) {
				payload.note = note;
			}

			const response: ApiResponse<Order> = await httpClient.put(
				API_ENDPOINTS.ORDERS.UPDATE_STATUS(orderId),
				payload
			);

			if (!response.success || !response.data) {
				throw new Error(response.message || '注文ステータスの更新に失敗しました');
			}

			return response.data;
		},
		onSuccess: (updatedOrder) => {
			// 注文一覧キャッシュを無効化（再フェッチして最新データを取得）
			// queryKeysの接頭辞で無効化するため、すべてのフィルタ条件での キャッシュが再フェッチされる
			queryClient.invalidateQueries({
				queryKey: queryKeys.orders,
				exact: false  // 部分一致で無効化（フィルタ条件を含むすべての注文クエリを対象）
			});

			// 注文詳細キャッシュを更新
			queryClient.setQueryData(
				queryKeys.order(String(updatedOrder.id)),
				updatedOrder
			);

			// Dashboard統計キャッシュも無効化
			queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOrders() });
			queryClient.invalidateQueries({ queryKey: queryKeys.orderStats() });
		},
	});
};
