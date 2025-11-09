import { useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/lib/httpClient';
import { useAuthStore } from '@/stores/authStore';
import { API_ENDPOINTS } from '@/lib/apiConstants';
import type {
    LoginRequest,
    LoginResponse,
    ApiResponse
} from '@/types/auth';

// ログイン処理のカスタムフック
export const useLogin = () => {
    const { setAuth, setLoading } = useAuthStore();

    return useMutation({
        mutationFn: async (credentials: LoginRequest): Promise<LoginResponse> => {
            const response: ApiResponse<LoginResponse> = await httpClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
            if (!response.success || !response.data) {
                throw new Error(response.error || 'Login failed');
            }
            return response.data;
        },
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (data) => {
            setAuth(data);
        },
        onSettled: () => {
            setLoading(false);
        },
    });
};

// ログアウト処理のカスタムフック
export const useLogout = () => {
    const { clearAuth } = useAuthStore();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (): Promise<void> => {
        },
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            window.location.href = '/login';
        },
        onError: () => {
            clearAuth();
            queryClient.clear();
            window.location.href = '/login';
        },
    });
};