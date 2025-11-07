import type { Cart as PrismaCart, CartItem as PrismaCartItem, Food, Category } from '@prisma/client';

// Prismaカート型
export type Cart = PrismaCart;

// Prismaカートアイテム型
export type CartItem = PrismaCartItem;

// 商品情報付きカートアイテム型 (subtotalは実行時計算)
export interface CartItemWithFood extends CartItem {
        food: Food & { category: Category };
}

// 実行時計算フィールド付きカートアイテム型
export interface CartItemWithCalculatedFields extends CartItemWithFood {
        subtotal: number;  // quantity * price の計算結果
}

// カートアイテム付きカート型
export interface CartWithItems extends Cart {
        cart_items: CartItemWithFood[];
}

// カートサマリー型
export interface CartSummary {
        totalItems: number;    // 合計商品数
        totalAmount: number;   // 合計金額
        itemCount: number;     // 商品の種類数
}

// カートデータ型（合計金額・合計件数付き）
export interface CartData extends CartWithItems {
        summary: CartSummary;
}

// リクエスト型はZodから推論（validation.tsを参照）
export type {
        AddToCartRequest,
        UpdateCartItemRequest,
        BatchUpdateCartRequest
} from './utils/validation';