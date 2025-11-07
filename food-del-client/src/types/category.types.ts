/**
 * カテゴリ関連型定義
 */

// カテゴリ基本情報
export interface Category {
        id: number;
        name: string;
        description: string | null;
        status: boolean;
        created_at: Date | string;
        updated_at: Date | string;
}

// 商品数統計付きカテゴリ
export interface CategoryWithCount extends Category {
        _count: {
                foods: number;
        };
}

// カテゴリ検索結果
export interface CategorySearchResult {
        categories: CategoryData[];
        total: number;
        includeCount: boolean;
}

// カテゴリデータ統合型
export type CategoryData = Category | CategoryWithCount;
