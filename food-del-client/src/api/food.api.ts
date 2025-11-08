/**
 * 食品関連API サービス
 *
 * 食品の取得、検索、フィルタリングなどのAPI呼び出しを提供します。
 */

import { apiClient } from './client';
import type {
        FoodWithCategory,
        FoodSearchQuery,
        FoodSearchResult,
        ApiResponse,
} from '@/types';

/**
 * 食品サービス
 *
 * REST API を通じて食品関連の操作を行います。
 */
export class FoodService {
        /**
         * 食品一覧取得
         *
         * すべての食品をページネーション対応で取得します。
         *
         * @param query - 検索・フィルタクエリ
         * @returns 食品検索結果
         */
        async getAll(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>('/api/foods', query as Record<string, unknown> | undefined);
        }

        /**
         * クライアント専用食品一覧取得
         *
         * デフォルトlimit=50のクライアント向け食品一覧を取得します。
         *
         * @param query - 検索・フィルタクエリ
         * @returns 食品検索結果
         */
        async getPublic(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>('/api/foods/public', query as Record<string, unknown> | undefined);
        }

        /**
         * 食品詳細取得
         *
         * 指定されたIDの食品詳細情報を取得します。
         *
         * @param id - 食品ID
         * @returns 食品詳細データ
         */
        async getById(id: number): Promise<ApiResponse<FoodWithCategory>> {
                return apiClient.get<FoodWithCategory>(`/api/foods/${id}`);
        }

        /**
         * 注目食品取得
         *
         * 注目（フィーチャー）食品をページネーション対応で取得します。
         *
         * @param query - 検索・フィルタクエリ
         * @returns 食品検索結果
         */
        async getFeatured(query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>('/api/foods/featured', query as Record<string, unknown> | undefined);
        }

        /**
         * カテゴリ別食品取得
         *
         * 指定されたカテゴリの食品をページネーション対応で取得します。
         *
         * @param categoryId - カテゴリID
         * @param query - 検索・フィルタクエリ
         * @returns 食品検索結果
         */
        async getByCategory(categoryId: number, query?: FoodSearchQuery): Promise<ApiResponse<FoodSearchResult>> {
                return apiClient.get<FoodSearchResult>(`/api/foods/category/${categoryId}`, query as Record<string, unknown> | undefined);
        }
}

// シングルトンインスタンス
export const foodService = new FoodService();
