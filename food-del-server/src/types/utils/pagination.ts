// ページネーションクエリパラメータ
export interface PaginationQuery {
        page?: number;
        limit?: number;
}

// ソートクエリパラメータ
export interface SortQuery {
        sortBy?: string;
        sortOrder?: 'asc' | 'desc';
}

// 検索クエリパラメータ
export interface SearchQuery {
        search?: string;
}

// 基本クエリ型（ページネーション・ソート・検索を組み合わせ）
export type BaseQuery = PaginationQuery & SortQuery & SearchQuery;