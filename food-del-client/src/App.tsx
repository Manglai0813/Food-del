/**
 * メインアプリケーションコンポーネント
 * ルーティング・プロバイダー・グローバル設定
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// ページコンポーネント
import {
        HomePageContainer,
        CartPage,
        PlaceOrderPage,
        OrderSuccessPage,
        MyOrdersPage,
} from '@/pages';

// プロバイダー
import { AuthProvider } from '@/providers';

// ルート定数・React Query設定
import { ROUTES, queryClient } from '@/lib';

function App() {
        return (
                <QueryClientProvider client={queryClient}>
                        <AuthProvider>
                                <Router>
                                        <div className="App">
                                                <Routes>
                                                        {/* メインページ */}
                                                        <Route path={ROUTES.HOME} element={<HomePageContainer />} />

                                                        {/* カート・注文関連 */}
                                                        <Route path={ROUTES.CART} element={<CartPage />} />
                                                        <Route path={ROUTES.CHECKOUT} element={<PlaceOrderPage />} />

                                                        {/* 注文管理 */}
                                                        <Route path={ROUTES.ORDER_SUCCESS} element={<OrderSuccessPage />} />
                                                        <Route path={ROUTES.ORDERS} element={<MyOrdersPage />} />

                                                        {/* 404・リダイレクト */}
                                                        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
                                                        <Route path="*" element={<Navigate to={ROUTES.NOT_FOUND} replace />} />
                                                </Routes>

                                                {/* グローバルコンポーネント */}
                                                <Toaster
                                                        position="top-right"
                                                        toastOptions={{
                                                                duration: 4000,
                                                                style: {
                                                                        background: '#fff',
                                                                        color: '#333',
                                                                        borderRadius: '8px',
                                                                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                                                },
                                                        }}
                                                />
                                        </div>
                                </Router>
                        </AuthProvider>
                </QueryClientProvider>
        );
}

// 404ページコンポーネント
const NotFoundPage: React.FC = () => {
        return (
                <div className="min-h-screen bg-muted flex items-center justify-center">
                        <div className="text-center">
                                <div className="text-6xl font-bold text-primary mb-4">404</div>
                                <h1 className="text-2xl font-semibold text-foreground mb-2">
                                        ページが見つかりません
                                </h1>
                                <p className="text-muted-foreground mb-6">
                                        お探しのページは存在しないか、移動された可能性があります
                                </p>
                                <button
                                        onClick={() => window.location.href = '/'}
                                        className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                        ホームに戻る
                                </button>
                        </div>
                </div>
        );
};

export default App;
