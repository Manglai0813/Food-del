/**
 * 型定義エントリーポイント
 * すべての型定義をエクスポート
 */

// API関連型
export type * from './api.types';

// 認証関連型
export type * from './auth.types';

// 食品関連型
export type * from './food.types';

// カート関連型
export type * from './cart.types';

// 注文関連型
export type * from './order.types';

// カテゴリ関連型
export type * from './category.types';

// 共通ユーティリティ型
export interface PaginationParams {
        page?: number;
        limit?: number;
}

export interface SortParams<T extends string = string> {
        sortBy?: T;
        sortOrder?: 'asc' | 'desc';
}

export interface SearchParams {
        search?: string;
}

// API エンドポイント型安全性のための型
export interface ApiEndpoints {
        // Auth endpoints
        'POST /api/auth/login': {
                request: import('./auth.types').LoginRequest;
                response: import('./auth.types').AuthResponse;
        };
        'POST /api/auth/register': {
                request: import('./auth.types').RegisterRequest;
                response: import('./auth.types').AuthResponse;
        };
        'POST /api/auth/refresh': {
                request: import('./auth.types').RefreshTokenRequest;
                response: import('./auth.types').TokenRefreshData;
        };
        'GET /api/auth/profile': {
                response: import('./auth.types').User;
        };
        'PUT /api/auth/profile': {
                request: import('./auth.types').UpdateProfileRequest;
                response: import('./auth.types').User;
        };

        // Food endpoints
        'GET /api/foods': {
                response: import('./api.types').PaginatedResponse<import('./food.types').Food>;
        };
        'GET /api/foods/:id': {
                response: import('./api.types').ApiResponse<import('./food.types').Food>;
        };

        // Cart endpoints
        'GET /api/cart': {
                response: import('./api.types').ApiResponse<import('./cart.types').CartSummary>;
        };
        'POST /api/cart/items': {
                request: import('./cart.types').AddToCartRequest;
                response: import('./api.types').ApiResponse<import('./cart.types').CartItem>;
        };
        'PUT /api/cart/items/:id': {
                request: import('./cart.types').UpdateCartItemRequest;
                response: import('./api.types').ApiResponse<import('./cart.types').CartItem>;
        };

        // Order endpoints
        'GET /api/orders': {
                response: import('./api.types').PaginatedResponse<import('./order.types').Order>;
        };
        'GET /api/orders/:id': {
                response: import('./api.types').ApiResponse<import('./order.types').Order>;
        };
        'POST /api/orders': {
                request: import('./order.types').CreateOrderRequest;
                response: import('./api.types').ApiResponse<import('./order.types').Order>;
        };

        // Category endpoints
        'GET /api/categories': {
                response: import('./api.types').ApiResponse<import('./category.types').Category[]>;
        };
        'GET /api/categories/:id': {
                response: import('./api.types').ApiResponse<import('./category.types').Category>;
        };
};