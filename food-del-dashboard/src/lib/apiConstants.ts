// API定数とエンドポイント管理

// ベースURL設定
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// APIエンドポイント定数
export const API_ENDPOINTS = {
    // 認証関連
    AUTH: {
        LOGIN: '/api/users/auth/login',
        REGISTER: '/api/users/auth/register',
        LOGOUT: '/api/users/auth/logout',
        REFRESH: '/api/users/auth/refresh',
        PROFILE: '/api/users/profile',
        UPDATE_PROFILE: '/api/users/profile',
        CHANGE_PASSWORD: '/api/users/auth/change-password',
    },

    // 商品管理
    FOODS: {
        LIST: '/api/foods',
        PUBLIC: '/api/foods/public',
        DASHBOARD_ALL: '/api/foods/dashboard/all',
        FEATURED: '/api/foods/featured',
        DETAIL: (id: string | number) => `/api/foods/${id}`,
        BY_CATEGORY: (id: string | number) => `/api/foods/category/${id}`,
        CREATE: '/api/foods',
        UPDATE: (id: string | number) => `/api/foods/${id}`,
        DELETE: (id: string | number) => `/api/foods/${id}`,
    },

    // カテゴリ管理
    CATEGORIES: {
        LIST: '/api/categories',
        ACTIVE: '/api/categories/active',
        DETAIL: (id: string | number) => `/api/categories/${id}`,
        FOODS: (id: string | number) => `/api/categories/${id}/foods`,
        CREATE: '/api/categories',
        UPDATE: (id: string | number) => `/api/categories/${id}`,
        UPDATE_STATUS: (id: string | number) => `/api/categories/${id}/status`,
        DELETE: (id: string | number) => `/api/categories/${id}`,
    },

    // カート管理
    CART: {
        GET: '/api/carts',
        ADD: '/api/carts/add',
        UPDATE_ITEM: (id: string | number) => `/api/carts/items/${id}`,
        DELETE_ITEM: (id: string | number) => `/api/carts/items/${id}`,
        CLEAR: '/api/carts/clear',
        CHECKOUT: '/api/carts/checkout',
    },

    // 注文管理
    ORDERS: {
        // ユーザー用エンドポイント
        CREATE: '/api/orders',
        USER_LIST: '/api/orders',
        USER_DETAIL: (id: string | number) => `/api/orders/${id}`,
        USER_HISTORY: (id: string | number) => `/api/orders/${id}/history`,
        CANCEL: (id: string | number) => `/api/orders/${id}/cancel`,

        // 管理者用エンドポイント
        ADMIN_STATS: '/api/orders/admin/stats',
        ADMIN_LIST: '/api/orders/admin',
        ADMIN_DETAIL: (id: string | number) => `/api/orders/admin/${id}`,
        ADMIN_HISTORY: (id: string | number) => `/api/orders/admin/${id}/history`,
        UPDATE_STATUS: (id: string | number) => `/api/orders/admin/${id}/status`,
    },
} as const;

// エラーメッセージ定数
export const ERROR_MESSAGES = {
    // 認証関連
    AUTH: {
        INVALID_CREDENTIALS: '無効な認証情報です',
        TOKEN_EXPIRED: 'トークンの有効期限が切れています',
        ACCESS_DENIED: 'アクセスが拒否されました',
        ADMIN_REQUIRED: '管理者権限が必要です',
    },

    // バリデーション関連
    VALIDATION: {
        REQUIRED_FIELD: 'この項目は必須です',
        INVALID_EMAIL: '無効なメールアドレス形式です',
        PASSWORD_TOO_SHORT: 'パスワードは8文字以上である必要があります',
        INVALID_PRICE: '価格は0以上の数値である必要があります',
    },

    // 業務ロジック関連
    BUSINESS: {
        FOOD_NOT_AVAILABLE: 'この商品は現在利用できません',
        INSUFFICIENT_STOCK: '在庫が不足しています',
        CART_EMPTY: 'カートが空です',
        ORDER_CANNOT_BE_CANCELLED: 'この注文はキャンセルできません',
    },

    // システム関連
    SYSTEM: {
        NETWORK_ERROR: 'ネットワークエラーが発生しました',
        SERVER_ERROR: 'サーバーエラーが発生しました',
        UNKNOWN_ERROR: '予期しないエラーが発生しました',
    },
} as const;

// 成功メッセージ定数
export const SUCCESS_MESSAGES = {
    CREATED: '正常に作成されました',
    UPDATED: '正常に更新されました',
    DELETED: '正常に削除されました',
    LOGIN_SUCCESS: 'ログインしました',
    LOGOUT_SUCCESS: 'ログアウトしました',
    ORDER_PLACED: '注文を受け付けました',
} as const;

// HTTPステータスコード定数
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
} as const;

// 画像URL作成ヘルパー
export const createImageUrl = (imagePath?: string): string => {
    if (!imagePath) return '';
    // クライアントと同じ方式：/files プレフィックスを追加
    return `${API_BASE_URL}/files${imagePath}`;
};

// フルAPIURL作成ヘルパー
export const createApiUrl = (endpoint: string): string => {
    return `${API_BASE_URL}${endpoint}`;
};