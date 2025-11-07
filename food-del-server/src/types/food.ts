import type { Food as PrismaFood, Category } from '@prisma/client';

/**
 * 商品関連型定義
 * データベース層からAPI層まで一貫した型定義を提供
 */

// データベース基本型
export type Food = PrismaFood;

// カテゴリ情報付き商品型
export interface FoodWithCategory extends Food {
        category: Category;
}

// リクエスト型はZodから推論（validation.tsを参照）
export type {
        CreateFoodRequest,
        UpdateFoodRequest,
        FoodSearchQuery
} from './utils/validation';

// 内部使用のためのimport
import type { FoodSearchQuery } from './utils/validation';

// 商品検索結果型
export interface FoodSearchResult {
        foods: FoodWithCategory[];
        total: number;
        searchTerm?: string;
        appliedFilters?: Partial<FoodSearchQuery>;
}

// 後方互換性エイリアス
export type FoodData = FoodWithCategory;