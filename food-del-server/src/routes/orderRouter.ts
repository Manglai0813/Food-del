import express, { Router } from 'express';
import {
        createOrder,
        getUserOrders,
        getUserOrderById,
        cancelOrder,
        getAllOrders,
        getOrderById,
        updateOrderStatus,
        getOrderStats,
        getUserOrderHistory,
        getOrderHistory
} from '@/controllers/orderController';
import { isAuthenticated, isAdmin } from '@/middleware/authMiddleware';
import { adminRateLimit } from '@/middleware/rateLimiting';

// 注文ルーターの作成
const orderRouter: Router = express.Router();

// 管理者専用エンドポイント（/api/orders/admin） - 具体的なパスを先に定義
// isAdminは既に認証を含むため、isAuthenticatedは不要
orderRouter.get('/admin/stats', isAdmin, adminRateLimit, getOrderStats);    // 注文統計を取得
orderRouter.get('/admin/:id/history', isAdmin, adminRateLimit, getOrderHistory); // 任意の注文履歴を取得
orderRouter.get('/admin', isAdmin, adminRateLimit, getAllOrders);           // 全注文リストを取得
orderRouter.get('/admin/:id', isAdmin, adminRateLimit, getOrderById);       // 任意の注文詳細を取得
orderRouter.put('/admin/:id/status', isAdmin, adminRateLimit, updateOrderStatus); // 注文ステータスを更新

// ユーザー用エンドポイント（/api/orders） - パラメータパスは最後に定義
orderRouter.post('/', isAuthenticated, createOrder);                    // カートから注文を作成
orderRouter.get('/', isAuthenticated, getUserOrders);                   // ユーザーの注文リストを取得
orderRouter.get('/:id/history', isAuthenticated, getUserOrderHistory);  // ユーザーの注文履歴を取得
orderRouter.put('/:id/cancel', isAuthenticated, cancelOrder);           // 注文をキャンセル
orderRouter.get('/:id', isAuthenticated, getUserOrderById);             // ユーザーの注文詳細を取得

export default orderRouter;