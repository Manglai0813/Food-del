import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/lib/httpClient';
import { queryKeys } from '@/lib/query-client-config';
import { API_ENDPOINTS } from '@/lib/apiConstants';
import type { ApiResponse } from '@/types/auth';
import type {
    Category,
    CategoryWithCount,
    CategorySearchQuery,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from '@/types/category';

// カテゴリ一覧取得フック
export const useCategories = (query?: CategorySearchQuery) => {
    return useQuery({
        queryKey: [...queryKeys.categories, query],
        queryFn: async (): Promise<(Category | CategoryWithCount)[]> => {
            const response: ApiResponse<(Category | CategoryWithCount)[]> = await httpClient.get(
                API_ENDPOINTS.CATEGORIES.LIST,
                query ? { params: query as Record<string, unknown> } : undefined
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'カテゴリ一覧の取得に失敗しました');
            }

            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
};

// カテゴリ詳細取得フック
export const useCategory = (categoryId: string | number) => {
    return useQuery({
        queryKey: ['category', String(categoryId)],
        queryFn: async (): Promise<Category> => {
            const response: ApiResponse<Category> = await httpClient.get(
                API_ENDPOINTS.CATEGORIES.DETAIL(categoryId)
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'カテゴリ詳細の取得に失敗しました');
            }

            return response.data;
        },
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });
};

// カテゴリ作成Mutation
export const useCreateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: CreateCategoryRequest) => {
            const payload = {
                name: data.name,
                ...(data.description && { description: data.description }),
                ...(data.status !== undefined && { status: data.status }),
            };

            const response: ApiResponse<Category> = await httpClient.post(
                API_ENDPOINTS.CATEGORIES.CREATE,
                payload
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'カテゴリの作成に失敗しました');
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories });
        },
    });
};

// カテゴリ更新Mutation
export const useUpdateCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            categoryId,
            data,
        }: {
            categoryId: number;
            data: UpdateCategoryRequest;
        }) => {
            const payload: Record<string, unknown> = {};
            if (data.name) {
                payload.name = data.name;
            }
            if (data.description !== undefined) {
                payload.description = data.description;
            }
            if (data.status !== undefined) {
                payload.status = data.status;
            }

            const response: ApiResponse<Category> = await httpClient.put(
                API_ENDPOINTS.CATEGORIES.UPDATE(categoryId),
                payload
            );

            if (!response.success || !response.data) {
                throw new Error(response.message || 'カテゴリの更新に失敗しました');
            }

            return response.data;
        },
        onSuccess: (updatedCategory) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories });
            queryClient.setQueryData(['category', String(updatedCategory.id)], updatedCategory);
        },
    });
};

// カテゴリ削除Mutation
export const useDeleteCategory = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (categoryId: number) => {
            const response: ApiResponse<{ deleted: boolean }> = await httpClient.delete(
                API_ENDPOINTS.CATEGORIES.DELETE(categoryId)
            );

            if (!response.success || !response.data?.deleted) {
                throw new Error(response.message || 'カテゴリの削除に失敗しました');
            }

            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.categories });
        },
    });
};