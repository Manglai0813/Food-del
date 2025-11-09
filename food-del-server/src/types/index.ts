export * from './common';

// 認証関連型
export * from './auth';

// ユーザー関連型
export * from './user';

// カテゴリー関連型 
export * from './category';

// 商品関連型 
export * from './food';

// 公開API用型
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

// カート関連型
export * from './cart';

// 注文関連型 
export * from './order';

// 在庫管理関連型 
export * from './inventory';

// ユーティリティ型 
export type { PaginationQuery, SortQuery, SearchQuery, BaseQuery } from './utils/pagination';
export type { CreateFoodSchema, PaginationSchema } from './utils/validation';

// API関連型 
export type {
    FileRequest,
    ParamsRequest,
    QueryRequest,
    BodyRequest,
    FullRequest,
    IdParams
} from './api/request';

// API完整応答型
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

// APIクエリパラメータ型
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