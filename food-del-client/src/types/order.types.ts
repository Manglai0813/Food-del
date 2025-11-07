/**
 * 注文関連型定義
 */

import type { Food } from './food.types';
import type { Category } from './category.types';
import type { User } from './auth.types';

// 注文ステータス型
export type OrderStatus =
        | 'pending'
        | 'confirmed'
        | 'preparing'
        | 'delivery'
        | 'completed'
        | 'cancelled';

// 注文基本情報
export interface Order {
        id: number;
        user_id: number;
        total_amount: number;
        status: string;
        delivery_address: string;
        phone: string;
        notes: string | null;
        order_date: Date | string;
        updated_at: Date | string;
}

// 注文アイテム基本情報
export interface OrderItem {
        id: number;
        order_id: number;
        food_id: number;
        quantity: number;
        price: number;
}

// 注文アイテムデータ
export interface OrderItemData extends OrderItem {
        food: Food & {
                current_price?: number;
                category?: Pick<Category, 'id' | 'name'>;
        };
}

// 計算フィールド付き注文アイテム
export interface OrderItemWithCalculatedFields extends OrderItemData {
        subtotal: number;
}

// 注文データ
export interface OrderData extends Order {
        items: OrderItemData[];
        summary: {
                itemCount: number;
                totalQuantity: number;
                totalAmount: number;
        };
        status_history?: OrderStatusHistory[];
        user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
}

// 注文プレビュー
export interface OrderPreview {
        id: number;
        total_amount: number;
        status: OrderStatus;
        delivery_address: string;
        phone: string;
        order_date: Date | string;
        updated_at: Date | string;
        items_preview: Array<{
                food_name: string;
                quantity: number;
                image_path: string;
        }>;
        summary: {
                itemCount: number;
                totalQuantity: number;
        };
}

// 注文ステータス履歴
export interface OrderStatusHistory {
        id: number;
        order_id: number;
        previous_status: OrderStatus;
        new_status: OrderStatus;
        updated_by: number;
        updated_at: Date | string;
        note: string | null;
}

// 注文作成リクエスト
export interface CreateOrderRequest {
        delivery_address: string;
        phone: string;
        notes?: string;
}

// 注文キャンセルリクエスト
export interface CancelOrderRequest {
        reason?: string;
}

// 注文検索クエリ
export interface OrderQuery {
        status?: OrderStatus;
        date_from?: string;
        date_to?: string;
        amount_min?: number;
        amount_max?: number;
        page?: number;
        limit?: number;
}

// UI表示用ビュー型
export interface OrderViewModel extends OrderData {
        subtotal: number;
        deliveryFee: number;
        tax: number;
        formattedTotal: string;
        statusLabel: string;
        canCancel: boolean;
}
