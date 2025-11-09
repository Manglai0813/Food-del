import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks';
import { Loader2 } from 'lucide-react';

// プロパティの型定義
interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    fallbackPath?: string;
}

// 保護されたルートコンポーネント
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles,
    fallbackPath = '/'
}) => {
    const location = useLocation();
    const { isAuthenticated, isLoading, hasRole } = useAuth();

    // ローディング中の表示
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                    <p className="text-muted-foreground">認証状態を確認中...</p>
                </div>
            </div>
        );
    }

    // 未認証時のリダイレクト
    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    // 権限不足時のリダイレクト
    if (requiredRoles && !hasRole(requiredRoles)) {
        return <Navigate to={fallbackPath} replace />;
    }

    // 認証・権限チェック通過時は子コンポーネントを表示
    return <>{children}</>;
};

export default ProtectedRoute;