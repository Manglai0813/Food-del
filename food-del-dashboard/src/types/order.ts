/**
 * 注文関連型定義
 * サーバー仕様書に基づく統一型定義
 */

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

// 注文アイテムプレビュー型（リスト表示用）
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

// 管理者用注文プレビュー型（一覧表示用）
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
	order_date: string; // ISO 8601形式
	updated_at: string; // ISO 8601形式
	items_preview: OrderItemPreview[];
	summary: OrderSummary;
}

// 注文詳細データ型（詳細表示用）
export interface Order {
	id: number;
	user_id: number;
	total_amount: number;
	status: OrderStatus;
	delivery_address: string;
	phone: string;
	notes?: string;
	order_date: string; // ISO 8601形式
	updated_at: string; // ISO 8601形式
	order_items?: OrderItem[]; // 注文アイテム（オプション）
}

// 注文統計データ型（Server /api/orders/admin/stats の返却データ）
export interface OrderStatsData {
	total_orders: number; // 総注文数
	total_revenue: number; // 総収入
	status_breakdown: Record<OrderStatus, number>; // ステータス別内訳
	recent_orders: Order[]; // 最近の注文
	revenue_trend?: Array<{
		// 収入トレンド（オプション）
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
export interface OrderSearchQuery {
	page?: number; // ページ番号（デフォルト: 1）
	limit?: number; // 1ページあたりの件数（デフォルト: 10）
	status?: OrderStatus; // ステータスでフィルタ
	from?: string; // 開始日（ISO 8601形式）
	to?: string; // 終了日（ISO 8601形式）
}

// 注文ステータス更新リクエスト型
export interface UpdateOrderStatusRequest {
	status: OrderStatus;
	note?: string;
}
