import type { Food, Category } from '@prisma/client';

// 公開用商品データ型
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

// 在庫可用性情報
export interface FoodAvailability {
    id: number;
    isAvailable: boolean;       // 在庫があるかどうか
    isLowStock: boolean;        // 在庫が少ないかどうか
    maxQuantity?: number;       // 注文可能な最大数量
}

// カート用商品情報
export interface CartFoodInfo extends PublicFood {
    availability: FoodAvailability;
}

// 公開用商品変換関数
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

// カテゴリ情報付き公開商品変換関数
export const toPublicFoodWithCategory = (foodWithCategory: Food & { category: Category }): PublicFoodWithCategory => {
    const publicFood = toPublicFood(foodWithCategory);
    return {
        ...publicFood,
        category: foodWithCategory.category
    };
};

// 複数商品公開用変換関数
export const toPublicFoodArray = (foods: Array<Food & { category: Category }>): PublicFoodWithCategory[] => {
    return foods.map(toPublicFoodWithCategory);
};

// 在庫可用性作成関数
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