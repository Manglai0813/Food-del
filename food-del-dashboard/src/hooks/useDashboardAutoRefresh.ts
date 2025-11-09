import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client-config';

// ダッシュボードの手動更新機能を管理
export const useDashboardAutoRefresh = () => {
    const queryClient = useQueryClient();

    // 手動更新関数
    const refreshDashboard = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
    };

    // 概要セクションのキャッシュを無効化
    const refreshOverview = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview() });
    };

    // 売上データのキャッシュを無効化
    const refreshSales = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSales() });
    };

    // 商品データのキャッシュを無効化
    const refreshProducts = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardProducts() });
    };

    // 注文データのキャッシュを無効化
    const refreshOrders = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOrders() });
    };

    return {
        refreshDashboard,
        refreshOverview,
        refreshSales,
        refreshProducts,
        refreshOrders,
    };
};

export default useDashboardAutoRefresh;