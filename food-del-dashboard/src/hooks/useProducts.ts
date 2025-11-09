import { useFoods, useDeleteFood } from '@/api/foodsApi';
import type { FoodSearchQuery } from '@/types/food';

// 商品データ管理用Hook
export function useProducts(query?: FoodSearchQuery) {
    // 商品一覧取得
    const { data: response, isLoading: loading, error: queryError } = useFoods(query);

    // 商品削除
    const deleteMutation = useDeleteFood();

    // エラー処理統合
    const error = (queryError as Error | undefined)?.message || (deleteMutation.error as Error | undefined)?.message || null;

    // 商品削除実行関数
    const deleteProduct = (id: number) => deleteMutation.mutateAsync(id);

    // 商品データを取得
    const products = (response?.data as unknown[]) || [];

    // ページネーション情報を取得
    const pagination = response?.pagination || {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
    };

    return {
        products,
        pagination,
        loading: loading || deleteMutation.isPending,
        error,
        deleteProduct,
    };
}