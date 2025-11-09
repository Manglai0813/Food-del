import { apiClient } from './client';
import type {
    CartData,
    CartItem,
    AddToCartRequest,
    UpdateCartItemRequest,
    CreateOrderRequest,
    ApiResponse,
    Order,
} from '@/types';

// カートサービスクラス
export class CartService {
    // カート取得
    async getCart(): Promise<ApiResponse<CartData>> {
        return apiClient.get<CartData>('/api/carts');
    }

    // カートアイテム追加
    async addItem(itemData: AddToCartRequest): Promise<ApiResponse<CartItem>> {
        return apiClient.post<CartItem>('/api/carts/add', itemData);
    }

    // カートアイテム更新
    async updateItem(itemId: number, data: UpdateCartItemRequest): Promise<ApiResponse<CartItem>> {
        return apiClient.put<CartItem>(`/api/carts/items/${itemId}`, data);
    }

    // カートアイテム削除
    async removeItem(itemId: number): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(`/api/carts/items/${itemId}`);
    }

    // カートクリア
    async clearCart(): Promise<ApiResponse<void>> {
        return apiClient.delete<void>('/api/carts/clear');
    }

    // チェックアウト
    async checkout(orderData: CreateOrderRequest): Promise<ApiResponse<Order>> {
        return apiClient.post<Order>('/api/carts/checkout', orderData);
    }
}

// シングルトンインスタンス
export const cartService = new CartService();
