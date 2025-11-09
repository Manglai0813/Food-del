// 注文ステータス型
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'delivery' | 'completed' | 'cancelled';

// 注文アイテム型
export interface OrderItem {
    id: number;
    order_id: number;
    food_id: number;
    quantity: number;
    price: number;
}

// 注文アイテムプレビュー型
export interface OrderItemPreview {
    food_name: string;
    quantity: number;
    image_path: string;
}

// 注文サマリー型
export interface OrderSummary {
    itemCount: number;
    totalQuantity: number;
}

// 管理者用注文プレビュー型
export interface OrderListItem {
    id: number;
    user: {
        id: number;
        name: string;
        email: string;
        phone: string;
    };
    total_amount: number;
    status: OrderStatus;
    delivery_address: string;
    phone: string;
    order_date: string;
    updated_at: string;
    items_preview: OrderItemPreview[];
    summary: OrderSummary;
}

// 注文詳細データ型
export interface Order {
    id: number;
    user_id: number;
    total_amount: number;
    status: OrderStatus;
    delivery_address: string;
    phone: string;
    notes?: string;
    order_date: string;
    updated_at: string;
    order_items?: OrderItem[];
}

// 注文統計データ型
export interface OrderStatsData {
    total_orders: number;
    total_revenue: number;
    status_breakdown: Record<OrderStatus, number>;
    recent_orders: Order[];
    revenue_trend?: Array<{
        date: string;
        revenue: number;
        order_count: number;
    }>;
}

// 注文作成リクエスト型
export interface CreateOrderRequest {
    delivery_address: string;
    phone: string;
    notes?: string;
}

// 注文検索クエリパラメータ型
export interface OrderSearchQuery extends Record<string, unknown> {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    from?: string;
    to?: string;
}

// 注文ステータス更新リクエスト型
export interface UpdateOrderStatusRequest {
    status: OrderStatus;
    note?: string;
}