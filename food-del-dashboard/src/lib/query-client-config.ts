import { QueryClient } from '@tanstack/react-query';

// TanStack Query設定
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // キャッシュ戦略
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: (failureCount, error: unknown) => {
                const err = error as { response?: { status: number } } | undefined;
                // 認証エラーとレート制限エラーは再試行しない
                if ([401, 403, 429].includes(err?.response?.status ?? -1)) {
                    return false;
                }
                return failureCount < 3;
            },
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
        },
        mutations: {
            // Mutation失敗時の再試行
            retry: 1,
        },
    },
});

// Query key管理
export const queryKeys = {
    auth: ['auth'] as const,
    profile: () => [...queryKeys.auth, 'profile'] as const,

    foods: ['foods'] as const,
    food: (id: string) => [...queryKeys.foods, id] as const,
    foodList: (filters?: Record<string, unknown>) =>
        [...queryKeys.foods, 'list', filters] as const,

    categories: ['categories'] as const,

    orders: ['orders'] as const,
    order: (id: string) => [...queryKeys.orders, id] as const,
    orderStats: (filters?: Record<string, unknown>) =>
        [...queryKeys.orders, 'stats', filters] as const,

    dashboard: ['dashboard'] as const,
    dashboardOverview: () => [...queryKeys.dashboard, 'overview'] as const,
    dashboardSales: (period?: string) => [...queryKeys.dashboard, 'sales', period] as const,
    dashboardProducts: () => [...queryKeys.dashboard, 'products'] as const,
    dashboardOrders: () => [...queryKeys.dashboard, 'orders'] as const,
} as const;