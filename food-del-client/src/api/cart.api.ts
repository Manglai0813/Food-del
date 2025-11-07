/**
 * ショッピングカート関連API サービス
 */

import { apiClient } from './client';
import type {
        CartData,
        AddToCartRequest,
        UpdateCartItemRequest,
        ApiResponse,
} from '@/types';

export class CartService {
        // カート取得
        async getCart(): Promise<ApiResponse<CartData>> {
                return apiClient.get<CartData>('/api/carts');
        }

        // カートアイテム追加
        async addItem(itemData: AddToCartRequest): Promise<ApiResponse<CartData>> {
                return apiClient.post<CartData>('/api/carts/add', itemData);
        }

        // カートアイテム更新
        async updateItem(itemId: number, updateData: UpdateCartItemRequest): Promise<ApiResponse<CartData>> {
                return apiClient.put<CartData>(`/api/carts/items/${itemId}`, updateData);
        }

        // カートアイテム削除
        async removeItem(itemId: number): Promise<ApiResponse<CartData>> {
                return apiClient.delete<CartData>(`/api/carts/items/${itemId}`);
        }

        // カート全体をクリア
        async clearCart(): Promise<ApiResponse<void>> {
                return apiClient.delete<void>('/api/carts/clear');
        }

        // チェックアウト
        async checkout(orderData: { delivery_address: string; phone: string; notes?: string }): Promise<ApiResponse<any>> {
                return apiClient.post<any>('/api/carts/checkout', orderData);
        }
};

// シングルトンインスタンス
export const cartService = new CartService();
