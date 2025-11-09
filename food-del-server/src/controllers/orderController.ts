import type { Response } from 'express';
import { OrderService } from '@/services/orderService';
import type {
    AuthRequest,
    ApiResponse,
    PaginatedResponse,
    OrderData,
    OrderPreview,
    AdminOrderPreview,
    CreateOrderRequest,
    UpdateOrderStatusRequest,
    CancelOrderRequest,
    OrderQuery,
    OrderStatsData,
    OrderStatusHistory,
    QueryRequest,
    BodyRequest,
    ParamsRequest,
    IdParams
} from '@/types';

// 注文作成
export const createOrder = async (
    req: AuthRequest & BodyRequest<CreateOrderRequest>,
    res: Response<ApiResponse<OrderData> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "認証が必要です"
            } as ApiResponse<null>);
            return;
        }

        // 必須フィールドの検証
        const { delivery_address, phone } = req.body;
        if (!delivery_address || !phone) {
            res.status(400).json({
                success: false,
                message: "配送先住所と電話番号は必須です"
            } as ApiResponse<null>);
            return;
        }

        // カートから注文を作成
        const order = await OrderService.createOrderFromCart(req.user.id, req.body);

        res.status(201).json({
            success: true,
            message: "注文が正常に作成されました",
            data: order
        } as ApiResponse<OrderData>);
    } catch (error) {
        console.error('注文作成エラー:', error);
        const errorMessage = error instanceof Error ? error.message : "注文の作成に失敗しました";
        res.status(500).json({
            success: false,
            message: errorMessage
        } as ApiResponse<null>);
    }
};

// ユーザーの注文リスト取得
export const getUserOrders = async (
    req: AuthRequest & QueryRequest<OrderQuery>,
    res: Response<PaginatedResponse<OrderPreview> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "認証が必要です"
            } as ApiResponse<null>);
            return;
        }

        // ユーザーの注文リストを取得
        const result = await OrderService.getUserOrders(req.user.id, req.query);

        res.status(200).json({
            success: true,
            message: "注文リストを取得しました",
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev
            }
        } as PaginatedResponse<OrderPreview>);
    } catch (error) {
        console.error('注文リスト取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "注文リストの取得に失敗しました"
        } as ApiResponse<null>);
    }
};

// ユーザーの注文詳細取得
export const getUserOrderById = async (
    req: AuthRequest & ParamsRequest<IdParams>,
    res: Response<ApiResponse<OrderData> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "認証が必要です"
            } as ApiResponse<null>);
            return;
        }

        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "注文IDが必要です"
            } as ApiResponse<null>);
            return;
        }

        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: "無効な注文IDです"
            } as ApiResponse<null>);
            return;
        }

        // ユーザーの注文詳細を取得
        const order = await OrderService.getOrderById(orderId, req.user.id);

        if (!order) {
            res.status(404).json({
                success: false,
                message: "注文が見つかりません"
            } as ApiResponse<null>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "注文詳細を取得しました",
            data: order
        } as ApiResponse<OrderData>);
    } catch (error) {
        console.error('注文詳細取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "注文詳細の取得に失敗しました"
        } as ApiResponse<null>);
    }
};

// 注文キャンセル
export const cancelOrder = async (
    req: AuthRequest & ParamsRequest<IdParams> & BodyRequest<CancelOrderRequest>,
    res: Response<ApiResponse<OrderData> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "認証が必要です"
            } as ApiResponse<null>);
            return;
        }

        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "注文IDが必要です"
            } as ApiResponse<null>);
            return;
        }

        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: "無効な注文IDです"
            } as ApiResponse<null>);
            return;
        }

        // 注文をキャンセル
        const cancelledOrder = await OrderService.cancelOrder(orderId, req.user.id, req.body);

        if (!cancelledOrder) {
            res.status(404).json({
                success: false,
                message: "注文が見つかりません"
            } as ApiResponse<null>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "注文がキャンセルされました",
            data: cancelledOrder
        } as ApiResponse<OrderData>);
    } catch (error) {
        console.error('注文キャンセルエラー:', error);
        const errorMessage = error instanceof Error ? error.message : "注文のキャンセルに失敗しました";
        res.status(400).json({
            success: false,
            message: errorMessage
        } as ApiResponse<null>);
    }
};

// 全注文リスト取得
export const getAllOrders = async (
    req: AuthRequest & QueryRequest<OrderQuery>,
    res: Response<PaginatedResponse<AdminOrderPreview> | ApiResponse<null>>
): Promise<void> => {
    try {
        // 管理者権限チェックは middleware で行われる前提

        // 全注文リストを取得
        const result = await OrderService.getAllOrders(req.query);

        res.status(200).json({
            success: true,
            message: "全注文リストを取得しました",
            data: result.data,
            pagination: {
                page: result.page,
                limit: result.limit,
                total: result.total,
                totalPages: result.totalPages,
                hasNext: result.hasNext,
                hasPrev: result.hasPrev
            }
        } as PaginatedResponse<AdminOrderPreview>);
    } catch (error) {
        console.error('全注文リスト取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "注文リストの取得に失敗しました"
        } as ApiResponse<null>);
    }
};

// 注文詳細取得
export const getOrderById = async (
    req: AuthRequest & ParamsRequest<IdParams>,
    res: Response<ApiResponse<OrderData> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "注文IDが必要です"
            } as ApiResponse<null>);
            return;
        }

        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: "無効な注文IDです"
            } as ApiResponse<null>);
            return;
        }

        // 注文詳細を取得（管理者は所有権チェックなし）
        const order = await OrderService.getOrderById(orderId);

        if (!order) {
            res.status(404).json({
                success: false,
                message: "注文が見つかりません"
            } as ApiResponse<null>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "注文詳細を取得しました",
            data: order
        } as ApiResponse<OrderData>);
    } catch (error) {
        console.error('注文詳細取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "注文詳細の取得に失敗しました"
        } as ApiResponse<null>);
    }
};

// 注文ステータス更新
export const updateOrderStatus = async (
    req: AuthRequest & ParamsRequest<IdParams> & BodyRequest<UpdateOrderStatusRequest>,
    res: Response<ApiResponse<OrderData> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "注文IDが必要です"
            } as ApiResponse<null>);
            return;
        }

        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: "無効な注文IDです"
            } as ApiResponse<null>);
            return;
        }

        // 必須フィールドの検証
        if (!req.body.status) {
            res.status(400).json({
                success: false,
                message: "ステータスは必須です"
            } as ApiResponse<null>);
            return;
        }

        // 注文ステータスを更新
        const updatedOrder = await OrderService.updateOrderStatus(orderId, req.body, req.user?.id);

        if (!updatedOrder) {
            res.status(404).json({
                success: false,
                message: "注文が見つかりません"
            } as ApiResponse<null>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "注文ステータスが更新されました",
            data: updatedOrder
        } as ApiResponse<OrderData>);
    } catch (error) {
        console.error('注文ステータス更新エラー:', error);
        const errorMessage = error instanceof Error ? error.message : "注文ステータスの更新に失敗しました";
        res.status(400).json({
            success: false,
            message: errorMessage
        } as ApiResponse<null>);
    }
};

// 注文統計取得
export const getOrderStats = async (
    req: AuthRequest & QueryRequest<{ from?: string; to?: string }>,
    res: Response<ApiResponse<OrderStatsData> | ApiResponse<null>>
): Promise<void> => {
    try {
        // 日付範囲パラメータを取得
        const dateRange = {
            from: req.query.from,
            to: req.query.to
        };

        // 注文統計を取得
        const stats = await OrderService.getOrderStats(dateRange);

        res.status(200).json({
            success: true,
            message: "注文統計を取得しました",
            data: stats
        } as ApiResponse<OrderStatsData>);
    } catch (error) {
        console.error('注文統計取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "注文統計の取得に失敗しました"
        } as ApiResponse<null>);
    }
};

// ユーザーの注文履歴取得
export const getUserOrderHistory = async (
    req: AuthRequest & ParamsRequest<IdParams>,
    res: Response<ApiResponse<OrderStatusHistory[]> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.user?.id) {
            res.status(401).json({
                success: false,
                message: "認証が必要です"
            } as ApiResponse<null>);
            return;
        }

        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "注文IDが必要です"
            } as ApiResponse<null>);
            return;
        }

        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: "無効な注文IDです"
            } as ApiResponse<null>);
            return;
        }

        // ユーザーの注文履歴を取得
        const history = await OrderService.getOrderStatusHistory(orderId, req.user.id);

        res.status(200).json({
            success: true,
            message: "注文履歴を取得しました",
            data: history
        } as ApiResponse<OrderStatusHistory[]>);
    } catch (error) {
        console.error('注文履歴取得エラー:', error);
        const errorMessage = error instanceof Error ? error.message : "注文履歴の取得に失敗しました";
        res.status(404).json({
            success: false,
            message: errorMessage
        } as ApiResponse<null>);
    }
};

// 注文履歴取得
export const getOrderHistory = async (
    req: AuthRequest & ParamsRequest<IdParams>,
    res: Response<ApiResponse<OrderStatusHistory[]> | ApiResponse<null>>
): Promise<void> => {
    try {
        if (!req.params.id) {
            res.status(400).json({
                success: false,
                message: "注文IDが必要です"
            } as ApiResponse<null>);
            return;
        }

        const orderId = parseInt(req.params.id);
        if (isNaN(orderId)) {
            res.status(400).json({
                success: false,
                message: "無効な注文IDです"
            } as ApiResponse<null>);
            return;
        }

        // 管理者は所有権チェックなしで履歴を取得
        const history = await OrderService.getOrderStatusHistory(orderId);

        res.status(200).json({
            success: true,
            message: "注文履歴を取得しました",
            data: history
        } as ApiResponse<OrderStatusHistory[]>);
    } catch (error) {
        console.error('注文履歴取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "注文履歴の取得に失敗しました"
        } as ApiResponse<null>);
    }
};