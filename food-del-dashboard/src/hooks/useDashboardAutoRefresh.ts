import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client-config';

/**
 * Dashboard手動更新管理Hook
 * 手動更新のみ、自動更新は無効化
 */
export const useDashboardAutoRefresh = () => {
        const queryClient = useQueryClient();

        // 自動更新は無効化 - 手動更新のみ
        // useEffect(() => {
        //         // ページ可視性変更ハンドラ
        //         const handleVisibilityChange = () => {
        //                 if (document.visibilityState === 'visible') {
        //                         queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        //                 }
        //         };

        //         // フォーカス復帰ハンドラ
        //         const handleFocus = () => {
        //                 queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        //         };

        //         document.addEventListener('visibilitychange', handleVisibilityChange);
        //         window.addEventListener('focus', handleFocus);

        //         return () => {
        //                 document.removeEventListener('visibilitychange', handleVisibilityChange);
        //                 window.removeEventListener('focus', handleFocus);
        //         };
        // }, [queryClient]);

        // 手動更新関数
        const refreshDashboard = () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        };

        // 特定セクション更新
        const refreshOverview = () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboardOverview() });
        };

        // 売上データ更新
        const refreshSales = () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboardSales() });
        };

        // 商品データ更新
        const refreshProducts = () => {
                queryClient.invalidateQueries({ queryKey: queryKeys.dashboardProducts() });
        };

        // 注文データ更新
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