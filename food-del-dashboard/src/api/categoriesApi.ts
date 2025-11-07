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

/**
 * カテゴリ管理API統合
 * TanStack Query + httpClient統合でカテゴリデータ取得・更新
 */

/**
 * カテゴリ一覧取得フック
 */
export const useCategories = (query?: CategorySearchQuery) => {
	return useQuery({
		queryKey: [...queryKeys.categories, query],
		queryFn: async (): Promise<(Category | CategoryWithCount)[]> => {
			const response: ApiResponse<(Category | CategoryWithCount)[]> = await httpClient.get(
				API_ENDPOINTS.CATEGORIES.LIST,
				{ params: query }
			);

			if (!response.success || !response.data) {
				throw new Error(response.message || 'カテゴリ一覧の取得に失敗しました');
			}

			return response.data;
		},
		staleTime: 5 * 60 * 1000, // 5分間キャッシュ有効
	});
};

/**
 * カテゴリ詳細取得フック
 */
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
		enabled: !!categoryId, // categoryIdが存在する場合のみクエリを実行
		staleTime: 5 * 60 * 1000, // 5分間キャッシュ有効
	});
};

/**
 * カテゴリ作成Mutation（管理者専用）
 */
export const useCreateCategory = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (data: CreateCategoryRequest) => {
			// JSON形式で送信（name, description, status）
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
			// カテゴリ一覧キャッシュを無効化（再フェッチ）
			queryClient.invalidateQueries({ queryKey: queryKeys.categories });
		},
	});
};

/**
 * カテゴリ更新Mutation（管理者専用）
 */
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
			// JSON形式で送信（name, description, status）
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
			// カテゴリ一覧キャッシュを無効化（再フェッチ）
			queryClient.invalidateQueries({ queryKey: queryKeys.categories });

			// カテゴリ詳細キャッシュを更新
			queryClient.setQueryData(['category', String(updatedCategory.id)], updatedCategory);
		},
	});
};

/**
 * カテゴリ削除Mutation（管理者専用）
 */
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
			// カテゴリ一覧キャッシュを無効化（再フェッチ）
			queryClient.invalidateQueries({ queryKey: queryKeys.categories });
		},
	});
};
