// APIレスポンス形式
export interface ApiResponse<T = any> {
        success: boolean;
        message: string;
        data?: T;
        errors?: string[];
}

// ページネーションレスポンス形式
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
        pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
        };
}

// APIエラー応答形式
export interface ApiError {
        success: false;
        message: string;
        errors?: string[];
        code?: string;
        statusCode?: number;
}

// ビジネスロジック用ページネーションデータ型
export interface PaginatedData<T> {
        data: T[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
}