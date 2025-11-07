/**
 * 食品関連API サービス
 */

import { apiClient } from './client';
import type {
        FoodWithCategory,
        FoodSearchQuery,
        FoodSearchResult,
        ApiResponse,
} from '@/types';

export class FoodService {
        // 食品一覧取得
        async getAll(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>('/api/foods', query);
        }

        // クライアント専用食品一覧取得（デフォルトlimit=50）
        async getPublic(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>('/api/foods/public', query);
        }

        // 食品詳細取得
        async getById(id: number): Promise<ApiResponse<FoodWithCategory>> {
                return apiClient.get<FoodWithCategory>(`/api/foods/${id}`);
        }

        // 注目食品取得
        async getFeatured(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>('/api/foods/featured', query);
        }

        // カテゴリ別食品取得
        async getByCategory(categoryId: number, query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>(`/api/foods/category/${categoryId}`, query);
        }
}

// シングルトンインスタンス
export const foodService = new FoodService();
