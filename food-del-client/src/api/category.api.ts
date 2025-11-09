import { apiClient } from './client';
import type {
    Category,
    CategoryWithCount,
    CategorySearchResult,
    FoodSearchResult,
    ApiResponse,
} from '@/types';

export class CategoryService {
    // カテゴリ一覧取得
    async getAll(query?: { status?: boolean }): Promise<ApiResponse<CategorySearchResult>> {
        return apiClient.get<CategorySearchResult>('/api/categories', query);
    }

    // カテゴリ詳細取得
    async getById(id: number): Promise<ApiResponse<CategoryWithCount>> {
        return apiClient.get<CategoryWithCount>(`/api/categories/${id}`);
    }

    // アクティブなカテゴリのみ取得
    async getActive(): Promise<ApiResponse<Category[]>> {
        return apiClient.get<Category[]>('/api/categories/active');
    }

    // カテゴリ下の商品を取得
    async getFoods(id: number): Promise<ApiResponse<FoodSearchResult>> {
        return apiClient.get<FoodSearchResult>(`/api/categories/${id}/foods`);
    }
};

// シングルトンインスタンス
export const categoryService = new CategoryService();
