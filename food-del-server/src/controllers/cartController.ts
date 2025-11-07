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

/**
 * カートコントローラー
 * カート関連のAPI処理を担当します。
 */


/**
 * カート取得
 *
 * 認証済みユーザーのカート情報を取得する。
 * カートアイテムの詳細情報と合計金額、アイテム数などのサマリー情報を返す。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 * @param res - カート情報とサマリー（アイテム数、合計金額など）
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. カートの完全な情報（アイテムを含む）を取得
 * 3. カートサマリー情報を計算（合計金額、アイテム数など）
 * 4. カート情報とサマリーを含めてレスポンス
 *
 * @example
 * GET /api/cart
 * Authorization: Bearer <token>
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "message": "カートを取得しました",
 *   "data": {
 *     "id": 1,
 *     "cart_items": [...],
 *     "summary": {
 *       "totalItems": 3,
 *       "totalAmount": 5000,
 *       "itemCount": 3
 *     }
 *   }
 * }
 */
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

/**
 * 商品をカートに追加
 *
 * 認証済みユーザーのカートに商品を追加する。
 * 既に同じ商品がカートにある場合は数量が加算される。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - body.food_id: number - 追加する商品ID（必須）
 *   - body.quantity: number - 追加する数量（必須、>0）
 * @param res - 追加されたカートアイテムとサマリー情報
 * @returns void
 *
 * @throws 400 - food_idまたはquantityが不足 または quantityが0以下
 * @throws 404 - 商品が見つからないか利用できない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. リクエストボディからfood_idとquantityを取得
 * 3. パラメータを検証（food_id存在、quantity > 0）
 * 4. Service層でカートに商品を追加
 * 5. 更新後のカート情報を取得
 * 6. カートサマリー情報を計算
 * 7. 新しいアイテムとサマリーをレスポンス
 *
 * @example
 * POST /api/cart
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "food_id": 5,
 *   "quantity": 2
 * }
 */
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

/**
 * カートアイテム数量更新
 *
 * カート内の商品の数量を更新する。
 * quantity = 0の場合、そのアイテムは削除される。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - params.id: string - カートアイテムID（URLパラメータ）（必須）
 *   - body.quantity: number - 新しい数量（0以上）（必須）
 * @param res - 更新されたカートアイテムとサマリー情報
 * @returns void
 *
 * @throws 400 - アイテムIDが不足 または 無効なID形式 または quantityが無効
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. URLパラメータからアイテムIDを抽出
 * 3. リクエストボディからquantityを取得
 * 4. パラメータを検証（ID有効、quantity >= 0）
 * 5. Service層でカートアイテムを更新
 * 6. quantity = 0の場合、アイテムは削除される
 * 7. 更新後のカート情報を取得
 * 8. カートサマリー情報を計算
 * 9. 更新されたアイテムとサマリーをレスポンス
 *
 * @example
 * PUT /api/cart/items/10
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "quantity": 3
 * }
 */
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

/**
 * カートアイテム削除
 *
 * カート内の特定のアイテムを削除する。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - params.id: string - カートアイテムID（URLパラメータ）（必須）
 * @param res - 更新後のカートサマリー情報
 * @returns void
 *
 * @throws 400 - アイテムIDが不足 または 無効なID形式
 * @throws 404 - カートアイテムが見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. URLパラメータからアイテムIDを抽出
 * 3. アイテムIDの有効性確認
 * 4. Service層でアイテムを削除
 * 5. 削除成功確認
 * 6. 更新後のカート情報を取得
 * 7. カートサマリー情報を計算
 * 8. サマリー情報をレスポンス
 *
 * @example
 * DELETE /api/cart/items/10
 * Authorization: Bearer <token>
 */
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

/**
 * カートクリア
 *
 * カート内のすべてのアイテムを削除する。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 * @param res - クリアされたアイテム数とサマリー情報
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. Service層でユーザーのカートをすべてクリア
 * 3. クリアされたアイテム数を取得
 * 4. 空のカートサマリーを作成
 * 5. クリア結果をレスポンス
 *
 * @example
 * DELETE /api/cart
 * Authorization: Bearer <token>
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "message": "カートをクリアしました",
 *   "data": {
 *     "clearedItems": 3,
 *     "summary": {
 *       "totalItems": 0,
 *       "totalAmount": 0,
 *       "itemCount": 0
 *     }
 *   }
 * }
 */
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

/**
 * チェックアウト（注文作成）
 *
 * カート内の商品からを注文を作成する。
 * カートが空でないこと、配送先情報などが必須。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - body - CreateOrderRequest: 注文作成に必要な配送先などの情報
 * @param res - 作成された注文情報
 * @returns void
 *
 * @throws 400 - カートが空 または 配送先情報が不足
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. ユーザーのカート情報を取得
 * 3. カートが空でないか確認
 * 4. リクエストボディから注文情報を取得
 * 5. Service層でカートから注文を作成
 * 6. 在庫を予約し、配送情報を登録
 * 7. 作成された注文情報をレスポンス
 *
 * @example
 * POST /api/cart/checkout
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "delivery_address": "東京都渋谷区",
 *   "delivery_contact": "090-xxxx-xxxx",
 *   "notes": "時間指定なし"
 * }
 */
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