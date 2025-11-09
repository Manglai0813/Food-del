import type { PaginationQuery, SortQuery, SearchQuery, BaseQuery } from '../utils/pagination';

// 商品検索・カテゴリー検索クエリ型
export type { FoodSearchQuery, CategorySearchQuery } from '../utils/validation';

// ユーザー検索クエリ型
export interface UserSearchQuery extends BaseQuery {
    role?: 'customer' | 'admin' | 'staff';
    status?: 'active' | 'inactive';
    registration_date_from?: string;
    registration_date_to?: string;
}

// 注文検索クエリ型
export type { OrderQuery } from '../order';

// カート検索クエリ型
export interface CartSearchQuery extends BaseQuery {
    user_id?: number;
    has_items?: boolean;
    created_date_from?: string;
    created_date_to?: string;
}

// 管理者用統計クエリ型
export interface AdminStatsQuery {
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    date_from?: string;
    date_to?: string;
    category_id?: number;
    include_cancelled?: boolean;
}

// 日付範囲クエリ型
export interface DateRangeQuery {
    date_from?: string;
    date_to?: string;
    period?: 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month';
}

// 価格範囲クエリ型
export interface PriceRangeQuery {
    price_min?: number;
    price_max?: number;
    currency?: string;
}

// ステータスフィルタークエリ型
export interface StatusFilterQuery {
    status?: boolean | string;
    include_inactive?: boolean;
}

// ソート専用クエリ型
export interface SortOnlyQuery {
    sort_by?: 'id' | 'name' | 'price' | 'created_at' | 'updated_at' | 'popularity';
    sort_order?: 'asc' | 'desc';
}

// フィルター組み合わせクエリ型
export interface CombinedFilterQuery extends BaseQuery, DateRangeQuery, PriceRangeQuery, StatusFilterQuery {
}

// 検索オプションクエリ型
export interface SearchOptionsQuery extends SearchQuery {
    search_fields?: string[];
    exact_match?: boolean;
    case_sensitive?: boolean;
}

// エクスポート用クエリ型
export interface ExportQuery {
    format?: 'csv' | 'xlsx' | 'pdf' | 'json';
    fields?: string[];
    include_headers?: boolean;
    date_format?: string;
}