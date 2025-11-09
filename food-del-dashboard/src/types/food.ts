import type { Category } from './category';

// 商品基本情報型
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
    created_at: string;
    updated_at: string;
    category: Category;
}

// 商品作成リクエスト型
export interface CreateFoodRequest {
    name: string;
    description: string;
    price: number;
    category_id: number;
    image?: File;
    status?: boolean;
}

// 商品更新リクエスト型
export interface UpdateFoodRequest {
    id: number;
    name?: string;
    description?: string;
    price?: number;
    category_id?: number;
    image?: File;
    status?: boolean;
}

// 商品検索クエリパラメータ型
export interface FoodSearchQuery extends Record<string, unknown> {
    page?: number;
    limit?: number;
    search?: string;
    category_id?: number;
    status?: boolean;
    min_price?: number;
    max_price?: number;
    sort_by?: 'name' | 'price' | 'created_at' | 'stock';
    sort_order?: 'asc' | 'desc';
}

// ページネーション付き商品リストレスポンス型
export interface PaginatedFoodResponse {
    success: boolean;
    message: string;
    data: Food[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// 在庫情報計算ヘルパー型
export interface StockInfo {
    total: number;
    reserved: number;
    available: number;
    isLow: boolean;
    isOut: boolean;
}

// 在庫情報を計算する関数
export const calculateStockInfo = (food: Food): StockInfo => {
    const available = food.stock - food.reserved;
    return {
        total: food.stock,
        reserved: food.reserved,
        available,
        isLow: available <= food.min_stock && available > 0,
        isOut: available <= 0,
    };
};