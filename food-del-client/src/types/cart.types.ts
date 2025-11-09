import type { Food } from './food.types';
import type { Category } from './category.types';

// カート基本情報
export interface Cart {
    id: number;
    user_id: number;
    created_at: Date | string;
    updated_at: Date | string;
}

// カートアイテム基本情報
export interface CartItem {
    id: number;
    cart_id: number;
    food_id: number;
    quantity: number;
}

// 商品情報付きカートアイテム
export interface CartItemWithFood extends CartItem {
    food: Food & { category: Category };
}

// 計算フィールド付きカートアイテム
export interface CartItemWithCalculatedFields extends CartItemWithFood {
    subtotal: number;
}

// カートアイテム付きカート
export interface CartWithItems extends Cart {
    cart_items: CartItemWithFood[];
}

// カートサマリー
export interface CartSummary {
    totalItems: number;
    totalAmount: number;
    itemCount: number;
}

// カートデータ
export interface CartData extends CartWithItems {
    summary: CartSummary;
}

// カート追加リクエスト
export interface AddToCartRequest {
    food_id: number;
    quantity: number;
}

// カート更新リクエスト
export interface UpdateCartItemRequest {
    quantity: number;
}

// バッチ更新リクエスト
export interface BatchUpdateCartRequest {
    items: Array<{
    cart_item_id: number;
    quantity: number;
    }>;
}

// UI表示用ビュー型
export interface CartViewModel extends CartData {
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    canCheckout: boolean;
}
