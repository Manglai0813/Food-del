import type { Response } from 'express';
import { CartService } from '@/services/cartService';
import { OrderService } from '@/services/orderService';
import type {
    AuthRequest,
    ApiResponse,
    CartItem,
    CartSummary,
    CartData,
    AddToCartRequest,
    UpdateCartItemRequest,
    OrderData,
    CreateOrderRequest
} from '@/types';

// カートを取得
export const getCart = async (req: AuthRequest, res: Response<ApiResponse<CartData> | ApiResponse<null>>): Promise<void> => {
    try {
        // ユーザーIDを取得
        const userId = req.user!.id;

        // カートの完全な情報を取得
        const cart = await CartService.getFullCartWithItems(userId);

        // サマリー情報を計算
        const summary = CartService.calculateCartSummary(cart);

        // レスポンスデータを構築
        const cartData: CartData = {
            ...cart,
            summary
        };

        res.status(200).json({
            success: true,
            message: cart.cart_items.length > 0 ? "カートを取得しました" : "カートは空です",
            data: cartData
        } as ApiResponse<CartData>);
    } catch (error) {
        console.error('カート取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "カートの取得に失敗しました"
        } as ApiResponse<null>);
    }
};

// カートに商品を追加
export const addToCart = async (req: AuthRequest, res: Response<ApiResponse<{ cartItem: CartItem; summary: CartSummary }> | ApiResponse<null>>): Promise<void> => {
    try {
        // ユーザーIDを取得
        const userId = req.user!.id;

        // リクエストボディからデータを取得
        const { food_id, quantity }: AddToCartRequest = req.body;

        // リクエストデータ検証
        if (!food_id || !quantity || quantity <= 0) {
            res.status(400).json({
                success: false,
                message: "無効なリクエストデータです",
                errors: ["food_id と quantity (>0) が必須です"]
            } as ApiResponse<null>);
            return;
        }

        // 商品をカートに追加
        const cartItem = await CartService.addFoodToCart(userId, food_id, quantity);

        // 更新後のカート情報を取得
        const updatedCart = await CartService.getFullCartWithItems(userId);

        // サマリー情報を計算
        const summary = CartService.calculateCartSummary(updatedCart);

        res.status(200).json({
            success: true,
            message: "商品をカートに追加しました",
            data: {
                cartItem,
                summary
            }
        } as ApiResponse<any>);
    } catch (error) {
        console.error('カート追加エラー:', error);

        if (error instanceof Error && error.message === '商品が見つからないか利用できません') {
            res.status(404).json({
                success: false,
                message: "商品が見つからないか利用できません"
            } as ApiResponse<null>);
            return;
        }

        res.status(500).json({
            success: false,
            message: "カートへの追加に失敗しました"
        } as ApiResponse<null>);
    }
};

// カートアイテムの数量を更新
export const updateCartItem = async (req: AuthRequest, res: Response<ApiResponse<{ cartItem: CartItem; summary: CartSummary }> | ApiResponse<{ summary: CartSummary }> | ApiResponse<null>>): Promise<void> => {
    try {
        // ユーザーIDを取得
        const userId = req.user!.id;

        // パスパラメータとリクエストボディからデータを取得
        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "アイテムIDが必要です"
            } as ApiResponse<null>);
            return;
        }
        const itemId = parseInt(req.params.id);

        // リクエストボディから数量を取得
        const { quantity }: UpdateCartItemRequest = req.body;

        // パラメータ検証
        if (isNaN(itemId) || !quantity || quantity < 0) {
            res.status(400).json({
                success: false,
                message: "無効なパラメータです",
                errors: ["有効なアイテムIDと数量が必要です"]
            } as ApiResponse<null>);
            return;
        }

        // 数量を更新
        const updatedItem = await CartService.updateCartItemQuantity(userId, itemId, quantity);

        if (updatedItem === null) {
            // アイテムが見つからないか削除された場合
            const cart = await CartService.getFullCartWithItems(userId);

            // サマリー情報を計算
            const summary = CartService.calculateCartSummary(cart);

            res.status(200).json({
                success: true,
                message: quantity === 0 ? "アイテムが削除されました" : "アイテムが見つかりません",
                data: { summary }
            } as ApiResponse<{ summary: CartSummary }>);
            return;
        }

        // 更新後のカート情報を取得
        const updatedCart = await CartService.getFullCartWithItems(userId);

        // サマリー情報を計算
        const summary = CartService.calculateCartSummary(updatedCart);

        res.status(200).json({
            success: true,
            message: "カートアイテムを更新しました",
            data: {
                cartItem: updatedItem,
                summary
            }
        } as ApiResponse<{ cartItem: CartItem; summary: CartSummary }>);
    } catch (error) {
        console.error('カート更新エラー:', error);
        res.status(500).json({
            success: false,
            message: "カートアイテムの更新に失敗しました"
        } as ApiResponse<null>);
    }
};

// カートアイテムを削除
export const removeCartItem = async (req: AuthRequest, res: Response<ApiResponse<{ summary: CartSummary }> | ApiResponse<null>>): Promise<void> => {
    try {
        // ユーザーIDを取得
        const userId = req.user!.id;

        // パスパラメータからアイテムIDを取得
        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "アイテムIDが必要です"
            } as ApiResponse<null>);
            return;
        }
        const itemId = parseInt(req.params.id);

        // パラメータ検証
        if (isNaN(itemId)) {
            res.status(400).json({
                success: false,
                message: "無効なアイテムIDです"
            } as ApiResponse<null>);
            return;
        }

        // アイテムを削除
        const isRemoved = await CartService.removeCartItem(userId, itemId);

        if (!isRemoved) {
            res.status(404).json({
                success: false,
                message: "カートアイテムが見つかりません"
            } as ApiResponse<null>);
            return;
        }

        // 更新後のカート情報を取得
        const updatedCart = await CartService.getFullCartWithItems(userId);

        // サマリー情報を計算
        const summary = CartService.calculateCartSummary(updatedCart);

        res.status(200).json({
            success: true,
            message: "カートアイテムを削除しました",
            data: { summary }
        } as ApiResponse<{ summary: CartSummary }>);
    } catch (error) {
        console.error('カートアイテム削除エラー:', error);
        res.status(500).json({
            success: false,
            message: "カートアイテムの削除に失敗しました"
        } as ApiResponse<null>);
    }
};

// カートをクリア
export const clearCart = async (req: AuthRequest, res: Response<ApiResponse<{ clearedItems: number; summary: CartSummary }> | ApiResponse<null>>): Promise<void> => {
    try {
        // ユーザーIDを取得
        const userId = req.user!.id;

        // カートをクリア
        const clearedCount = await CartService.clearUserCart(userId);

        res.status(200).json({
            success: true,
            message: clearedCount > 0 ? "カートをクリアしました" : "カートは既に空です",
            data: {
                clearedItems: clearedCount,
                summary: {
                    totalItems: 0,
                    totalAmount: 0,
                    itemCount: 0
                }
            }
        } as ApiResponse<{ clearedItems: number; summary: CartSummary }>);
    } catch (error) {
        console.error('カートクリアエラー:', error);
        res.status(500).json({
            success: false,
            message: "カートのクリアに失敗しました"
        } as ApiResponse<null>);
    }
};

// チェックアウト
export const checkout = async (req: AuthRequest, res: Response<ApiResponse<OrderData> | ApiResponse<null>>): Promise<void> => {
    try {
        // ユーザーIDを取得
        const userId = req.user!.id;

        // カート情報を取得
        const cart = await CartService.getFullCartWithItems(userId);

        if (cart.cart_items.length === 0) {
            res.status(400).json({
                success: false,
                message: "カートが空です"
            } as ApiResponse<null>);
            return;
        }

        // カートから注文を作成
        const orderRequest = req.body as CreateOrderRequest;
        const order = await OrderService.createOrderFromCart(userId, orderRequest);

        res.status(201).json({
            success: true,
            message: "注文が正常に作成されました",
            data: order
        } as ApiResponse<OrderData>);
    } catch (error) {
        console.error('チェックアウトエラー:', error);
        res.status(500).json({
            success: false,
            message: "チェックアウトに失敗しました"
        } as ApiResponse<null>);
    }
};