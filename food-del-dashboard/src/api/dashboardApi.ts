import { useQuery } from '@tanstack/react-query';
import httpClient from '@/lib/httpClient';
import { queryKeys } from '@/lib/query-client-config';
import { API_ENDPOINTS } from '@/lib/apiConstants';
import type { ApiResponse } from '@/types/auth';
import type {
        DashboardOverview,
        SalesStats,
        ProductStats,
        OrderStats,
        BackendOrderStats,
        BackendCategoryWithCount,
        BackendFoodResponse
} from '@/types/dashboard';
import type { OrderStatsData, OrderSearchQuery } from '@/types/order';

/**
 * Dashboard統計API統合
 * TanStack Query + httpClient統合で統計データ取得
 */

// ダッシュボード概要データ取得フック
export const useDashboardOverview = () => {
        return useQuery({
                queryKey: queryKeys.dashboardOverview(),
                queryFn: async (): Promise<DashboardOverview> => {
                        const [ordersStatsResponse, foodsDataResponse] = await Promise.all([
                                httpClient.get<ApiResponse<BackendOrderStats>>(API_ENDPOINTS.ORDERS.ADMIN_STATS),
                                httpClient.get<PaginatedResponse<BackendFoodResponse>>(API_ENDPOINTS.FOODS.DASHBOARD_ALL)
                        ]);

                        // httpClient.get() は response.data を返すので、直接 data フィールドにアクセス
                        const orderStats = ordersStatsResponse.data;
                        const foods = foodsDataResponse.data;

                        if (!orderStats) {
                                throw new Error(ordersStatsResponse.message || '注文統計の取得に失敗しました');
                        }
                        if (!foods) {
                                throw new Error(foodsDataResponse.message || '商品リストの取得に失敗しました');
                        }

                        return transformToOverviewStats(orderStats, foods);
                },
                staleTime: 5 * 60 * 1000,
        });
};

// ダッシュボード売上データ取得フック
export const useDashboardSales = (period: 'daily' | 'weekly' | 'monthly' = 'daily') => {
        return useQuery({
                queryKey: queryKeys.dashboardSales(period),
                queryFn: async (): Promise<SalesStats> => {
                        const response: ApiResponse<BackendOrderStats> = await httpClient.get(API_ENDPOINTS.ORDERS.ADMIN_STATS);
                        if (!response.success || !response.data) {
                                throw new Error(response.error || 'Failed to fetch sales stats');
                        }

                        return transformToSalesStats(response.data, period);
                },
                staleTime: 10 * 60 * 1000,
        });
};

// ダッシュボード商品統計データ取得フック
export const useDashboardProducts = () => {
        return useQuery({
                queryKey: queryKeys.dashboardProducts(),
                queryFn: async (): Promise<ProductStats> => {
                        const [popularFoodsResponse, categoriesResponse, allFoodsResponse] = await Promise.all([
                                httpClient.get<PaginatedResponse<BackendFoodResponse>>(`${API_ENDPOINTS.FOODS.LIST}?sort_by=popular&limit=5`),
                                httpClient.get<ApiResponse<BackendCategoryWithCount[]>>(`${API_ENDPOINTS.CATEGORIES.LIST}?include_count=true`),
                                httpClient.get<PaginatedResponse<BackendFoodResponse>>(`${API_ENDPOINTS.FOODS.LIST}?status=true`)
                        ]);

                        // httpClient.get() は response.data を返すので、success フィールドを直接チェック
                        if (!popularFoodsResponse.success || !categoriesResponse.success || !allFoodsResponse.success) {
                                throw new Error('Failed to fetch product stats');
                        }

                        const topProducts = popularFoodsResponse.data;
                        const categoryData = categoriesResponse.data;
                        const foods = allFoodsResponse.data;

                        if (!topProducts || !categoryData || !foods) {
                                throw new Error('商品統計データが不完全です');
                        }

                        return transformToProductStats(topProducts, categoryData, foods);
                },
                staleTime: 15 * 60 * 1000,
        });
};

// ダッシュボード注文統計データ取得フック
export const useDashboardOrders = () => {
        return useQuery({
                queryKey: queryKeys.dashboardOrders(),
                queryFn: async (): Promise<OrderStats> => {
                        const response: ApiResponse<BackendOrderStats> = await httpClient.get(API_ENDPOINTS.ORDERS.ADMIN_STATS);
                        if (!response.success || !response.data) {
                                throw new Error(response.error || 'Failed to fetch order stats');
                        }

                        return {
                                // TODO: 時間別注文数の実装
                                // 【現状】
                                // - server が時間別（hourly）の注文統計データを提供していない
                                // - 現在、空配列を返すため OrdersByHourChart は空表示される
                                ordersByHour: [],

                                // TODO: 日別注文数の実装
                                // 【現状】
                                // - server が日別（daily）の注文統計データを提供していない
                                // - 現在、空配列を返すため OrdersByDayChart は空表示される
                                ordersByDay: [],

                                orderStatus: transformStatusBreakdown(response.data.status_breakdown)
                        };
                },
                staleTime: 5 * 60 * 1000,
        });
};

// 概要統計データ変換関数
const transformToOverviewStats = (
        orderStats: BackendOrderStats,
        foods: BackendFoodResponse[]
): DashboardOverview => {
        const activeProducts = foods.filter(f => f.status).length;
        const inactiveProducts = foods.filter(f => !f.status).length;

        // サーバーデータから平均注文額を計算
        const averageOrderValue = orderStats.total_orders > 0
                ? Math.round(orderStats.total_revenue / orderStats.total_orders)
                : 0;

        return {
                totalRevenue: {
                        value: orderStats.total_revenue,
                        change: 0,
                        trend: 'stable' as const
                },
                totalOrders: {
                        value: orderStats.total_orders,
                        change: 0,
                        trend: 'stable' as const
                },
                totalProducts: {
                        value: activeProducts + inactiveProducts,
                        activeCount: activeProducts,
                        inactiveCount: inactiveProducts
                },
                averageOrderValue: {
                        value: averageOrderValue,
                        change: 0,
                        trend: 'stable' as const
                }
        };
};

// 商品統計データ変換関数
const transformToProductStats = (
        topProducts: BackendFoodResponse[],
        categories: BackendCategoryWithCount[],
        allFoods: BackendFoodResponse[]
): ProductStats => {
        const topProductsList = topProducts.map(product => ({
                id: product.id,
                name: product.name,
                sales_count: product.sales_count || product.order_count || 0,
                revenue: product.price * (product.sales_count || product.order_count || 0),
                category_name: product.category_name
        }));

        // TODO: カテゴリー別売上統計機能の実装
        //
        // 【現状】
        // - server が カテゴリー別の売上統計データを提供していない
        // - 現在、categoryStats は空配列のため、CategoryChart コンポーネントは空表示される
        //
        // 【問題点】
        // - 各カテゴリーの販売金額（revenue）を集計する必要がある
        // - 複数の食品の売上データから、カテゴリーごとに合計する必要がある
        // - OrderItem テーブルをカテゴリーで集約する必要がある
        //
        // 【未来の実装計画】
        // 1. server 側の新規 API エンドポイント作成
        //    - GET /api/orders/admin/stats/by-category
        //    - response: [{ categoryId: 1, categoryName: "ピザ", revenue: 150000, ordersCount: 30 }, ...]
        //
        // 2. server データベースクエリの実装
        //    - JOIN orders, order_items, foods, categories
        //    - GROUP BY categories.id
        //    - SELECT category_id, SUM(quantity * price), COUNT(DISTINCT order_id)
        //    - 期間フィルタ対応（デフォルト: 過去 30 日間）
        //
        // 3. dashboard での使用
        //    - dashboardApi.ts に useOrderStatsByCategory() フックを追加
        //    - DashboardPage.tsx で呼び出し
        //    - CategoryChart コンポーネントで円グラフ表示

        const categoryStats: typeof categories = [];

        return {
                totalProducts: allFoods.length,
                activeProducts: allFoods.filter(f => f.status).length,
                lowStockProducts: 0,
                topProducts: topProductsList,
                categoryStats: categoryStats
        };
};

// 売上統計データ変換関数
const transformToSalesStats = (
        orderStats: BackendOrderStats
): SalesStats => {
        // TODO: 販売トレンド機能の実装
        //
        // 【現状】
        // - server の /api/orders/admin/stats エンドポイントが revenue_trend データを提供していない
        // - 現在、このフィールドは undefined のため、グラフは空表示される
        //
        // 【未来の実装計画】
        // 1. server 側の修正（orderService.ts）
        //    - getOrderStats() メソッドで daily_stats または revenue_trend を計算
        //    - format: [{ date: "YYYY-MM-DD", revenue: 50000, order_count: 15 }, ...]
        //
        // 2. server データベースクエリの実装
        //    - 期間別の売上集計: SELECT DATE(order_date), SUM(total_amount), COUNT(*)
        //    - 過去 7 日間のデータを計算
        //    - キャッシュして性能を最適化
        //
        // 3. dashboard での使用
        //    - このコードで自動的に動作開始
        //    - SalesChart コンポーネントで折れ線グラフ表示

        const dailySales = orderStats.revenue_trend?.map(stat => ({
                date: stat.date,
                revenue: stat.revenue,
                orders: stat.order_count
        })) || [];

        return {
                dailySales,
                weeklySales: [],
                monthlySales: []
        };
};

// ステータス別データ変換関数
const transformStatusBreakdown = (statusData: Record<string, unknown> | null) => {
        return Object.entries(statusData || {}).map(([status, count]) => ({
                status,
                count: count as number,
                percentage: 0
        }));
};


// ===== 新規：Server統計エンドポイント統合 =====

/**
 * 注文統計取得フック（管理者のみ）
 * Server /api/orders/admin/stats エンドポイントを使用
 */
export const useOrderStats = (query?: OrderSearchQuery) => {
        return useQuery({
                queryKey: queryKeys.orderStats(query),
                queryFn: async (): Promise<OrderStatsData> => {
                        const response: ApiResponse<OrderStatsData> = await httpClient.get(API_ENDPOINTS.ORDERS.ADMIN_STATS, {
                                params: query,
                        });
                        if (!response.success || !response.data) {
                                throw new Error(response.message || '注文統計の取得に失敗しました');
                        }
                        return response.data;
                },
                staleTime: 2 * 60 * 1000, // 2分間キャッシュ有効（統計データは頻繁に更新される）
        });
};