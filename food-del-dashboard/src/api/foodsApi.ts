import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import httpClient from '@/lib/httpClient';
import { queryKeys } from '@/lib/query-client-config';
import { API_ENDPOINTS } from '@/lib/apiConstants';
import type { ApiResponse } from '@/types/auth';
import type { Food, CreateFoodRequest, UpdateFoodRequest, FoodSearchQuery, PaginatedFoodResponse } from '@/types/food';

// 商品管理API統合：TanStack Query + Axios統合でCRUD操作

// Dashboard専用：全商品一覧取得フック（非公開商品含む）
export const useFoods = (query?: FoodSearchQuery) => {
        return useQuery({
                queryKey: queryKeys.foodList(query),
                queryFn: async (): Promise<PaginatedFoodResponse> => {
                        const response = await httpClient.get<ApiResponse<PaginatedFoodResponse>>(
                                API_ENDPOINTS.FOODS.DASHBOARD_ALL,
                                { params: query }
                        );

                        if (!response.success || !response.data) {
                                throw new Error(response.message || '商品リストの取得に失敗しました');
                        }

                        // サーバーがページネーション情報を返している（デフォルト limit = 10）
                        // response: {
                        //   success: true,
                        //   data: [...],  // 10件のデータ
                        //   pagination: { page, limit, total, totalPages, hasNext, hasPrev }
                        // }

                        return response as PaginatedFoodResponse;
                },
                staleTime: 5 * 60 * 1000, // 5分間キャッシュ有効
        });
};

// 商品詳細取得フック
export const useFood = (id: string) => {
        return useQuery({
                queryKey: queryKeys.food(id),
                queryFn: async (): Promise<Food> => {
                        const response: ApiResponse<Food> = await httpClient.get(API_ENDPOINTS.FOODS.DETAIL(id));
                        if (!response.success || !response.data) {
                                throw new Error(response.message || '商品が見つかりません');
                        }
                        return response.data;
                },
                enabled: !!id, // idが存在する場合のみクエリ実行
        });
};

// 商品作成フック
export const useCreateFood = () => {
        const queryClient = useQueryClient();

        return useMutation({
                mutationFn: async (data: CreateFoodRequest): Promise<Food> => {
                        // FormData作成（画像アップロード対応）
                        const formData = new FormData();
                        formData.append('name', data.name);
                        formData.append('description', data.description);
                        formData.append('price', data.price.toString());
                        formData.append('category_id', data.category_id.toString());
                        if (data.status !== undefined) {
                                formData.append('status', data.status.toString());
                        }
                        if (data.image) {
                                formData.append('image', data.image);
                        }

                        const response: ApiResponse<Food> = await httpClient.post(
                                API_ENDPOINTS.FOODS.CREATE,
                                formData
                                // FormData を送信時、Content-Type は自動的に multipart/form-data に設定される
                        );
                        if (!response.success || !response.data) {
                                throw new Error(response.message || '商品の作成に失敗しました');
                        }
                        return response.data;
                },
                onSuccess: (newFood) => {
                        queryClient.invalidateQueries({ queryKey: queryKeys.foods }); // 商品一覧を再取得
                        queryClient.setQueryData(queryKeys.food(newFood.id.toString()), newFood); // 新商品をキャッシュ
                },
        });
};

// 商品更新フック
export const useUpdateFood = () => {
        const queryClient = useQueryClient();

        return useMutation({
                mutationFn: async (data: UpdateFoodRequest): Promise<Food> => {
                        // FormData作成（画像アップロード対応）
                        const formData = new FormData();
                        if (data.name) formData.append('name', data.name);
                        if (data.description) formData.append('description', data.description);
                        if (data.price !== undefined) formData.append('price', data.price.toString());
                        if (data.category_id) formData.append('category_id', data.category_id.toString());
                        if (data.status !== undefined) formData.append('status', data.status.toString());
                        if (data.image) formData.append('image', data.image);

                        const response: ApiResponse<Food> = await httpClient.put(
                                API_ENDPOINTS.FOODS.UPDATE(data.id),
                                formData
                                // FormData を送信時、Content-Type は自動的に multipart/form-data に設定される
                        );
                        if (!response.success || !response.data) {
                                throw new Error(response.message || '商品の更新に失敗しました');
                        }
                        return response.data;
                },
                onSuccess: (updatedFood) => {
                        queryClient.invalidateQueries({ queryKey: queryKeys.foods }); // 商品一覧を再取得
                        queryClient.setQueryData(queryKeys.food(updatedFood.id.toString()), updatedFood); // 更新商品をキャッシュ
                },
        });
};

// 商品削除フック（ソフトデリート）
export const useDeleteFood = () => {
        const queryClient = useQueryClient();

        return useMutation({
                mutationFn: async (id: number): Promise<void> => {
                        const response: ApiResponse<{ deleted: boolean }> = await httpClient.delete(API_ENDPOINTS.FOODS.DELETE(id));
                        if (!response.success) {
                                throw new Error(response.message || '商品の削除に失敗しました');
                        }
                },
                onSuccess: (_, deletedId) => {
                        queryClient.invalidateQueries({ queryKey: queryKeys.foods }); // 商品一覧を再取得
                        queryClient.removeQueries({ queryKey: queryKeys.food(deletedId.toString()) }); // キャッシュから削除
                },
        });
};