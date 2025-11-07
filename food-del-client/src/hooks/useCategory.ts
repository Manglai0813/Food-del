/**
 * カテゴリ関連カスタムフック
 */

import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/api';

// クエリキー
const CATEGORY_KEYS = {
        all: ['categories'] as const,
        lists: () => [...CATEGORY_KEYS.all, 'list'] as const,
        list: (query?: { status?: boolean }) => [...CATEGORY_KEYS.lists(), query] as const,
        details: () => [...CATEGORY_KEYS.all, 'detail'] as const,
        detail: (id: number) => [...CATEGORY_KEYS.details(), id] as const,
        active: () => [...CATEGORY_KEYS.all, 'active'] as const,
        foods: (id: number) => [...CATEGORY_KEYS.all, 'foods', id] as const,
} as const;

// カテゴリ一覧取得フック
export function useCategories(query?: { status?: boolean }) {
        return useQuery({
                queryKey: CATEGORY_KEYS.list(query),
                queryFn: async () => {
                        const response = await categoryService.getAll(query);
                        return response.data;
                },
                staleTime: 10 * 60 * 1000,
        });
}

// カテゴリ詳細取得フック
export function useCategory(id: number) {
        return useQuery({
                queryKey: CATEGORY_KEYS.detail(id),
                queryFn: async () => {
                        const response = await categoryService.getById(id);
                        return response.data;
                },
                enabled: !!id,
                staleTime: 10 * 60 * 1000,
        });
}

// アクティブカテゴリ取得フック
export function useActiveCategories() {
        return useQuery({
                queryKey: CATEGORY_KEYS.active(),
                queryFn: async () => {
                        const response = await categoryService.getActive();
                        return response.data;
                },
                staleTime: 15 * 60 * 1000,
        });
}

// カテゴリ下の商品取得フック
export function useCategoryFoods(id: number) {
        return useQuery({
                queryKey: CATEGORY_KEYS.foods(id),
                queryFn: async () => {
                        const response = await categoryService.getFoods(id);
                        return response.data;
                },
                enabled: !!id,
                staleTime: 5 * 60 * 1000,
        });
}
