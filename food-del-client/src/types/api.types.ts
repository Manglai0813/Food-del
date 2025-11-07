/**
 * APIレスポンス型定義
 * バックエンドのcommon.tsに対応
 */

// 基本APIレスポンス形式
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