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

/**
 * 注文コントローラー
 * 注文の作成、検索、更新、統計などのAPI処理を担当します
 */

/**
 * 注文作成（ユーザー用）
 *
 * カート内の商品から注文を作成する。
 * 配送先住所と電話番号の提供が必須。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - body.delivery_address: string - 配送先住所（必須）
 *   - body.phone: string - 電話番号（必須）
 *   - body.delivery_date?: string - 配送希望日
 *   - body.notes?: string - 特別な指示やメモ
 * @param res - 作成された注文情報
 * @returns void
 *
 * @throws 400 - delivery_addressまたはphoneが不足
 * @throws 401 - 認証が必要
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. ユーザーIDの有効性確認
 * 3. リクエストボディからdelivery_addressとphoneを取得
 * 4. 必須フィールドを検証
 * 5. Service層でカートから注文を作成
 * 6. 在庫を予約、配送情報を登録
 * 7. 作成された注文情報をレスポンス
 *
 * @example
 * POST /api/orders
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "delivery_address": "東京都渋谷区恵比寿",
 *   "phone": "09012345678",
 *   "delivery_date": "2025-11-10",
 *   "notes": "大きめの箱でお願いします"
 * }
 */
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

/**
 * ユーザー注文リスト取得
 *
 * 認証済みユーザーの注文履歴をページネーション付きで取得する。
 * ユーザーは自分の注文のみ取得可能。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - query.page?: number - ページ番号（デフォルト: 1）
 *   - query.limit?: number - 1ページあたりの件数（デフォルト: 20）
 *   - query.status?: string - ステータスで絞込（pending, confirmed, shipped, delivered など）
 *   - query.sortBy?: 'created_at' | 'updated_at' - ソート対象
 *   - query.sortOrder?: 'asc' | 'desc' - ソート順
 * @param res - ページネーション付き注文リスト（簡潔なプレビュー形式）
 * @returns void
 *
 * @throws 401 - 認証が必要
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. ユーザーIDの有効性確認
 * 3. クエリパラメータを取得
 * 4. Service層でユーザーの注文リストを取得
 * 5. ページネーション情報を計算
 * 6. 注文リストとページネーション情報をレスポンス
 *
 * @example
 * GET /api/orders?page=1&limit=10&status=shipped
 * Authorization: Bearer <token>
 */
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

/**
 * ユーザー注文詳細取得
 *
 * 認証済みユーザーが自分の特定の注文の詳細情報を取得する。
 * 所有権確認により、自分の注文のみ取得可能。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - params.id: string - 注文ID（URLパラメータ）（必須）
 * @param res - 注文の完全な詳細情報（アイテムリスト、配送情報、ステータス履歴を含む）
 * @returns void
 *
 * @throws 400 - 注文IDが不足 または 無効なID形式
 * @throws 401 - 認証が必要
 * @throws 404 - 注文が見つからない または アクセス権がない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. ユーザーIDの有効性確認
 * 3. URLパラメータから注文IDを抽出
 * 4. 注文IDの有効性確認（数値型へ変換）
 * 5. Service層で注文詳細を取得（所有権チェック含む）
 * 6. 注文が存在し、ユーザーが所有者か確認
 * 7. 注文詳細情報をレスポンス
 *
 * @example
 * GET /api/orders/42
 * Authorization: Bearer <token>
 */
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

                // ユーザーの注文詳細を取得（所有権チェック含む）
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

/**
 * 注文キャンセル（ユーザー用）
 *
 * ユーザーが自分の注文をキャンセルする。
 * キャンセル可能なステータスのみキャンセル可能（通常はpendingのみ）。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - params.id: string - 注文ID（URLパラメータ）（必須）
 *   - body.reason?: string - キャンセル理由
 * @param res - キャンセルされた注文情報
 * @returns void
 *
 * @throws 400 - 注文IDが不足 または 無効なID形式 または キャンセルできない状態
 * @throws 401 - 認証が必要
 * @throws 404 - 注文が見つからない または アクセス権がない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. ユーザーIDの有効性確認
 * 3. URLパラメータから注文IDを抽出
 * 4. 注文IDの有効性確認
 * 5. Service層で注文をキャンセル（所有権チェック含む）
 * 6. 注文ステータスが更新可能か確認
 * 7. 在庫を復元
 * 8. キャンセルされた注文情報をレスポンス
 *
 * @example
 * DELETE /api/orders/42
 * Authorization: Bearer <token>
 * Content-Type: application/json
 * {
 *   "reason": "思い直しました"
 * }
 */
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

/**
 * 全注文リスト取得（管理者用）
 *
 * すべてのユーザーの注文リストを取得する（管理者のみ）。
 * ページネーション、フィルタリング、ソート対応。
 *
 * @param req - 認証済みリクエスト（管理者権限が必要）
 *   - query.page?: number - ページ番号（デフォルト: 1）
 *   - query.limit?: number - 1ページあたりの件数（デフォルト: 20）
 *   - query.status?: string - ステータスで絞込
 *   - query.user_id?: number - ユーザーIDで絞込
 *   - query.sortBy?: 'created_at' | 'updated_at' | 'total_price' - ソート対象
 *   - query.sortOrder?: 'asc' | 'desc' - ソート順
 * @param res - ページネーション付き注文リスト（管理者用拡張情報を含む）
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. 管理者権限はmiddlewareで確認済み
 * 2. クエリパラメータを取得
 * 3. Service層で全注文リストを取得
 * 4. ページネーション情報を計算
 * 5. 全注文リストとページネーション情報をレスポンス
 *
 * @example
 * GET /api/admin/orders?page=1&limit=20&status=shipped
 * Authorization: Bearer <admin_token>
 */
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

/**
 * 注文詳細取得（管理者用）
 *
 * 管理者が任意の注文の詳細情報を取得する。
 * 所有権チェックなしでアクセス可能。
 *
 * @param req - 認証済みリクエスト（管理者権限が必要）
 *   - params.id: string - 注文ID（URLパラメータ）（必須）
 * @param res - 注文の完全な詳細情報（すべてのアイテムと履歴を含む）
 * @returns void
 *
 * @throws 400 - 注文IDが不足 または 無効なID形式
 * @throws 404 - 注文が見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. 管理者権限はmiddlewareで確認済み
 * 2. URLパラメータから注文IDを抽出
 * 3. 注文IDの有効性確認（数値型へ変換）
 * 4. Service層で注文詳細を取得（所有権チェックなし）
 * 5. 注文が存在するか確認
 * 6. 注文詳細情報をレスポンス
 *
 * @example
 * GET /api/admin/orders/42
 * Authorization: Bearer <admin_token>
 */
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

/**
 * 注文ステータス更新（管理者用）
 *
 * 注文のステータスを更新する（管理者のみ）。
 * ステータス遷移ルールに従う必要があります。
 *
 * @param req - 認証済みリクエスト（管理者権限が必要）
 *   - params.id: string - 注文ID（URLパラメータ）（必須）
 *   - body.status: string - 新しいステータス（必須）
 *   - body.notes?: string - ステータス更新時のメモ
 * @param res - 更新された注文情報
 * @returns void
 *
 * @throws 400 - 注文IDが不足 または 無効なID形式 または ステータスが不足
 * @throws 404 - 注文が見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. 管理者権限はmiddlewareで確認済み
 * 2. URLパラメータから注文IDを抽出
 * 3. 注文IDの有効性確認
 * 4. リクエストボディからステータスを取得
 * 5. ステータスが必須フィールドか確認
 * 6. Service層で注文ステータスを更新
 * 7. ステータス遷移が有効か確認
 * 8. ステータス履歴を記録
 * 9. 更新された注文情報をレスポンス
 *
 * @example
 * PATCH /api/admin/orders/42/status
 * Authorization: Bearer <admin_token>
 * Content-Type: application/json
 * {
 *   "status": "shipped",
 *   "notes": "佐川急便で発送しました"
 * }
 */
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

/**
 * 注文統計取得（管理者用）
 *
 * 注文に関する統計情報を取得する（管理者のみ）。
 * 日付範囲、ステータス別の集計などが可能。
 *
 * @param req - 認証済みリクエスト（管理者権限が必要）
 *   - query.from?: string - 開始日付（ISO 8601形式）
 *   - query.to?: string - 終了日付（ISO 8601形式）
 * @param res - 注文統計情報（総数、売上、ステータス別集計など）
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. 管理者権限はmiddlewareで確認済み
 * 2. クエリパラメータから日付範囲を取得
 * 3. Service層で注文統計を計算
 * 4. 統計情報（総注文数、総売上、ステータス別集計など）を集計
 * 5. 統計情報をレスポンス
 *
 * @example
 * GET /api/admin/orders/stats?from=2025-11-01&to=2025-11-30
 * Authorization: Bearer <admin_token>
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "message": "注文統計を取得しました",
 *   "data": {
 *     "totalOrders": 150,
 *     "totalRevenue": 450000,
 *     "averageOrderValue": 3000,
 *     "statusCounts": {
 *       "pending": 10,
 *       "confirmed": 30,
 *       "shipped": 100,
 *       "delivered": 10
 *     }
 *   }
 * }
 */
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

/**
 * ユーザー注文ステータス履歴取得
 *
 * 認証済みユーザーが自分の特定の注文のステータス変更履歴を取得する。
 * タイムスタンプ付きで履歴が表示される。
 *
 * @param req - 認証済みリクエスト（ユーザーIDを含む）
 *   - params.id: string - 注文ID（URLパラメータ）（必須）
 * @param res - ステータス変更履歴の配列（新順でソート）
 * @returns void
 *
 * @throws 400 - 注文IDが不足 または 無効なID形式
 * @throws 401 - 認証が必要
 * @throws 404 - 注文が見つからない または アクセス権がない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストからユーザーIDを抽出
 * 2. ユーザーIDの有効性確認
 * 3. URLパラメータから注文IDを抽出
 * 4. 注文IDの有効性確認
 * 5. Service層で注文ステータス履歴を取得（所有権チェック含む）
 * 6. ユーザーが注文を所有しているか確認
 * 7. ステータス履歴を新順でレスポンス
 *
 * @example
 * GET /api/orders/42/history
 * Authorization: Bearer <token>
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "message": "注文履歴を取得しました",
 *   "data": [
 *     {
 *       "status": "delivered",
 *       "changed_at": "2025-11-10T15:30:00Z",
 *       "notes": "配達完了"
 *     },
 *     {
 *       "status": "shipped",
 *       "changed_at": "2025-11-08T10:15:00Z"
 *     }
 *   ]
 * }
 */
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

                // ユーザーの注文履歴を取得（所有権チェック含む）
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

/**
 * 注文ステータス履歴取得（管理者用）
 *
 * 管理者が任意の注文のステータス変更履歴を取得する。
 * 所有権チェックなしでアクセス可能。
 *
 * @param req - 認証済みリクエスト（管理者権限が必要）
 *   - params.id: string - 注文ID（URLパラメータ）（必須）
 * @param res - ステータス変更履歴の配列（新順でソート）
 * @returns void
 *
 * @throws 400 - 注文IDが不足 または 無効なID形式
 * @throws 404 - 注文が見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. 管理者権限はmiddlewareで確認済み
 * 2. URLパラメータから注文IDを抽出
 * 3. 注文IDの有効性確認
 * 4. Service層で注文ステータス履歴を取得（所有権チェックなし）
 * 5. ステータス変更履歴を取得
 * 6. 履歴を新順でレスポンス
 *
 * @example
 * GET /api/admin/orders/42/history
 * Authorization: Bearer <admin_token>
 */
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