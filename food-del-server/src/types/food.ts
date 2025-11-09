import type { Food as PrismaFood, Category } from '@prisma/client';

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