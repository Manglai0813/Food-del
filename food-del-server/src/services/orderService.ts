import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
    OrderData,
    OrderItemData,
    OrderPreview,
    AdminOrderPreview,
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    CancelOrderRequest,
    OrderQuery,
    OrderStatsData,
    OrderStatusHistory,
    PaginatedData
} from '@/types';
import { OrderStatus } from '@/types';
import { CartService } from './cartService';
import { InventoryService } from './inventoryService';
import { StockError, StockErrorHelper, InventoryError } from '@/errors/stockError';

// 注文サービスクラス
export class OrderService {

    // カートから注文を作成
    static async createOrderFromCart(
        userId: number,
        orderRequest: CreateOrderRequest
    ): Promise<OrderData> {
        try {
            return await prisma.$transaction(async (tx) => {
                // ユーザーのカートを取得
                const userCart = await CartService.getFullCartWithItems(userId);

                // カートが空でないことを確認
                if (!userCart.cart_items.length) {
                    throw new Error('カートが空です');
                }

                // 各アイテムの在庫状況を再確認
                const stockValidationErrors: string[] = [];
                for (const item of userCart.cart_items) {
                    const stockInfo = await InventoryService.getStockInfo(item.food_id);
                    if (!stockInfo) {
                        stockValidationErrors.push(`${item.food.name}の在庫情報が取得できません`);
                        continue;
                    }

                    // 予約済み在庫が注文数量を満たしているかチェック
                    if (stockInfo.reserved < item.quantity) {
                        stockValidationErrors.push(
                            `${item.food.name}の予約在庫が不足しています（必要: ${item.quantity}個、予約済み: ${stockInfo.reserved}個）`
                        );
                    }

                    // 総在庫も確認
                    if (stockInfo.stock < item.quantity) {
                        stockValidationErrors.push(
                            `${item.food.name}の在庫が不足しています（必要: ${item.quantity}個、在庫: ${stockInfo.stock}個）`
                        );
                    }
                }

                // 在庫エラーがある場合は処理を中止
                if (stockValidationErrors.length > 0) {
                    throw new Error(`在庫不足により注文を作成できません:\n${stockValidationErrors.join('\n')}`);
                }

                // 注文総額を計算
                const totalAmount = userCart.cart_items.reduce((sum, item) => {
                    return sum + (item.food.price * item.quantity);
                }, 0);

                // 注文を作成
                const order = await tx.order.create({
                    data: {
                        user_id: userId,
                        total_amount: totalAmount,
                        delivery_address: orderRequest.delivery_address,
                        phone: orderRequest.phone,
                        notes: orderRequest.notes,
                        status: OrderStatus.PENDING
                    }
                });

                // 注文アイテムを作成し、在庫予約を確定
                const orderItems = await Promise.all(
                    userCart.cart_items.map(async (item) => {
                        // 予約を確定（実際の在庫から減算）
                        const confirmResult = await InventoryService.confirmReservation(
                            item.food_id,
                            item.quantity,
                            order.id,
                            userId,
                            tx
                        );

                        if (!confirmResult.success) {
                            throw new Error(`${item.food.name}の在庫確定に失敗しました`);
                        }

                        // 注文アイテムを作成
                        return await tx.orderItem.create({
                            data: {
                                order_id: order.id,
                                food_id: item.food_id,
                                quantity: item.quantity,
                                price: item.food.price
                            }
                        });
                    })
                );

                // カートをクリア
                await tx.cartItem.deleteMany({
                    where: { cart_id: userCart.id }
                });

                // 完全な注文データを構築
                const orderData = await this.buildOrderData(order.id, tx);
                return orderData;
            });

        } catch (error: unknown) {
            if (error instanceof StockError) {
                throw error;
            }
            if (error instanceof InventoryError) {
                throw new Error(`在庫管理エラー: ${error.message}`);
            }
            if (error instanceof Error) {
                throw new Error(`注文作成に失敗しました: ${error.message}`);
            }
            throw new Error('注文作成に失敗しました: Unknown error');
        }
    }

    // ユーザーの注文リストを取得
    static async getUserOrders(
        userId: number,
        query: OrderQuery
    ): Promise<PaginatedData<OrderPreview>> {
        const {
            page = 1,
            limit = 10,
            status,
            date_from,
            date_to,
            sortBy = 'order_date',
            sortOrder = 'desc'
        } = query;

        // 基本のフィルタ条件
        const where: Prisma.OrderWhereInput = { user_id: userId };

        // ステータスフィルタ
        if (status) {
            where.status = status;
        }

        // 日付範囲フィルタ
        if (date_from || date_to) {
            where.order_date = {};
            if (date_from) where.order_date.gte = new Date(date_from);
            if (date_to) where.order_date.lte = new Date(date_to);
        }

        // ページネーションとソート設定
        const skip = (page - 1) * limit;

        // 動的なソート設定
        const orderBy: Prisma.OrderOrderByWithRelationInput = {
            [sortBy]: sortOrder
        } as Prisma.OrderOrderByWithRelationInput;

        // 並列でデータと総数を取得
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    order_items: {
                        include: {
                            food: {
                                select: {
                                    name: true,
                                    image_path: true
                                }
                            }
                        },
                        take: 3 // プレビュー用に最初の3アイテムのみ
                    }
                }
            }),
            prisma.order.count({ where })
        ]);

        // プレビューデータに変換
        const orderPreviews: OrderPreview[] = orders.map(order => ({
            id: order.id,
            total_amount: order.total_amount,
            status: order.status as OrderStatus,
            delivery_address: order.delivery_address,
            phone: order.phone,
            order_date: order.order_date,
            updated_at: order.updated_at,
            items_preview: order.order_items.map(item => ({
                food_name: item.food.name,
                quantity: item.quantity,
                image_path: item.food.image_path
            })),
            summary: {
                itemCount: order.order_items.length,
                totalQuantity: order.order_items.reduce((sum, item) => sum + item.quantity, 0)
            }
        }));

        // 総ページ数を計算
        const totalPages = Math.ceil(total / limit);

        return {
            data: orderPreviews,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    // 注文詳細を取得
    static async getOrderById(orderId: number, userId?: number): Promise<OrderData | null> {
        // 注文を取得
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                order_items: {
                    include: {
                        food: {
                            include: {
                                category: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    }
                },
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            }
        });

        // 注文が存在しない場合はnullを返す
        if (!order) return null;

        // ユーザーIDが指定されている場合は所有権をチェック
        if (userId && order.user_id !== userId) {
            return null;
        }

        return this.transformToOrderData(order);
    }

    // 注文をキャンセル
    static async cancelOrder(
        orderId: number,
        userId: number,
        cancelData: CancelOrderRequest
    ): Promise<OrderData | null> {
        try {
            return await prisma.$transaction(async (tx) => {
                // 所有権と取消可能性を検証
                const order = await tx.order.findUnique({
                    where: { id: orderId, user_id: userId },
                    include: {
                        order_items: {
                            include: { food: true }
                        }
                    }
                });

                // 注文が存在しない場合
                if (!order) {
                    throw new Error('注文が見つかりません');
                }

                // キャンセル可能なステータスか確認
                if (!this.canCancelOrder(order.status as OrderStatus)) {
                    throw new Error('この注文はキャンセルできません');
                }

                // 在庫を復元（注文確定済みの場合のみ）
                for (const item of order.order_items) {
                    try {
                        await InventoryService.updateStock(
                            item.food_id,
                            item.quantity,
                            'add',
                            {
                                orderId: orderId,
                                userId: userId,
                                note: `注文キャンセルによる在庫復元（注文ID: ${orderId}）`
                            }
                        );
                    } catch (inventoryError) {
                        console.error(`在庫復元エラー for food ${item.food_id}:`, inventoryError);
                        // 在庫復元エラーは警告として扱い、キャンセル自体は続行
                    }
                }

                // 履歴にキャンセル記録を追加
                await tx.orderStatusHistory.create({
                    data: {
                        order_id: orderId,
                        previous_status: order.status,
                        new_status: OrderStatus.CANCELLED,
                        updated_by: userId,
                        note: cancelData.reason ? `キャンセル理由: ${cancelData.reason}` : undefined
                    }
                });

                // 注文ステータスを更新
                await tx.order.update({
                    where: { id: orderId },
                    data: {
                        status: OrderStatus.CANCELLED,
                        notes: cancelData.reason ?
                            `${order.notes || ''}\n[キャンセル理由] ${cancelData.reason}`.trim() :
                            order.notes
                    }
                });

                return this.getOrderById(orderId, userId);
            });

        } catch (error: unknown) {
            if (error instanceof StockError || error instanceof InventoryError) {
                throw new Error(`注文キャンセル中に在庫エラーが発生しました: ${error.message}`);
            }
            if (error instanceof Error) {
                throw new Error(`注文キャンセルに失敗しました: ${error.message}`);
            }
            throw new Error('注文キャンセルに失敗しました: Unknown error');
        }
    }

    // 管理者用：全注文リストを取得
    static async getAllOrders(query: OrderQuery): Promise<PaginatedData<AdminOrderPreview>> {
        const {
            page = 1,
            limit = 10,
            status,
            user_id,
            date_from,
            date_to,
            amount_min,
            amount_max,
            search,
            sortBy = 'order_date',
            sortOrder = 'desc'
        } = query;

        const where: Prisma.OrderWhereInput = {};

        // ステータスフィルタ
        if (status) where.status = status;

        // ユーザーIDフィルタ
        if (user_id) where.user_id = user_id;

        // 金額範囲フィルタ
        if (amount_min || amount_max) {
            where.total_amount = {};
            if (amount_min) where.total_amount.gte = amount_min;
            if (amount_max) where.total_amount.lte = amount_max;
        }

        // 日付範囲フィルタ
        if (date_from || date_to) {
            where.order_date = {};
            if (date_from) where.order_date.gte = new Date(date_from);
            if (date_to) where.order_date.lte = new Date(date_to);
        }

        // 検索条件
        if (search) {
            where.OR = [
                { delivery_address: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
                {
                    user: {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { email: { contains: search, mode: 'insensitive' } }
                        ]
                    }
                }
            ];
        }

        // ページネーションとソート設定
        const skip = (page - 1) * limit;

        // 動的なソート設定
        const orderBy: Prisma.OrderOrderByWithRelationInput = {
            [sortBy]: sortOrder
        } as Prisma.OrderOrderByWithRelationInput;

        // 並列でデータと総数を取得
        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    user: {
                        select: { id: true, name: true, email: true, phone: true }
                    },
                    order_items: {
                        include: {
                            food: {
                                select: { name: true, image_path: true }
                            }
                        },
                        take: 3
                    }
                }
            }),
            prisma.order.count({ where })
        ]);

        // 管理者用プレビューデータに変換
        const adminOrderPreviews: AdminOrderPreview[] = orders.map(order => ({
            id: order.id,
            total_amount: order.total_amount,
            status: order.status as OrderStatus,
            delivery_address: order.delivery_address,
            phone: order.phone,
            order_date: order.order_date,
            updated_at: order.updated_at,
            items_preview: order.order_items.map(item => ({
                food_name: item.food.name,
                quantity: item.quantity,
                image_path: item.food.image_path
            })),
            summary: {
                itemCount: order.order_items.length,
                totalQuantity: order.order_items.reduce((sum, item) => sum + item.quantity, 0)
            },
            user: order.user
        }));

        // 総ページ数を計算
        const totalPages = Math.ceil(total / limit);

        return {
            data: adminOrderPreviews,
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };
    }

    // 管理者用：注文ステータスを更新
    static async updateOrderStatus(
        orderId: number,
        statusData: UpdateOrderStatusRequest,
        updatedByUserId: number = 1
    ): Promise<OrderData | null> {
        return await prisma.$transaction(async (tx) => {
            // 注文を取得
            const order = await tx.order.findUnique({
                where: { id: orderId }
            });

            if (!order) {
                throw new Error('注文が見つかりません');
            }

            // ステータス遷移の妥当性をチェック
            if (!this.isValidStatusTransition(order.status as OrderStatus, statusData.status)) {
                throw new Error(`ステータスを${order.status}から${statusData.status}に変更できません`);
            }

            // 履歴に現在の状態変更を記録
            await tx.orderStatusHistory.create({
                data: {
                    order_id: orderId,
                    previous_status: order.status,
                    new_status: statusData.status,
                    updated_by: updatedByUserId,
                    note: statusData.note
                }
            });

            // 注文ステータスを更新
            await tx.order.update({
                where: { id: orderId },
                data: {
                    status: statusData.status,
                    notes: statusData.note ?
                        `${order.notes || ''}\n[${statusData.status}] ${statusData.note}`.trim() :
                        order.notes
                }
            });

            return this.getOrderById(orderId);
        });
    }

    // 注文ステータス履歴を取得
    static async getOrderStatusHistory(
        orderId: number,
        userId?: number
    ): Promise<OrderStatusHistory[]> {
        const where: Prisma.OrderStatusHistoryWhereInput = { order_id: orderId };

        // ユーザーIDが指定されている場合は所有権をチェック
        if (userId) {
            const orderOwnership = await prisma.order.findUnique({
                where: { id: orderId, user_id: userId },
                select: { id: true }
            });

            if (!orderOwnership) {
                throw new Error('注文が見つかりません');
            }
        }

        // 履歴を時系列で取得
        const history = await prisma.orderStatusHistory.findMany({
            where,
            include: {
                updated_by_user: {
                    select: { id: true, name: true, role: true }
                }
            },
            orderBy: { updated_at: 'asc' }
        });

        return history.map(record => ({
            id: record.id,
            order_id: record.order_id,
            previous_status: record.previous_status as OrderStatus,
            new_status: record.new_status as OrderStatus,
            updated_by: record.updated_by,
            updated_at: record.updated_at,
            note: record.note || undefined,
            updated_by_user: record.updated_by_user
        }));
    }

    // 注文統計を取得
    static async getOrderStats(dateRange?: { from?: string; to?: string }): Promise<OrderStatsData> {
        const where: Prisma.OrderWhereInput = {};

        // 日付範囲フィルタ
        if (dateRange?.from || dateRange?.to) {
            where.order_date = {};
            if (dateRange.from) where.order_date.gte = new Date(dateRange.from);
            if (dateRange.to) where.order_date.lte = new Date(dateRange.to);
        }

        // 基本統計
        const [totalOrders, totalRevenueResult, statusBreakdown] = await Promise.all([
            prisma.order.count({ where }),
            prisma.order.aggregate({
                where: { ...where, status: { not: 'cancelled' } },
                _sum: { total_amount: true }
            }),
            prisma.order.groupBy({
                by: ['status'],
                where,
                _count: { status: true }
            })
        ]);

        // ステータス別の集計を整理
        const statusBreakdownMap: Record<OrderStatus, number> = {
            'pending': 0,
            'confirmed': 0,
            'preparing': 0,
            'delivery': 0,
            'completed': 0,
            'cancelled': 0
        };

        statusBreakdown.forEach(item => {
            statusBreakdownMap[item.status as OrderStatus] = item._count.status;
        });

        // 最近の注文
        const recentOrdersData = await prisma.order.findMany({
            where,
            take: 5,
            orderBy: { order_date: 'desc' },
            include: {
                order_items: {
                    include: {
                        food: {
                            include: {
                                category: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    }
                },
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            }
        });

        // 最近の注文データを変換
        const recentOrders = recentOrdersData.map(order => this.transformToOrderData(order));

        return {
            total_orders: totalOrders,
            total_revenue: totalRevenueResult._sum.total_amount || 0,
            status_breakdown: statusBreakdownMap,
            recent_orders: recentOrders
        };
    }

    // 注文の所有権を検証
    static async validateOrderOwnership(orderId: number, userId: number): Promise<boolean> {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            select: { user_id: true }
        });

        return order?.user_id === userId;
    }

    // 注文キャンセル可能性を検証
    static canCancelOrder(status: OrderStatus): boolean {
        return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(status);
    }

    // ステータス遷移の妥当性を検証
    static isValidStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
        const transitions: Record<OrderStatus, OrderStatus[]> = {
            [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
            [OrderStatus.CONFIRMED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
            [OrderStatus.PREPARING]: [OrderStatus.DELIVERY],
            [OrderStatus.DELIVERY]: [OrderStatus.COMPLETED],
            [OrderStatus.COMPLETED]: [],
            [OrderStatus.CANCELLED]: []
        };

        return transitions[currentStatus]?.includes(newStatus) || false;
    }

    // 内部ヘルパー：完全な注文データを構築
    private static async buildOrderData(
        orderId: number,
        tx?: Prisma.TransactionClient
    ): Promise<OrderData> {
        const client = tx || prisma;

        // 注文を取得（関連データも含む）
        const order = await client.order.findUnique({
            where: { id: orderId },
            include: {
                order_items: {
                    include: {
                        food: {
                            include: {
                                category: {
                                    select: { id: true, name: true }
                                }
                            }
                        }
                    }
                },
                user: {
                    select: { id: true, name: true, email: true, phone: true }
                }
            }
        });

        if (!order) {
            throw new Error('注文が見つかりません');
        }

        return this.transformToOrderData(order);
    }

    // 内部ヘルパー：OrderDataに変換
    private static transformToOrderData(order: Prisma.OrderGetPayload<{
        include: {
            order_items: {
                include: {
                    food: {
                        include: {
                            category: {
                                select: { id: true; name: true }
                            }
                        }
                    }
                }
            };
            user: {
                select: { id: true; name: true; email: true; phone: true }
            }
        }
    }>): OrderData {
        const items: OrderItemData[] = order.order_items.map((item) => ({
            ...item,
            food: {
                ...item.food,
                current_price: item.food.price,
                category: item.food.category
            }
        }));

        // 注文の集計情報を計算
        const summary = {
            itemCount: items.length,
            totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount: items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        };

        return {
            ...order,
            items,
            summary,
            user: order.user
        };
    }
};