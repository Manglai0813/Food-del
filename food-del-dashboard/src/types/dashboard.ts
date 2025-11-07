/**
 * Dashboard統計機能の型定義
 * フロントエンドとバックエンド間のデータ型統合管理
 */

// バックエンドからの注文統計データ
export interface BackendOrderStats {
        total_orders: number;
        total_revenue: number;
        // ステータス別注文数
        status_breakdown: {
                [status: string]: number;
        };
        // 日別売上データ（将来の実装用）
        revenue_trend?: Array<{
                date: string;
                revenue: number;
                order_count: number;
        }>;
        // 最新の注文データ
        recent_orders: Array<Record<string, unknown>>;
}

// バックエンドからの食品統計データ
export interface BackendFoodStats {
        total_products: number;
        active_products: number;
        low_stock_products: number;
        // 売上上位商品
        top_selling_products: Array<{
                id: number;
                name: string;
                sales_count: number;
                revenue: number;
        }>;
}

// バックエンドからのユーザー統計データ
export interface BackendUserStats {
        total_users: number;
        new_users_this_month: number;
        active_users: number;
        // 月別ユーザー増加数
        user_growth_trend: Array<{
                month: string;
                new_users: number;
        }>;
}

// バックエンドからのカテゴリー情報
export interface BackendCategoryWithCount {
        id: number;
        name: string;
        description?: string;
        is_active: boolean;
        sort_order?: number;
        created_at: string;
        updated_at: string;
        food_count: number;
}

// バックエンドからの食品情報
export interface BackendFoodResponse {
        id: number;
        name: string;
        description: string;
        price: number;
        category_id: number;
        category_name?: string;
        image_url?: string;
        status: boolean;
        is_popular: boolean;
        preparation_time?: number;
        created_at: string;
        updated_at: string;
        order_count?: number;
        sales_count?: number;
}

// フロントエンド用の統計データ型定義
export interface DashboardOverview {
        totalRevenue: {
                value: number;
                change: number;
                trend: 'up' | 'down' | 'stable';
        };
        totalOrders: {
                value: number;
                change: number;
                trend: 'up' | 'down' | 'stable';
        };
        totalProducts: {
                value: number;
                activeCount: number;
                inactiveCount: number;
        };
        averageOrderValue: {
                value: number;
                change: number;
                trend: 'up' | 'down' | 'stable';
        };
}

// 売上統計データ
export interface SalesStats {
        //  日別売上データ
        dailySales: Array<{
                date: string;
                revenue: number;
                orders: number;
        }>;
        //  週別売上データ
        weeklySales: Array<{
                week: string;
                revenue: number;
                orders: number;
        }>;
        //  月別売上データ
        monthlySales: Array<{
                month: string;
                revenue: number;
                orders: number;
        }>;
}

// 商品統計データ
export interface ProductStats {
        totalProducts: number;
        activeProducts: number;
        lowStockProducts: number;
        // 売上上位商品
        topProducts: Array<{
                id: number;
                name: string;
                sales_count: number;
                revenue: number;
                image_url?: string;
                category_name?: string;
        }>;
        // カテゴリー別商品内訳
        categoryStats: Array<{
                categoryId: number;
                categoryName: string;
                productCount: number;
                revenue: number;
                percentage: number;
        }>;
}

// 注文統計データ
export interface OrderStats {
        // 期間別注文数
        ordersByHour: Array<{
                hour: number;
                count: number;
        }>;
        // 曜日別注文数と売上
        ordersByDay: Array<{
                dayOfWeek: number;
                count: number;
                revenue: number;
        }>;
        // ステータス別注文内訳
        orderStatus: Array<{
                status: string;
                count: number;
                percentage: number;
        }>;
}

// ダッシュボード全体のデータ構造
export interface DashboardData {
        overview: DashboardOverview;
        sales: SalesStats;
        products: ProductStats;
        orders: OrderStats;
}