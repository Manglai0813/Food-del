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

// ダッシュボード概要データ取得フック
export const useDashboardOverview = () => {
    return useQuery({
        queryKey: queryKeys.dashboardOverview(),
        queryFn: async (): Promise<DashboardOverview> => {
            const [ordersStatsResponse, foodsDataResponse] = await Promise.all([
                httpClient.get<ApiResponse<BackendOrderStats>>(API_ENDPOINTS.ORDERS.ADMIN_STATS),
                httpClient.get<ApiResponse<BackendFoodResponse[]>>(API_ENDPOINTS.FOODS.DASHBOARD_ALL)
            ]);

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

            return transformToSalesStats(response.data);
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
                httpClient.get<ApiResponse<BackendFoodResponse[]>>(`${API_ENDPOINTS.FOODS.LIST}?sort_by=popular&limit=5`),
                httpClient.get<ApiResponse<BackendCategoryWithCount[]>>(`${API_ENDPOINTS.CATEGORIES.LIST}?include_count=true`),
                httpClient.get<ApiResponse<BackendFoodResponse[]>>(`${API_ENDPOINTS.FOODS.LIST}?status=true`)
            ]);

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
                ordersByHour: [],
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
    _categories: BackendCategoryWithCount[],
    allFoods: BackendFoodResponse[]
): ProductStats => {
    const topProductsList = topProducts.map(product => ({
        id: product.id,
        name: product.name,
        sales_count: product.sales_count || product.order_count || 0,
        revenue: product.price * (product.sales_count || product.order_count || 0),
        category_name: product.category_name
    }));

    const categoryStats: ProductStats['categoryStats'] = [];

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

// 注文統計取得フック
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
        staleTime: 2 * 60 * 1000,
    });
};