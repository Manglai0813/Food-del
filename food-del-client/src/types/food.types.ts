/**
 * 食品関連型定義
 */

import type { Category } from './category.types';

// 食品基本情報
export interface Food {
        id: number;
        name: string;
        description: string;
        price: number;
        category_id: number;
        image_path: string;
        status: boolean;
        stock: number;
        reserved: number;
        min_stock: number;
        version: number;
        created_at: Date | string;
        updated_at: Date | string;
}

// カテゴリ情報付き食品型
export interface FoodWithCategory extends Food {
        category: Category;
}

// 食品検索クエリ
export interface FoodSearchQuery {
        category_id?: number;
        min_price?: number;
        max_price?: number;
        status?: boolean;
        search?: string;
        page?: number;
        limit?: number;
}

// 食品検索結果型
export interface FoodSearchResult {
        foods: FoodWithCategory[];
        total: number;
        searchTerm?: string;
        appliedFilters?: Partial<FoodSearchQuery>;
}

// 後方互換性エイリアス
export type FoodData = FoodWithCategory;

// UI表示用ビュー型
export interface FoodViewModel extends FoodWithCategory {
        isInStock: boolean;
        availableQuantity: number;
        formattedPrice: string;
}
