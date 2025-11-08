/**
 * 注文関連API サービス
 *
 * 注文の作成、取得、キャンセルなどのAPI呼び出しを提供します。
 */

import { apiClient } from './client';
import type {
        OrderData,
        OrderStatusHistory,
        CreateOrderRequest,
        CancelOrderRequest,
        OrderQuery,
        ApiResponse,
} from '@/types';

/**
 * 注文サービス
 *
 * REST API を通じて注文関連の操作を行います。
 */
export class OrderService {
        /**
         * 注文作成
         *
         * 新しい注文を作成します。
         *
         * @param orderData - 注文作成リクエスト
         * @returns 作成された注文データ
         */
        async create(orderData: CreateOrderRequest): Promise<ApiResponse<OrderData>> {
                return apiClient.post<OrderData>('/api/orders', orderData);
        }

        /**
         * ユーザーの注文一覧取得
         *
         * ページネーション対応の注文リストを取得します。
         *
         * @param query - 検索・フィルタクエリ
         * @returns 注文データの配列
         */
        async getAll(query?: OrderQuery): Promise<ApiResponse<OrderData[]>> {
                return apiClient.get<OrderData[]>('/api/orders', query as Record<string, unknown> | undefined);
        }

        /**
         * 注文詳細取得
         *
         * 指定されたIDの注文詳細情報を取得します。
         *
         * @param id - 注文ID
         * @returns 注文データ
         */
        async getById(id: number): Promise<ApiResponse<OrderData>> {
                return apiClient.get<OrderData>(`/api/orders/${id}`);
        }

        /**
         * 注文ステータス履歴取得
         *
         * 注文のステータス変更履歴を取得します。
         *
         * @param id - 注文ID
         * @returns ステータス履歴の配列
         */
        async getHistory(id: number): Promise<ApiResponse<OrderStatusHistory[]>> {
                return apiClient.get<OrderStatusHistory[]>(`/api/orders/${id}/history`);
        }

        /**
         * 注文キャンセル
         *
         * 指定されたIDの注文をキャンセルします。
         *
         * @param id - 注文ID
         * @param cancelData - キャンセル理由などの詳細情報
         * @returns キャンセル後の注文データ
         */
        async cancel(id: number, cancelData?: CancelOrderRequest): Promise<ApiResponse<OrderData>> {
                return apiClient.put<OrderData>(`/api/orders/${id}/cancel`, cancelData);
        }
}

// シングルトンインスタンス
export const orderService = new OrderService();
