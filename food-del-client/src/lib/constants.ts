/**
 * アプリケーション定数
 */

// API設定
export const API_CONFIG = {
        BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
        TIMEOUT: 10000, // 10秒
} as const;

// ルート定義
export const ROUTES = {
        // ホーム
        HOME: '/',

        // 認証
        LOGIN: '/login',
        REGISTER: '/register',
        PROFILE: '/profile',

        // カート・チェックアウト
        CART: '/cart',
        CHECKOUT: '/checkout',

        // 注文
        ORDERS: '/my-orders',
        ORDER_DETAIL: '/my-orders/:id',
        ORDER_SUCCESS: '/order-success',

        // その他
        NOT_FOUND: '/404',
} as const;

// ローカルストレージキー
export const STORAGE_KEYS = {
        AUTH: 'auth-storage',
        CART: 'cart-storage',
        PREFERENCES: 'user-preferences',
} as const;

// ページネーション設定
export const PAGINATION = {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 12,
        PAGE_SIZE_OPTIONS: [12, 24, 48],
} as const;

// トースト設定
export const TOAST_CONFIG = {
        DURATION: 4000,
        POSITION: 'top-right' as const,
} as const;
