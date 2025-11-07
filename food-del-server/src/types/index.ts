// 共通型 （APIレスポンス、エラーハンドリング等）
export * from './common';

// 認証関連型（AuthRequest, LoginData, TokenRefreshData等）
export * from './auth';

// ユーザー関連型 （UserProfile, UpdateUserData等）
export * from './user';

// カテゴリー関連型 (CategoryItem, CreateCategoryData等)
export * from './category';

// 商品関連型 (FoodItem, CreateFoodData, UpdateFoodData等)
export * from './food';

// 公開API用型（敏感情報を除外）
export type {
        PublicFood,
        PublicFoodWithCategory,
        PublicFoodSearchResult,
        FoodAvailability,
        CartFoodInfo,
} from './public';

// 公開API変換関数
export {
        toPublicFood,
        toPublicFoodWithCategory,
        toPublicFoodArray,
        createAvailability,
} from './public';

// ファイル関連型
export * from './file';

// カート関連型 (CartItem, AddToCartData, UpdateCartData等)
export * from './cart';

// 注文関連型 (OrderItem, CreateOrderData, UpdateOrderStatusData等)
export * from './order';

// 在庫管理関連型 (InventoryHistory, StockInfo, UpdateStockRequest等)
export * from './inventory';

// ユーティリティ型 （PaginationQuery, SortQuery, SearchQuery等）
export type { PaginationQuery, SortQuery, SearchQuery, BaseQuery } from './utils/pagination';
export type { CreateFoodSchema, PaginationSchema } from './utils/validation';

// API関連型 （リクエスト、レスポンス、クエリパラメータ等）
export type {
        FileRequest,
        ParamsRequest,
        QueryRequest,
        BodyRequest,
        FullRequest,
        IdParams
} from './api/request';

// API完整応答型（success, message, data構造を含む）
export type {
        AuthSuccessResponse,
        TokenRefreshResponse,
        UserProfileResponse,
        FoodItemResponse,
        FoodListResponse,
        CategoryResponse,
        CategoryListResponse,
        FileUploadResponse
} from './api/response';

// APIクエリパラメータ型（フィルタリング、ソート、ページネーション等）
export type {
        FoodSearchQuery,
        CategorySearchQuery,
        UserSearchQuery,
        OrderQuery,
        CartSearchQuery,
        AdminStatsQuery,
        DateRangeQuery,
        PriceRangeQuery,
        StatusFilterQuery,
        SortOnlyQuery,
        CombinedFilterQuery,
        SearchOptionsQuery,
        ExportQuery
} from './api/query';

// Prisma型の再エクスポート
export type {
        User,
        Category,
        Food,
        Cart,
        CartItem,
        Order,
        OrderItem,
        InventoryHistory,
        Prisma
} from '@prisma/client';