// カテゴリデータ型
export interface Category {
    id: number;
    name: string;
    description?: string;
    status: boolean;
    created_at: Date | string;
    updated_at: Date | string;
}

// カテゴリ + 商品数型
export interface CategoryWithCount extends Category {
    _count?: {
        foods: number;
    };
}

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

// カテゴリ検索クエリパラメータ型
export interface CategorySearchQuery {
    include_count?: boolean;
}