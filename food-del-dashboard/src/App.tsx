import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout';
import { LoginPage } from '@/pages/auth';
import { DashboardPage } from '@/pages/dashboard';
import { FoodListPage, FoodDetailPage, FoodFormPage } from '@/pages/foods';
import { OrderListPage, OrderDetailPage } from '@/pages/orders';
import { CategoryListPage, CategoryFormPage } from '@/pages/categories';
import { UserManagementPlaceholder } from '@/pages/users';
import { ProtectedRoute } from '@/components/common';
import { useAuth } from '@/hooks';

/**
 * メインアプリケーションコンポーネント
 * 認証統合済みルーティング設定
 */
function App() {
        const { isAuthenticated } = useAuth();

        return (
                <Routes>
                        {/* 公開ルート: ログインページ */}
                        <Route
                                path="/login"
                                element={
                                        isAuthenticated ? (
                                                <Navigate to="/" replace />
                                        ) : (
                                                <LoginPage />
                                        )
                                }
                        />

                        {/* 保護されたルート: 認証が必要 */}
                        <Route
                                path="/*"
                                element={
                                        <ProtectedRoute>
                                                <Layout />
                                        </ProtectedRoute>
                                }
                        >
                                {/* ダッシュボードホーム */}
                                <Route index element={<DashboardPage />} />

                                {/* 商品管理ルート (全ユーザー) */}
                                <Route path="foods" element={<FoodListPage />} />

                                {/* 商品管理: 作成・編集 (認証必要) - 具体的なパスを先に定義 */}
                                <Route
                                        path="foods/new"
                                        element={
                                                <ProtectedRoute>
                                                        <FoodFormPage />
                                                </ProtectedRoute>
                                        }
                                />
                                <Route
                                        path="foods/:id/edit"
                                        element={
                                                <ProtectedRoute>
                                                        <FoodFormPage />
                                                </ProtectedRoute>
                                        }
                                />
                                <Route path="foods/:id" element={<FoodDetailPage />} />

                                {/* 注文管理ルート (管理者のみ) */}
                                <Route
                                        path="orders"
                                        element={
                                                <ProtectedRoute requiredRoles={['admin']}>
                                                        <OrderListPage />
                                                </ProtectedRoute>
                                        }
                                />
                                <Route
                                        path="orders/:id"
                                        element={
                                                <ProtectedRoute requiredRoles={['admin']}>
                                                        <OrderDetailPage />
                                                </ProtectedRoute>
                                        }
                                />

                                {/* カテゴリ管理ルート (管理者のみ) */}
                                <Route
                                        path="categories"
                                        element={
                                                <ProtectedRoute requiredRoles={['admin']}>
                                                        <CategoryListPage />
                                                </ProtectedRoute>
                                        }
                                />
                                <Route
                                        path="categories/new"
                                        element={
                                                <ProtectedRoute requiredRoles={['admin']}>
                                                        <CategoryFormPage />
                                                </ProtectedRoute>
                                        }
                                />
                                <Route
                                        path="categories/:id/edit"
                                        element={
                                                <ProtectedRoute requiredRoles={['admin']}>
                                                        <CategoryFormPage />
                                                </ProtectedRoute>
                                        }
                                />

                                {/* ユーザー管理ルート (管理者のみ) */}
                                <Route
                                        path="users"
                                        element={
                                                <ProtectedRoute requiredRoles={['admin']}>
                                                        <UserManagementPlaceholder />
                                                </ProtectedRoute>
                                        }
                                />
                        </Route>

                        {/* 404 ページ */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
        );
}

export default App;