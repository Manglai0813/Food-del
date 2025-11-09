import { prisma } from '@/lib/prisma';
import type { Prisma, InventoryHistory } from '@prisma/client';

// 在庫サービスクラス
export class InventoryService {
    // 在庫変更の種別
    static readonly CHANGE_TYPES = {
        ADD: 'add',           // 在庫追加
        SUBTRACT: 'subtract', // 在庫減算
        RESERVE: 'reserve',   // 在庫予約
        RELEASE: 'release'    // 予約解除
    } as const;

    // 在庫更新
    static async updateStock(
        foodId: number,
        quantity: number,
        operation: 'add' | 'subtract',
        options: {
            orderId?: number;
            userId: number;
            note?: string;
            maxRetries?: number;
        }
    ): Promise<{ success: boolean; newStock: number; version: number }> {
        const { orderId, userId, note, maxRetries = 3 } = options;
        let retries = 0;

        while (retries < maxRetries) {
            try {
                return await prisma.$transaction(async (tx) => {
                    // 現在のバージョンで商品取得
                    const food = await tx.food.findUnique({
                        where: { id: foodId },
                        select: {
                            id: true,
                            name: true,
                            stock: true,
                            reserved: true,
                            version: true,
                            status: true
                        }
                    });

                    if (!food) {
                        throw new Error('商品が見つかりません');
                    }

                    if (!food.status) {
                        throw new Error('商品が利用できません');
                    }

                    // 新しい在庫数を計算
                    const newStock = operation === 'add'
                        ? food.stock + quantity
                        : food.stock - quantity;

                    if (newStock < 0) {
                        throw new Error(`在庫が不足しています。利用可能在庫: ${food.stock}個`);
                    }

                    // 予約済み在庫を超えないようチェック
                    if (newStock < food.reserved) {
                        throw new Error(`予約済み在庫を下回ることはできません。予約済み: ${food.reserved}個`);
                    }

                    // バージョンチェック付きで更新
                    const updatedFood = await tx.food.updateMany({
                        where: {
                            id: foodId,
                            version: food.version
                        },
                        data: {
                            stock: newStock,
                            version: food.version + 1
                        }
                    });

                    // 更新されなかった場合は競合発生
                    if (updatedFood.count === 0) {
                        throw new Error('CONCURRENT_UPDATE');
                    }

                    // 在庫履歴を記録
                    await this.recordInventoryChange(tx, {
                        foodId,
                        changeType: operation,
                        quantity,
                        previousStock: food.stock,
                        newStock,
                        orderId,
                        createdBy: userId,
                        note: note || `在庫${operation === 'add' ? '追加' : '減算'}: ${quantity}個`
                    });

                    return {
                        success: true,
                        newStock,
                        version: food.version + 1
                    };
                });

            } catch (error: unknown) {
                if (error instanceof Error && error.message === 'CONCURRENT_UPDATE' && retries < maxRetries - 1) {
                    retries++;
                    // 短時間待機してリトライ
                    const delay = Math.random() * Math.pow(2, retries) * 50;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    continue;
                }
                throw error;
            }
        }

        throw new Error('並行更新の競合により操作に失敗しました');
    }

    // 在庫予約
    static async reserveStock(
        foodId: number,
        quantity: number,
        userId: number,
        note?: string
    ): Promise<{ success: boolean; availableStock: number }> {
        return await prisma.$transaction(async (tx) => {
            // 悲観的ロックで食品を取得
            const [food] = await tx.$queryRaw<Array<{
                id: number;
                stock: number;
                reserved: number;
                status: boolean;
                name: string;
            }>>`
    SELECT id, stock, reserved, status, name
    FROM foods
    WHERE id = ${foodId}
    FOR UPDATE
    `;

            if (!food) {
                throw new Error('商品が見つかりません');
            }

            if (!food.status) {
                throw new Error('商品が利用できません');
            }

            // 利用可能在庫を計算
            const availableStock = food.stock - food.reserved;

            if (availableStock < quantity) {
                throw new Error(
                    `在庫不足です。利用可能在庫: ${availableStock}個、リクエスト: ${quantity}個`
                );
            }

            // 予約在庫を増加
            await tx.food.update({
                where: { id: foodId },
                data: {
                    reserved: food.reserved + quantity
                }
            });

            // 履歴記録
            await this.recordInventoryChange(tx, {
                foodId,
                changeType: this.CHANGE_TYPES.RESERVE,
                quantity,
                previousStock: food.stock,
                newStock: food.stock,
                createdBy: userId,
                note: note || `在庫予約: ${quantity}個`
            });

            return {
                success: true,
                availableStock: availableStock - quantity
            };
        });
    }

    // 予約解除
    static async releaseReservation(
        foodId: number,
        quantity: number,
        userId: number,
        note?: string
    ): Promise<{ success: boolean; availableStock: number }> {
        return await prisma.$transaction(async (tx) => {
            const food = await tx.food.findUnique({
                where: { id: foodId },
                select: { stock: true, reserved: true, status: true }
            });

            if (!food) {
                throw new Error('商品が見つかりません');
            }

            if (food.reserved < quantity) {
                throw new Error(`予約解除数量が予約済み数量を超えています。予約済み: ${food.reserved}個`);
            }

            // 予約在庫を減少
            await tx.food.update({
                where: { id: foodId },
                data: {
                    reserved: food.reserved - quantity
                }
            });

            // 履歴記録
            await this.recordInventoryChange(tx, {
                foodId,
                changeType: this.CHANGE_TYPES.RELEASE,
                quantity,
                previousStock: food.stock,
                newStock: food.stock,
                createdBy: userId,
                note: note || `予約解除: ${quantity}個`
            });

            return {
                success: true,
                availableStock: food.stock - (food.reserved - quantity)
            };
        });
    }

    // 注文確定による在庫減算
    static async confirmReservation(
        foodId: number,
        quantity: number,
        orderId: number,
        userId: number,
        tx?: Prisma.TransactionClient
    ): Promise<{ success: boolean; newStock: number }> {
        const executeWithTx = async (transaction: Prisma.TransactionClient) => {
            const food = await transaction.food.findUnique({
                where: { id: foodId },
                select: { stock: true, reserved: true, version: true }
            });

            if (!food) {
                throw new Error('商品が見つかりません');
            }

            if (food.reserved < quantity) {
                throw new Error(`確定数量が予約済み数量を超えています。予約済み: ${food.reserved}個`);
            }

            // 新しい在庫と予約数を計算
            const newStock = food.stock - quantity;
            const newReserved = food.reserved - quantity;

            // 在庫と予約を同時に減算
            await transaction.food.update({
                where: { id: foodId },
                data: {
                    stock: newStock,
                    reserved: newReserved,
                    version: food.version + 1
                }
            });

            // 履歴記録
            await this.recordInventoryChange(transaction, {
                foodId,
                changeType: this.CHANGE_TYPES.SUBTRACT,
                quantity,
                previousStock: food.stock,
                newStock,
                orderId,
                createdBy: userId,
                note: `注文確定による在庫減算（注文ID: ${orderId}）`
            });

            return {
                success: true,
                newStock
            };
        };

        // トランザクション内で実行
        if (tx) {
            return await executeWithTx(tx);
        } else {
            return await prisma.$transaction(executeWithTx);
        }
    }

    // 在庫情報取得
    static async getStockInfo(foodId: number): Promise<{
        stock: number;
        reserved: number;
        available: number;
        minStock: number;
        isLowStock: boolean;
    } | null> {
        const food = await prisma.food.findUnique({
            where: { id: foodId },
            select: {
                stock: true,
                reserved: true,
                min_stock: true
            }
        });

        if (!food) {
            return null;
        }

        // 利用可能在庫を計算
        const available = food.stock - food.reserved;
        const isLowStock = food.stock <= food.min_stock;

        return {
            stock: food.stock,
            reserved: food.reserved,
            available,
            minStock: food.min_stock,
            isLowStock
        };
    }

    // 在庫履歴取得
    static async getInventoryHistory(
        foodId: number,
        options: {
            limit?: number;
            offset?: number;
            changeType?: string;
            orderId?: number;
        } = {}
    ): Promise<InventoryHistory[]> {
        const { limit = 50, offset = 0, changeType, orderId } = options;

        const where: Prisma.InventoryHistoryWhereInput = { food_id: foodId };

        if (changeType) {
            where.change_type = changeType;
        }

        if (orderId) {
            where.order_id = orderId;
        }

        return await prisma.inventoryHistory.findMany({
            where,
            include: {
                created_by_user: {
                    select: { id: true, name: true, role: true }
                },
                order: {
                    select: { id: true, status: true }
                }
            },
            orderBy: { created_at: 'desc' },
            take: limit,
            skip: offset
        });
    }

    private static async recordInventoryChange(
        tx: Prisma.TransactionClient,
        data: {
            foodId: number;
            changeType: string;
            quantity: number;
            previousStock: number;
            newStock: number;
            orderId?: number;
            createdBy: number;
            note?: string;
        }
    ): Promise<void> {
        await tx.inventoryHistory.create({
            data: {
                food_id: data.foodId,
                change_type: data.changeType,
                quantity: data.quantity,
                previous_stock: data.previousStock,
                new_stock: data.newStock,
                order_id: data.orderId,
                created_by: data.createdBy,
                note: data.note
            }
        });
    }

    // 全商品の在庫状況取得
    static async getAllStockStatus(
        options: {
            lowStockOnly?: boolean;
            limit?: number;
            offset?: number;
        } = {}
    ): Promise<Array<{
        id: number;
        name: string;
        stock: number;
        reserved: number;
        available: number;
        minStock: number;
        isLowStock: boolean;
        status: boolean;
    }>> {
        const { lowStockOnly = false, limit = 100, offset = 0 } = options;

        const foods = await prisma.food.findMany({
            select: {
                id: true,
                name: true,
                stock: true,
                reserved: true,
                min_stock: true,
                status: true
            },
            take: limit,
            skip: offset,
            orderBy: { name: 'asc' }
        });

        const stockStatus = foods.map(food => {
            const available = food.stock - food.reserved;
            const isLowStock = food.stock <= food.min_stock;

            return {
                id: food.id,
                name: food.name,
                stock: food.stock,
                reserved: food.reserved,
                available,
                minStock: food.min_stock,
                isLowStock,
                status: food.status
            };
        });

        // 低在庫のみフィルタ
        if (lowStockOnly) {
            return stockStatus.filter(item => item.isLowStock);
        }

        return stockStatus;
    }
}