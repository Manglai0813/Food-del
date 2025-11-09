import type { Category as PrismaCategory } from '@prisma/client';

// Prisma Category型のエイリアス
export type Category = PrismaCategory;

// カテゴリ作成リクエスト型
export interface CreateCategoryRequest {
    name: string;
    description?: string;
    status?: boolean;
}

// カテゴリ更新リクエスト型
export interface UpdateCategoryRequest {
    name?: string;
    description?: string;
    status?: boolean;
}

// 商品数統計付きカテゴリ型
export interface CategoryWithCount extends Category {
    _count: {
        foods: number;
    };
}

// カテゴリ検索結果型
export interface CategorySearchResult {
    categories: CategoryData[];
    total: number;
    includeCount: boolean;
}

// カテゴリデータ統合型
export type CategoryData = Category | CategoryWithCount;