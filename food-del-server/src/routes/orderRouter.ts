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

// 管理者用ルートにレート制限ミドルウェアを適用
orderRouter.get('/admin/stats', isAdmin, adminRateLimit, getOrderStats);

// 管理者用注文履歴取得ルート
orderRouter.get('/admin/:id/history', isAdmin, adminRateLimit, getOrderHistory);

// 管理者用すべての注文取得ルート
orderRouter.get('/admin', isAdmin, adminRateLimit, getAllOrders);

// 管理者用IDで注文を取得
orderRouter.get('/admin/:id', isAdmin, adminRateLimit, getOrderById);

// 管理者用注文ステータス更新ルート
orderRouter.put('/admin/:id/status', isAdmin, adminRateLimit, updateOrderStatus);

// ユーザー用注文作成ルート
orderRouter.post('/', isAuthenticated, createOrder);

//  ユーザー用すべての注文取得ルート
orderRouter.get('/', isAuthenticated, getUserOrders);

// ユーザー用注文履歴取得ルート
orderRouter.get('/:id/history', isAuthenticated, getUserOrderHistory);

//  ユーザー用IDで注文を取得
orderRouter.put('/:id/cancel', isAuthenticated, cancelOrder);

//  ユーザー用IDで注文を取得
orderRouter.get('/:id', isAuthenticated, getUserOrderById);

export default orderRouter;