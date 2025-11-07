import { prisma } from '@/lib/prisma';
import type { Cart, CartItem, CartWithItems, CartSummary } from '@/types/cart';
import type { Food } from '@prisma/client';
import { InventoryService } from './inventoryService';
import { StockError, StockErrorHelper, InventoryError } from '@/errors/stockError';

/**
 * カートのビジネスロジックサービス
 * カートの作成、検索、更新、削除などの業務処理を提供します。
 */
export class CartService {

        // カートを検索・作成
        static async findOrCreateUserCart(userId: number): Promise<Cart> {
                let cart = await prisma.cart.findUnique({
                        where: { user_id: userId }
                });

                // カートが存在しない場合は新規作成
                if (!cart) {
                        cart = await prisma.cart.create({
                                data: { user_id: userId }
                        });
                }

                return cart;
        }

        // カートの完全な情報を取得
        static async getFullCartWithItems(userId: number): Promise<CartWithItems> {
                const cart = await this.findOrCreateUserCart(userId);

                // カートとそのアイテムを取得
                const fullCart = await prisma.cart.findUnique({
                        where: { id: cart.id },
                        include: {
                                cart_items: {
                                        include: {
                                                food: {
                                                        include: {
                                                                category: true
                                                        }
                                                }
                                        }
                                }
                        }
                });

                if (!fullCart) {
                        throw new Error('カートが見つかりません');
                }

                // CartWithItems型として返す (subtotalは呼び出し側で計算)
                const cartWithItems: CartWithItems = {
                        ...fullCart,
                        cart_items: fullCart.cart_items.map(item => ({
                                ...item,
                                food: item.food
                        }))
                };

                return cartWithItems;
        }

        // 商品をカートに追加（既存の場合は数量を更新）
        static async addFoodToCart(userId: number, foodId: number, quantity: number): Promise<CartItem> {
                try {
                        // 商品の存在確認
                        const food = await this.validateFoodAvailability(foodId);
                        if (!food) {
                                throw StockErrorHelper.createUnavailableError('不明な商品');
                        }

                        // 在庫状況を確認
                        const stockInfo = await InventoryService.getStockInfo(foodId);
                        if (!stockInfo) {
                                throw StockErrorHelper.createUnavailableError(food.name);
                        }

                        // カートを検索・作成
                        const cart = await this.findOrCreateUserCart(userId);

                        // 既存のアイテムを確認
                        const existingItem = await prisma.cartItem.findUnique({
                                where: {
                                        cart_id_food_id: {
                                                cart_id: cart.id,
                                                food_id: foodId
                                        }
                                }
                        });

                        const totalRequestQuantity = existingItem ? existingItem.quantity + quantity : quantity;

                        // 利用可能在庫をチェック
                        if (stockInfo.available < totalRequestQuantity) {
                                throw StockErrorHelper.createInsufficientStockError(
                                        food.name,
                                        totalRequestQuantity,
                                        stockInfo.available
                                );
                        }

                        // 在庫予約を実行
                        const reservationResult = await InventoryService.reserveStock(
                                foodId,
                                quantity,
                                userId,
                                `カート追加による在庫予約（数量: ${quantity}個）`
                        );

                        if (!reservationResult.success) {
                                throw StockErrorHelper.createInsufficientStockError(
                                        food.name,
                                        quantity,
                                        reservationResult.availableStock
                                );
                        }

                        try {
                                if (existingItem) {
                                        // 既存アイテムの数量を更新
                                        return await prisma.cartItem.update({
                                                where: { id: existingItem.id },
                                                data: { quantity: existingItem.quantity + quantity }
                                        });
                                } else {
                                        // 新しいアイテムを追加
                                        return await prisma.cartItem.create({
                                                data: {
                                                        cart_id: cart.id,
                                                        food_id: foodId,
                                                        quantity: quantity
                                                }
                                        });
                                }
                        } catch (cartError) {
                                // カート操作に失敗した場合は予約を解除
                                await InventoryService.releaseReservation(
                                        foodId,
                                        quantity,
                                        userId,
                                        'カート追加失敗による予約解除'
                                ).catch(() => {
                                        // 予約解除の失敗はログのみ（別途監視が必要）
                                        console.error(`Failed to release reservation for food ${foodId}, quantity ${quantity}`);
                                });
                                throw cartError;
                        }

                } catch (error: any) {
                        if (error instanceof StockError) {
                                throw error;
                        }
                        if (error instanceof InventoryError) {
                                throw new StockError(
                                        '不明な商品',
                                        quantity,
                                        0,
                                        'unavailable'
                                );
                        }
                        throw new Error(`カートへの追加に失敗しました: ${error?.message || 'Unknown error'}`);
                }
        }

        // カートアイテムの数量を更新
        static async updateCartItemQuantity(userId: number, itemId: number, quantity: number): Promise<CartItem | null> {
                try {
                        // 所有権を確認
                        const hasOwnership = await this.validateCartItemOwnership(userId, itemId);
                        if (!hasOwnership) {
                                return null;
                        }

                        // 現在のカートアイテム情報を取得
                        const currentItem = await prisma.cartItem.findUnique({
                                where: { id: itemId },
                                include: { food: true }
                        });

                        if (!currentItem) {
                                return null;
                        }

                        if (quantity <= 0) {
                                // 数量が0以下の場合はアイテムを削除し、予約を解除
                                await InventoryService.releaseReservation(
                                        currentItem.food_id,
                                        currentItem.quantity,
                                        userId,
                                        `カートアイテム削除による予約解除（数量: ${currentItem.quantity}個）`
                                );

                                await prisma.cartItem.delete({
                                        where: { id: itemId }
                                });
                                return null;
                        }

                        const quantityDifference = quantity - currentItem.quantity;

                        if (quantityDifference === 0) {
                                // 数量変更なしの場合はそのまま返す
                                return currentItem;
                        }

                        if (quantityDifference > 0) {
                                // 数量増加の場合：追加在庫を予約
                                const stockInfo = await InventoryService.getStockInfo(currentItem.food_id);
                                if (!stockInfo) {
                                        throw StockErrorHelper.createUnavailableError(currentItem.food.name);
                                }

                                // 利用可能在庫をチェック
                                if (stockInfo.available < quantityDifference) {
                                        throw StockErrorHelper.createInsufficientStockError(
                                                currentItem.food.name,
                                                quantityDifference,
                                                stockInfo.available
                                        );
                                }

                                // 追加分を予約
                                const reservationResult = await InventoryService.reserveStock(
                                        currentItem.food_id,
                                        quantityDifference,
                                        userId,
                                        `カート数量増加による追加予約（数量: ${quantityDifference}個）`
                                );

                                // 予約に失敗した場合はエラー
                                if (!reservationResult.success) {
                                        throw StockErrorHelper.createInsufficientStockError(
                                                currentItem.food.name,
                                                quantityDifference,
                                                reservationResult.availableStock
                                        );
                                }
                        } else {
                                // 数量減少の場合：余分な予約を解除
                                const releaseQuantity = Math.abs(quantityDifference);
                                await InventoryService.releaseReservation(
                                        currentItem.food_id,
                                        releaseQuantity,
                                        userId,
                                        `カート数量減少による予約解除（数量: ${releaseQuantity}個）`
                                );
                        }

                        // 数量を更新
                        return await prisma.cartItem.update({
                                where: { id: itemId },
                                data: { quantity: quantity }
                        });

                } catch (error: any) {
                        if (error instanceof StockError) {
                                throw error;
                        }
                        if (error instanceof InventoryError) {
                                throw new StockError(
                                        '不明な商品',
                                        quantity,
                                        0,
                                        'unavailable'
                                );
                        }
                        throw new Error(`カートアイテムの数量更新に失敗しました: ${error?.message || 'Unknown error'}`);
                }
        }

        // カートアイテムを削除
        static async removeCartItem(userId: number, itemId: number): Promise<boolean> {
                try {
                        // 所有権を確認
                        const hasOwnership = await this.validateCartItemOwnership(userId, itemId);
                        if (!hasOwnership) {
                                return false;
                        }

                        // 削除前にアイテム情報を取得
                        const cartItem = await prisma.cartItem.findUnique({
                                where: { id: itemId },
                                include: { food: true }
                        });

                        // アイテムが存在しない場合はfalseを返す
                        if (!cartItem) {
                                return false;
                        }

                        // 予約を解除
                        await InventoryService.releaseReservation(
                                cartItem.food_id,
                                cartItem.quantity,
                                userId,
                                `カートアイテム削除による予約解除（数量: ${cartItem.quantity}個）`
                        );

                        // アイテムを削除
                        await prisma.cartItem.delete({
                                where: { id: itemId }
                        });

                        return true;

                } catch (error) {
                        console.error(`カートアイテム削除エラー (itemId: ${itemId}, userId: ${userId}):`, error);
                        return false;
                }
        }

        // カートをクリア
        static async clearUserCart(userId: number): Promise<number> {
                try {
                        const cart = await prisma.cart.findUnique({
                                where: { user_id: userId },
                                include: {
                                        cart_items: {
                                                include: { food: true }
                                        }
                                }
                        });

                        // カートが存在しないか、アイテムが空の場合は0を返す
                        if (!cart || cart.cart_items.length === 0) {
                                return 0;
                        }

                        // 各アイテムの予約を解除
                        for (const item of cart.cart_items) {
                                try {
                                        await InventoryService.releaseReservation(
                                                item.food_id,
                                                item.quantity,
                                                userId,
                                                `カート全削除による予約解除（数量: ${item.quantity}個）`
                                        );
                                } catch (error) {
                                        console.error(`予約解除エラー for item ${item.id}:`, error);
                                        // 個別のエラーはログのみで続行
                                }
                        }

                        // カート内の全アイテムを削除
                        const result = await prisma.cartItem.deleteMany({
                                where: { cart_id: cart.id }
                        });

                        return result.count;

                } catch (error: any) {
                        console.error(`カートクリアエラー (userId: ${userId}):`, error);
                        throw new Error(`カートのクリアに失敗しました: ${error?.message || 'Unknown error'}`);
                }
        }

        // カートのサマリーを計算
        static calculateCartSummary(cart: CartWithItems): CartSummary {
                const totalItems = cart.cart_items.reduce((sum, item) => sum + item.quantity, 0);
                const totalAmount = cart.cart_items.reduce((sum, item) => sum + (item.food.price * item.quantity), 0);
                const itemCount = cart.cart_items.length;

                return {
                        totalItems,
                        totalAmount,
                        itemCount
                };
        }

        // 商品の存在と利用可能性を検証
        static async validateFoodAvailability(foodId: number): Promise<Food | null> {
                const food = await prisma.food.findUnique({
                        where: { id: foodId }
                });

                // 商品が存在しないか、利用不可の場合はnullを返す
                if (!food || !food.status) {
                        return null;
                }

                return food;
        }

        // カートアイテムの所有権を検証
        static async validateCartItemOwnership(userId: number, itemId: number): Promise<boolean> {
                const cartItem = await prisma.cartItem.findUnique({
                        where: { id: itemId },
                        include: { cart: true }
                });

                return cartItem?.cart.user_id === userId;
        }
}