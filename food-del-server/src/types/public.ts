import type { Food, Category } from '@prisma/client';

/**
 * 公開API用型定義
 * 内部システム情報を隠蔽し、外部APIでのデータ露出を防ぎます
 */

// 公開用商品データ型（庫存敏感情報を除外）
export interface PublicFood {
    id: number;
    name: string;
    description: string;
    price: number;
    category_id: number;
    image_path: string;
    status: boolean;
    created_at: Date;
    updated_at: Date;
    // 以下のフィールドは公開APIから除外:
    // - stock: 在庫数量
    // - reserved: 予約済み在庫
    // - min_stock: 最小在庫閾値
    // - version: 楽観的ロックバージョン
}

// カテゴリ情報付き公開商品型
export interface PublicFoodWithCategory extends PublicFood {
    category: Category;
}

// 商品検索結果公開型
export interface PublicFoodSearchResult {
    foods: PublicFoodWithCategory[];
    total: number;
    searchTerm?: string;
    appliedFilters?: Partial<import('./utils/validation').FoodSearchQuery>;
}

// 在庫可用性情報（公開可能な最小限の情報）
export interface FoodAvailability {
    id: number;
    isAvailable: boolean;       // 在庫があるかどうか
    isLowStock: boolean;        // 在庫が少ないかどうか
    maxQuantity?: number;       // 注文可能な最大数量（オプション）
}

// カート用商品情報（価格と可用性のみ）
export interface CartFoodInfo extends PublicFood {
    availability: FoodAvailability;
}

/**
 * 内部Foodデータを公開用に変換するヘルパー関数
 */
export const toPublicFood = (food: Food): PublicFood => {
    const {
        stock,
        reserved,
        min_stock,
        version,
        ...publicFields
    } = food;

    return publicFields as PublicFood;
};

/**
 * カテゴリ付きFood型を公開用に変換
 */
export const toPublicFoodWithCategory = (foodWithCategory: Food & { category: Category }): PublicFoodWithCategory => {
    const publicFood = toPublicFood(foodWithCategory);
    return {
        ...publicFood,
        category: foodWithCategory.category
    };
};

/**
 * 食品配列を公開用に変換
 */
export const toPublicFoodArray = (foods: Array<Food & { category: Category }>): PublicFoodWithCategory[] => {
    return foods.map(toPublicFoodWithCategory);
};

/**
 * 在庫情報から可用性情報を生成
 */
export const createAvailability = (food: Food): FoodAvailability => {
    const availableStock = food.stock - food.reserved;
    const isLowStock = availableStock <= food.min_stock;

    return {
        id: food.id,
        isAvailable: availableStock > 0,
        isLowStock: isLowStock && availableStock > 0,
        maxQuantity: availableStock > 0 ? Math.min(availableStock, 99) : 0
    };
};