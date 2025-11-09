import { useQuery } from '@tanstack/react-query';
import { foodService } from '@/api';
import type { FoodSearchQuery } from '@/types';

// クエリキー
const FOOD_KEYS = {
    all: ['foods'] as const,
    lists: () => [...FOOD_KEYS.all, 'list'] as const,
    list: (query?: FoodSearchQuery) => [...FOOD_KEYS.lists(), query] as const,
    details: () => [...FOOD_KEYS.all, 'detail'] as const,
    detail: (id: number) => [...FOOD_KEYS.details(), id] as const,
    category: (categoryId: number, query?: FoodSearchQuery) =>
        [...FOOD_KEYS.all, 'category', categoryId, query] as const,
    featured: (query?: FoodSearchQuery) => [...FOOD_KEYS.all, 'featured', query] as const,
} as const;

// 食品一覧取得フック
export function useFoods(query?: FoodSearchQuery) {
    return useQuery({
        queryKey: FOOD_KEYS.list(query),
        queryFn: async () => {
            const response = await foodService.getAll(query);
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
    });
}

// クライアント専用食品一覧取得フック（分页情報付き）
export function usePublicFoods(query?: FoodSearchQuery) {
    return useQuery({
        queryKey: [...FOOD_KEYS.all, 'public', query] as const,
        queryFn: async () => {
            const response = await foodService.getPublic(query);
            return response;
        },
        staleTime: 5 * 60 * 1000,
    });
}

// 食品詳細取得フック
export function useFood(id: number) {
    return useQuery({
        queryKey: FOOD_KEYS.detail(id),
        queryFn: async () => {
            const response = await foodService.getById(id);
            return response.data;
        },
        enabled: !!id,
        staleTime: 10 * 60 * 1000,
    });
}

// 特色食品取得フック
export function useFeaturedFoods(query?: FoodSearchQuery) {
    return useQuery({
        queryKey: FOOD_KEYS.featured(query),
        queryFn: async () => {
            const response = await foodService.getFeatured(query);
            return response.data;
        },
        staleTime: 15 * 60 * 1000,
    });
}

// カテゴリ別食品取得フック
export function useFoodsByCategory(categoryId: number, query?: FoodSearchQuery) {
    return useQuery({
        queryKey: FOOD_KEYS.category(categoryId, query),
        queryFn: async () => {
            const response = await foodService.getByCategory(categoryId, query);
            return response.data;
        },
        enabled: !!categoryId,
        staleTime: 5 * 60 * 1000,
    });
}