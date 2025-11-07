/**
 * API定数とエンドポイント管理
 * サーバー仕様書に基づく統一的なAPI定義
 */

// ベースURL設定
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// APIエンドポイント定数
export const API_ENDPOINTS = {
        // 認証関連
        AUTH: {
                LOGIN: '/api/users/auth/login', // ログインエンドポイント
                REGISTER: '/api/users/auth/register', // ユーザー登録エンドポイント
                LOGOUT: '/api/users/auth/logout', // ログアウトエンドポイント
                REFRESH: '/api/users/auth/refresh', // トークンリフレッシュエンドポイント
                PROFILE: '/api/users/profile', // プロフィール取得エンドポイント
                UPDATE_PROFILE: '/api/users/profile', // プロフィール更新エンドポイント
                CHANGE_PASSWORD: '/api/users/auth/change-password', // パスワード変更エンドポイント
        },

        // 商品管理
        FOODS: {
                LIST: '/api/foods', // 公開商品一覧（公開商品のみ、limit=10）
                PUBLIC: '/api/foods/public', // クライアント専用商品一覧（公開商品のみ、limit=50）
                DASHBOARD_ALL: '/api/foods/dashboard/all', // Dashboard専用：全商品取得（非公開含む）
                FEATURED: '/api/foods/featured', // 注目商品取得
                DETAIL: (id: string | number) => `/api/foods/${id}`, // 商品詳細取得
                BY_CATEGORY: (id: string | number) => `/api/foods/category/${id}`, // カテゴリ別商品取得
                CREATE: '/api/foods', // 商品作成（管理者のみ）
                UPDATE: (id: string | number) => `/api/foods/${id}`, // 商品更新（管理者のみ）
                DELETE: (id: string | number) => `/api/foods/${id}`, // 商品削除（管理者のみ、ソフトデリート）
        },

        // カテゴリ管理
        CATEGORIES: {
                LIST: '/api/categories', // 全カテゴリ取得
                ACTIVE: '/api/categories/active', // 有効なカテゴリのみ取得
                DETAIL: (id: string | number) => `/api/categories/${id}`, // カテゴリ詳細取得
                FOODS: (id: string | number) => `/api/categories/${id}/foods`, // カテゴリ下の商品取得
                CREATE: '/api/categories', // カテゴリ作成（管理者のみ）
                UPDATE: (id: string | number) => `/api/categories/${id}`, // カテゴリ更新（管理者のみ）
                UPDATE_STATUS: (id: string | number) => `/api/categories/${id}/status`, // カテゴリステータス更新（管理者のみ）
                DELETE: (id: string | number) => `/api/categories/${id}`, // カテゴリ削除（管理者のみ）
        },

        // カート管理（認証必須）
        CART: {
                GET: '/api/carts', // カート情報取得
                ADD: '/api/carts/add', // カートに商品追加
                UPDATE_ITEM: (id: string | number) => `/api/carts/items/${id}`, // カート内商品数量更新
                DELETE_ITEM: (id: string | number) => `/api/carts/items/${id}`, // カートから商品削除
                CLEAR: '/api/carts/clear', // カートをクリア
                CHECKOUT: '/api/carts/checkout', // カート内容から注文作成
        },

        // 注文管理
        ORDERS: {
                // ユーザー用エンドポイント（認証必須）
                CREATE: '/api/orders', // カートから注文作成
                USER_LIST: '/api/orders', // 自分の注文一覧取得
                USER_DETAIL: (id: string | number) => `/api/orders/${id}`, // 自分の注文詳細取得
                USER_HISTORY: (id: string | number) => `/api/orders/${id}/history`, // 自分の注文履歴取得
                CANCEL: (id: string | number) => `/api/orders/${id}/cancel`, // 注文キャンセル

                // 管理者用エンドポイント（管理者のみ）
                ADMIN_STATS: '/api/orders/admin/stats', // 注文統計取得
                ADMIN_LIST: '/api/orders/admin', // 全注文一覧取得
                ADMIN_DETAIL: (id: string | number) => `/api/orders/admin/${id}`, // 任意の注文詳細取得
                ADMIN_HISTORY: (id: string | number) => `/api/orders/admin/${id}/history`, // 任意の注文履歴取得
                UPDATE_STATUS: (id: string | number) => `/api/orders/admin/${id}/status`, // 注文ステータス更新
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