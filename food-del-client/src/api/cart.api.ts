/**
 * ショッピングカート関連API サービス
 *
 * カート操作（追加、更新、削除、チェックアウト）をAPI経由で提供します。
 */

import { apiClient } from './client';
import type {
        CartData,
        OrderData,
        AddToCartRequest,
        UpdateCartItemRequest,
        ApiResponse,
} from '@/types';

/**
 * カートサービス
 *
 * ショッピングカートの操作とチェックアウト処理を提供します。
 */
export class CartService {
        /**
         * カート取得
         *
         * 現在のショッピングカート内容を取得します。
         *
         * @returns カートデータ
         */
        async getCart(): Promise<ApiResponse<CartData>> {
                return apiClient.get<CartData>('/api/carts');
        }

        /**
         * カートアイテム追加
         *
         * 新しいアイテムをカートに追加します。
         *
         * @param itemData - 追加するアイテム情報
         * @returns 更新後のカートデータ
         */
        async addItem(itemData: AddToCartRequest): Promise<ApiResponse<CartData>> {
                return apiClient.post<CartData>('/api/carts/add', itemData);
        }

        /**
         * カートアイテム更新
         *
         * カート内のアイテム情報を更新します（数量変更など）。
         *
         * @param itemId - 更新するアイテムID
         * @param updateData - 更新内容
         * @returns 更新後のカートデータ
         */
        async updateItem(itemId: number, updateData: UpdateCartItemRequest): Promise<ApiResponse<CartData>> {
                return apiClient.put<CartData>(`/api/carts/items/${itemId}`, updateData);
        }

        /**
         * カートアイテム削除
         *
         * カートから指定されたアイテムを削除します。
         *
         * @param itemId - 削除するアイテムID
         * @returns 更新後のカートデータ
         */
        async removeItem(itemId: number): Promise<ApiResponse<CartData>> {
                return apiClient.delete<CartData>(`/api/carts/items/${itemId}`);
        }

        /**
         * カート全体をクリア
         *
         * カート内のすべてのアイテムを削除します。
         *
         * @returns 空のカート応答（void型）
         */
        async clearCart(): Promise<ApiResponse<void>> {
                return apiClient.delete<void>('/api/carts/clear');
        }

        /**
         * チェックアウト
         *
         * カートの内容で注文を作成し、チェックアウトを完了します。
         *
         * @param orderData - 配送先住所、電話番号、備考など
         * @returns 作成された注文データ
         */
        async checkout(orderData: {
                delivery_address: string;
                phone: string;
                notes?: string;
        }): Promise<ApiResponse<OrderData>> {
                return apiClient.post<OrderData>('/api/carts/checkout', orderData);
        }
}

// シングルトンインスタンス
export const cartService = new CartService();
