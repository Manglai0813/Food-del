import { apiClient } from './client';
import type {
    FoodWithCategory,
    FoodSearchQuery,
    FoodSearchResult,
    ApiResponse,
} from '@/types';

// 食品サービスクラス
export class FoodService {
    // 全食品取得
    async getAll(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
        return apiClient.get<FoodSearchResult>('/api/foods', query as Record<string, unknown> | undefined);
    }

    // 公開食品取得
    async getPublic(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
        return apiClient.get<FoodSearchResult>('/api/foods/public', query as Record<string, unknown> | undefined);
    }

    // 食品詳細取得
    async getById(id: number): Promise<ApiResponse<FoodWithCategory>> {
        return apiClient.get<FoodWithCategory>(`/api/foods/${id}`);
    }

    // 注目食品取得
    async getFeatured(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
        return apiClient.get<FoodSearchResult>('/api/foods/featured', query as Record<string, unknown> | undefined);
    }

    // カテゴリ別食品取得
    async getByCategory(categoryId: number, query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
        return apiClient.get<FoodSearchResult>(`/api/foods/category/${categoryId}`, query as Record<string, unknown> | undefined);
    }
}

// シングルトンインスタンス
export const foodService = new FoodService();