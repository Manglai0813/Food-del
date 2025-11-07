import type { Order as PrismaOrder, OrderItem as PrismaOrderItem, Food, User, Category } from '@prisma/client';
import type { BaseQuery } from './utils/pagination';

// 基礎型
export type Order = PrismaOrder;
export type OrderItem = PrismaOrderItem;

// 注文状態列挙型
export enum OrderStatus {
        PENDING = 'pending',       // 注文待ち
        CONFIRMED = 'confirmed',   // 注文確認済み
        PREPARING = 'preparing',   // 調理中
        DELIVERY = 'delivery',     // 配送中
        COMPLETED = 'completed',   // 配送完了
        CANCELLED = 'cancelled'    // 注文キャンセル
}

// リクエスト型はZodから推論（validation.tsを参照）
export type { CreateOrderRequest } from './utils/validation';

// 注文状態更新リクエスト型
export interface UpdateOrderStatusRequest {
        status: OrderStatus;
        note?: string;  // 状態変更備考
}

// 注文キャンセルリクエスト型
export interface CancelOrderRequest {
        reason?: string;
}

// 注文検索クエリ型
export interface OrderQuery extends BaseQuery {
        status?: OrderStatus;
        user_id?: number;        // 管理者検索用
        date_from?: string;
        date_to?: string;
        amount_min?: number;     // 金額フィルタ
        amount_max?: number;
}

// 注文アイテムデータ型 (subtotalは実行時計算)
export interface OrderItemData extends OrderItem {
        food: Food & {
                current_price?: number;  // 現在価格
                category?: Pick<Category, 'id' | 'name'>;
        };
}

// 実行時計算フィールド付き注文アイテム型
export interface OrderItemWithCalculatedFields extends OrderItemData {
        subtotal: number;        // quantity * price の計算結果
}

// 注文データ型
export interface OrderData extends Order {
        items: OrderItemData[];
        summary: {
                itemCount: number;      // 商品種類数
                totalQuantity: number;  // 商品総数量
                totalAmount: number;    // 注文総金額
        };
        status_history?: OrderStatusHistory[];
        user?: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
}

// 注文プレビュー型
export interface OrderPreview {
        id: number;
        total_amount: number;
        status: OrderStatus;
        delivery_address: string;
        phone: string;
        order_date: Date;
        updated_at: Date;
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

// 管理者注文プレビュー型
export interface AdminOrderPreview extends OrderPreview {
        user: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
}

// 注文キャンセルデータ型
export interface CancelOrderData {
        id: number;
        status: OrderStatus;
        cancelled_at: Date;
        cancel_reason?: string;
}

// 状態更新データ型
export interface StatusUpdateData {
        id: number;
        previous_status: OrderStatus;
        new_status: OrderStatus;
        updated_at: Date;
        updated_by: string;
        note?: string;
}

// 注文統計データ型
export interface OrderStatsData {
        total_orders: number;
        total_revenue: number;
        status_breakdown: Record<string, number>;
        recent_orders: any[]; // TODO: 型定義を修正
        // 将来の拡張用フィールド
        revenue_trend?: Array<{
                date: string;
                revenue: number;
                order_count: number;
        }>;
}

// 注文状態履歴型
export interface OrderStatusHistory {
        id: number;
        order_id: number;
        previous_status: OrderStatus;
        new_status: OrderStatus;
        updated_by: number;
        updated_at: Date;
        note?: string;
}


