import { QueryClient } from '@tanstack/react-query';

// React Query クライアント設定
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 5 * 60 * 1000, // 5分
            gcTime: 10 * 60 * 1000,   // 10分
        },
        mutations: {
            retry: 0,
        },
    },
});
