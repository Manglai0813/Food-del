import { useFoods, useDeleteFood } from '@/api/foodsApi';
import type { FoodSearchQuery } from '@/types/food';

/**
 * 商品データ管理用Hook
 * foodsApiを使用したTanStack Query統合
 * ページネーション対応版
 */
export function useProducts(query?: FoodSearchQuery) {
        // 商品一覧取得（ページネーション対応、サーバーがデフォルト limit=10 で返す）
        const { data: response, isLoading: loading, error: queryError } = useFoods(query);

        // 商品削除
        const deleteMutation = useDeleteFood();

        // エラー処理統合
        const error = (queryError as Error | undefined)?.message || (deleteMutation.error as Error | undefined)?.message || null;

        // 商品削除実行関数
        const deleteProduct = (id: number) => deleteMutation.mutateAsync(id);

        // サーバーから返されたデータとページネーション情報を抽出
        const typedResponse = response as { data?: unknown; pagination?: unknown } | undefined;
        const products = typedResponse?.data || [];
        const pagination = typedResponse?.pagination || {
                page: 1,
                limit: 10, // サーバーのデフォルト
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