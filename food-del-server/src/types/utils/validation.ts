import { z } from 'zod';

/**
 * Zodバリデーションスキーマ定義
 * TypeScript型と実行時バリデーションの一元管理
 */

// 商品作成バリデーションスキーマ
export const CreateFoodSchema = z.object({
        name: z.string().min(1).max(100),
        description: z.string().min(1).max(500),
        price: z.number().positive(),
        category_id: z.number().positive(),
        status: z.boolean().optional().default(true)
});

// 商品更新バリデーションスキーマ
export const UpdateFoodSchema = z.object({
        name: z.string().min(1).max(100).optional(),
        description: z.string().min(1).max(500).optional(),
        price: z.number().positive().optional(),
        category_id: z.number().positive().optional(),
        status: z.boolean().optional()
});

// カート追加バリデーションスキーマ
export const AddToCartSchema = z.object({
        food_id: z.number().positive(),
        quantity: z.number().min(1).max(99)
});

// カートアイテム更新バリデーションスキーマ
export const UpdateCartItemSchema = z.object({
        quantity: z.number().min(0).max(99)
});

// カート一括更新バリデーションスキーマ
export const BatchUpdateCartSchema = z.object({
        items: z.array(z.object({
                food_id: z.number().positive(),
                quantity: z.number().min(0).max(99)
        })).min(1).max(50) // 最大50件まで一括更新可能
});

// 注文作成バリデーションスキーマ
export const CreateOrderSchema = z.object({
        delivery_address: z.string().min(10).max(200),
        phone: z.string().regex(/^[0-9-+().\s]+$/).min(10).max(20),
        notes: z.string().max(500).optional()
});

// ページネーションバリデーションスキーマ
export const PaginationSchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(10)
});

// 検索クエリバリデーションスキーマ
export const FoodSearchSchema = PaginationSchema.extend({
        search: z.string().max(100).optional(),
        category_id: z.coerce.number().positive().optional(),
        status: z.coerce.boolean().optional(),
        price_min: z.coerce.number().min(0).optional(),
        price_max: z.coerce.number().min(0).optional(),
        featured: z.coerce.boolean().optional(),
        in_stock: z.coerce.boolean().optional(),
        sortBy: z.enum(['id', 'name', 'price', 'created_at']).default('id'),
        sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// クライアント専用商品検索スキーマ（デフォルトlimit=50）
export const PublicFoodSearchSchema = z.object({
        page: z.coerce.number().min(1).default(1),
        limit: z.coerce.number().min(1).max(100).default(50), // クライアント用はデフォルト50
        category_id: z.coerce.number().positive().optional(),
        sortBy: z.enum(['id', 'name', 'price', 'created_at']).default('id'),
        sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// カテゴリー検索クエリバリデーションスキーマ
export const CategorySearchSchema = PaginationSchema.extend({
        search: z.string().max(100).optional(),
        status: z.coerce.boolean().optional(),
        include_count: z.coerce.boolean().optional(),
        has_foods: z.coerce.boolean().optional(),
        sortBy: z.enum(['id', 'name', 'created_at']).default('id'),
        sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// 型推論エクスポート
export type CreateFoodRequest = z.infer<typeof CreateFoodSchema>;
export type UpdateFoodRequest = z.infer<typeof UpdateFoodSchema>;
export type AddToCartRequest = z.infer<typeof AddToCartSchema>;
export type UpdateCartItemRequest = z.infer<typeof UpdateCartItemSchema>;
export type BatchUpdateCartRequest = z.infer<typeof BatchUpdateCartSchema>;
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;
export type PaginationQuery = z.infer<typeof PaginationSchema>;

// API使用向けクエリ型（必須フィールドをオプショナルに）
export type FoodSearchQuery = Partial<z.infer<typeof FoodSearchSchema>>;
export type CategorySearchQuery = Partial<z.infer<typeof CategorySearchSchema>>;