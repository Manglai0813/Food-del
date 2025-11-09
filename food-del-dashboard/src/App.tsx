import { Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "@/components/layout";
import { LoginPage } from "@/pages/auth";
import { DashboardPage } from "@/pages/dashboard";
import { FoodListPage, FoodDetailPage, FoodFormPage } from "@/pages/foods";
import { OrderListPage, OrderDetailPage } from "@/pages/orders";
import { CategoryListPage, CategoryFormPage } from "@/pages/categories";
import { UserManagementPlaceholder } from "@/pages/users";
import { ProtectedRoute } from "@/components/common";
import { useAuth } from "@/hooks";

// メインアプリケーションコンポーネント
function App() {
    const { isAuthenticated } = useAuth();

    return (
        <Routes>
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

            <Route
                path="/*"
                element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }
            >
                <Route index element={<DashboardPage />} />

                <Route path="foods" element={<FoodListPage />} />
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

                <Route
                    path="orders"
                    element={
                        <ProtectedRoute requiredRoles={["admin"]}>
                            <OrderListPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="orders/:id"
                    element={
                        <ProtectedRoute requiredRoles={["admin"]}>
                            <OrderDetailPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="categories"
                    element={
                        <ProtectedRoute requiredRoles={["admin"]}>
                            <CategoryListPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="categories/new"
                    element={
                        <ProtectedRoute requiredRoles={["admin"]}>
                            <CategoryFormPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="categories/:id/edit"
                    element={
                        <ProtectedRoute requiredRoles={["admin"]}>
                            <CategoryFormPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="users"
                    element={
                        <ProtectedRoute requiredRoles={["admin"]}>
                            <UserManagementPlaceholder />
                        </ProtectedRoute>
                    }
                />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App;