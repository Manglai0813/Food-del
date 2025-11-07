/**
 * 注文関連API サービス
 */

import { apiClient } from './client';
import type {
        OrderData,
        CreateOrderRequest,
        CancelOrderRequest,
        OrderQuery,
        ApiResponse,
} from '@/types';

export class OrderService {
        // 注文作成
        async create(orderData: CreateOrderRequest): Promise<ApiResponse<OrderData>> {
                return apiClient.post<OrderData>('/api/orders', orderData);
        }

        // ユーザーの注文一覧取得
        async getAll(query?: OrderQuery): Promise<ApiResponse<OrderData[]>> {
                return apiClient.get<OrderData[]>('/api/orders', query);
        }

        // 注文詳細取得
        async getById(id: number): Promise<ApiResponse<OrderData>> {
                return apiClient.get<OrderData>(`/api/orders/${id}`);
        }

        // 注文履歴取得
        async getHistory(id: number): Promise<ApiResponse<any>> {
                return apiClient.get<any>(`/api/orders/${id}/history`);
        }

        // 注文キャンセル
        async cancel(id: number, cancelData?: CancelOrderRequest): Promise<ApiResponse<OrderData>> {
                return apiClient.put<OrderData>(`/api/orders/${id}/cancel`, cancelData);
        }
};

// シングルトンインスタンス
export const orderService = new OrderService();
