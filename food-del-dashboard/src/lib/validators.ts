import { z } from 'zod';
import { ERROR_MESSAGES } from './apiConstants';

/**
 * データバリデーション定義
 * サーバー仕様書に基づく型安全なバリデーション
 */

// 基本バリデーション
export const baseValidators = {
        // 文字列（必須）
        requiredString: (fieldName = 'この項目') =>
                z.string().min(1, `${fieldName}は必須です`),

        // 文字列（任意）
        optionalString: z.string().optional(),

        // メールアドレス
        email: z.string()
                .min(1, ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD)
                .email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL),

        // パスワード
        password: z.string()
                .min(8, ERROR_MESSAGES.VALIDATION.PASSWORD_TOO_SHORT),

        // 価格（正の数値）
        price: z.number()
                .positive(ERROR_MESSAGES.VALIDATION.INVALID_PRICE),

        // ID（正の整数）
        id: z.number().int().positive(),

        // 日付
        date: z.date(),

        // ブール値
        boolean: z.boolean(),
} as const;

// 認証関連バリデーション
export const authValidators = {
        // ログインリクエスト
        loginRequest: z.object({
                email: baseValidators.email,
                password: baseValidators.requiredString('パスワード'),
        }),

        // ユーザー登録リクエスト
        registerRequest: z.object({
                name: baseValidators.requiredString('名前'),
                email: baseValidators.email,
                password: baseValidators.password,
        }),

        // プロフィール更新リクエスト
        updateProfileRequest: z.object({
                name: baseValidators.optionalString,
                email: z.string().email(ERROR_MESSAGES.VALIDATION.INVALID_EMAIL).optional(),
        }),

        // パスワード変更リクエスト
        changePasswordRequest: z.object({
                current_password: baseValidators.requiredString('現在のパスワード'),
                new_password: baseValidators.password,
        }),
} as const;

// 商品関連バリデーション
export const foodValidators = {
        // 商品作成リクエスト
        createFoodRequest: z.object({
                name: baseValidators.requiredString('商品名'),
                description: baseValidators.optionalString,
                price: baseValidators.price,
                category_id: baseValidators.id,
                image: z.instanceof(File).optional(),
                available: baseValidators.boolean.default(true),
        }),

        // 商品更新リクエスト
        updateFoodRequest: z.object({
                name: baseValidators.optionalString,
                description: baseValidators.optionalString,
                price: z.number().positive().optional(),
                category_id: z.number().int().positive().optional(),
                available: baseValidators.boolean.optional(),
        }),

        // 商品クエリパラメータ
        foodQuery: z.object({
                page: z.number().int().positive().default(1),
                limit: z.number().int().positive().max(100).default(20),
                search: baseValidators.optionalString,
                category_id: z.number().int().positive().optional(),
                min_price: z.number().nonnegative().optional(),
                max_price: z.number().positive().optional(),
                available: baseValidators.boolean.optional(),
                sort_by: z.enum(['name', 'price', 'popular', 'newest']).default('name'),
                sort_order: z.enum(['asc', 'desc']).default('asc'),
        }),
} as const;

// カテゴリ関連バリデーション
export const categoryValidators = {
        // カテゴリ作成リクエスト
        createCategoryRequest: z.object({
                name: baseValidators.requiredString('カテゴリ名'),
                description: baseValidators.optionalString,
        }),

        // カテゴリ更新リクエスト
        updateCategoryRequest: z.object({
                name: baseValidators.optionalString,
                description: baseValidators.optionalString,
        }),
} as const;

// カート関連バリデーション
export const cartValidators = {
        // カートアイテム追加リクエスト
        addToCartRequest: z.object({
                food_id: baseValidators.id,
                quantity: z.number().int().positive('数量は1以上である必要があります'),
        }),

        // カートアイテム更新リクエスト
        updateCartItemRequest: z.object({
                quantity: z.number().int().positive('数量は1以上である必要があります'),
        }),
} as const;

// 注文関連バリデーション
export const orderValidators = {
        // 注文作成リクエスト
        createOrderRequest: z.object({
                delivery_address: baseValidators.requiredString('配送先住所'),
                delivery_phone: z.string().regex(/^[0-9-+\s()]*$/, '有効な電話番号を入力してください').optional(),
                notes: baseValidators.optionalString,
        }),

        // 注文ステータス更新リクエスト
        updateOrderStatusRequest: z.object({
                status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']),
        }),

        // 注文クエリパラメータ
        orderQuery: z.object({
                page: z.number().int().positive().default(1),
                limit: z.number().int().positive().max(100).default(20),
                status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED']).optional(),
                start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください').optional(),
                end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付はYYYY-MM-DD形式で入力してください').optional(),
        }),
} as const;

// バリデーション実行ヘルパー
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
        try {
                return schema.parse(data);
        } catch (error) {
                if (error instanceof z.ZodError) {
                        const zodError = error as z.ZodError;
                        const firstError = zodError.errors[0];
                        throw new Error(firstError?.message || ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD);
                }
                throw new Error(ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR);
        }
};

// 安全なバリデーション実行（エラー時はnull返却）
export const safeValidateData = <T>(schema: z.ZodSchema<T>, data: unknown): T | null => {
        try {
                return schema.parse(data);
        } catch {
                return null;
        }
};

// フィールド別バリデーション結果
export interface ValidationResult {
        isValid: boolean;
        errors: Record<string, string>;
}

// フォーム用バリデーション
export const validateForm = <T>(
        schema: z.ZodSchema<T>,
        data: unknown
): ValidationResult => {
        try {
                schema.parse(data);
                return { isValid: true, errors: {} };
        } catch (error) {
                if (error instanceof z.ZodError) {
                        const errors: Record<string, string> = {};
                        const zodError = error as z.ZodError;
                        zodError.errors.forEach((err) => {
                                const path = err.path.join('.');
                                errors[path] = err.message;
                        });
                        return { isValid: false, errors };
                }
                return {
                        isValid: false,
                        errors: { _general: ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR }
                };
        }
};