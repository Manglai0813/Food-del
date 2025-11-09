import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// プロバイダー
import { AuthProvider } from '@/providers';

// ルート定数・React Query設定
import { ROUTES, queryClient } from '@/lib';

// メインページ
const HomePageContainer = React.lazy(() => import('@/pages/food/HomePageContainer').then(m => ({ default: m.HomePageContainer })));

// カート・注文関連ページ
const CartPage = React.lazy(() => import('@/pages/cart/CartPage').then(m => ({ default: m.CartPage })));

// 注文管理ページ
const PlaceOrderPage = React.lazy(() => import('@/pages/order/PlaceOrderPage').then(m => ({ default: m.PlaceOrderPage })));

// 注文完了・注文履歴ページ
const OrderSuccessPage = React.lazy(() => import('@/pages/order/OrderSuccessPage').then(m => ({ default: m.OrderSuccessPage })));

// 注文履歴ページ
const MyOrdersPage = React.lazy(() => import('@/pages/order/MyOrdersPage').then(m => ({ default: m.MyOrdersPage })));

// ページ読み込み中フォールバックコンポーネント
const PageLoadingFallback: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">ページを読み込み中...</p>
        </div>
    </div>
);

// 404ページコンポーネント
const NotFoundPage: React.FC = () => (
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

// メインアプリコンポーネント
function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <Router>
                    <div className="App">
                        <Suspense fallback={<PageLoadingFallback />}>
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
                        </Suspense>

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

export default App;