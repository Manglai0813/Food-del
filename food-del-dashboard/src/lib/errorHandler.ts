import { ERROR_MESSAGES, HTTP_STATUS } from './apiConstants';
// エラー処理ユーティリティ

// カスタムエラー型定義
export class ApiError extends Error {
    public status: number;
    public code?: string;
    public details?: unknown;

    constructor(
        message: string,
        status: number,
        code?: string,
        details?: unknown
    ) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}

// エラーレスポンス型定義
export interface ErrorResponse {
    success: false;
    error: string;
    details?: {
        field?: string;
        message?: string;
    } | Array<{
        field: string;
        message: string;
    }>;
}

// HTTPエラー処理
export const handleHttpError = (error: unknown): ApiError => {
    const err = error as { response?: { status: number; data?: unknown } };
    // ネットワークエラー
    if (!err.response) {
        return new ApiError(
            ERROR_MESSAGES.SYSTEM.NETWORK_ERROR,
            0,
            'NETWORK_ERROR'
        );
    }

    // ステータスコードとデータを取得
    const { status, data } = err.response!;

    // エラーデータを取得
    const errorData = data as { message?: string; error?: string; details?: unknown } | undefined;

    // ステータスコードに基づくエラー処理
    switch (status) {
        case HTTP_STATUS.BAD_REQUEST:
            return new ApiError(
                errorData?.message || errorData?.error || '不正なリクエストです',
                status,
                'BAD_REQUEST',
                errorData?.details
            );

        case HTTP_STATUS.UNAUTHORIZED:
            return new ApiError(
                errorData?.message || ERROR_MESSAGES.AUTH.INVALID_CREDENTIALS,
                status,
                'UNAUTHORIZED'
            );

        case HTTP_STATUS.FORBIDDEN:
            return new ApiError(
                errorData?.message || ERROR_MESSAGES.AUTH.ACCESS_DENIED,
                status,
                'FORBIDDEN'
            );

        case HTTP_STATUS.NOT_FOUND:
            return new ApiError(
                errorData?.message || 'リソースが見つかりません',
                status,
                'NOT_FOUND'
            );

        case HTTP_STATUS.CONFLICT:
            return new ApiError(
                errorData?.message || 'データが競合しています',
                status,
                'CONFLICT'
            );

        case HTTP_STATUS.UNPROCESSABLE_ENTITY:
            return new ApiError(
                errorData?.message || errorData?.error || 'バリデーションエラー',
                status,
                'VALIDATION_ERROR',
                errorData?.details
            );

        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
            return new ApiError(
                errorData?.message || ERROR_MESSAGES.SYSTEM.SERVER_ERROR,
                status,
                'SERVER_ERROR'
            );

        default:
            return new ApiError(
                errorData?.message || errorData?.error || ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR,
                status,
                'UNKNOWN_ERROR'
            );
    }
};

// バリデーションエラー処理
export const handleValidationError = (errors: Array<{ message?: string }>): string => {
    if (!errors || errors.length === 0) {
        return ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
    }

    // 最初のエラーメッセージを返す
    return errors[0]?.message || ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD;
};

// 業務ロジックエラー処理
export const handleBusinessError = (code: string): string => {
    switch (code) {
        case 'FOOD_NOT_AVAILABLE':
            return ERROR_MESSAGES.BUSINESS.FOOD_NOT_AVAILABLE;
        case 'INSUFFICIENT_STOCK':
            return ERROR_MESSAGES.BUSINESS.INSUFFICIENT_STOCK;
        case 'CART_EMPTY':
            return ERROR_MESSAGES.BUSINESS.CART_EMPTY;
        case 'ORDER_CANNOT_BE_CANCELLED':
            return ERROR_MESSAGES.BUSINESS.ORDER_CANNOT_BE_CANCELLED;
        default:
            return ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR;
    }
};

// エラーメッセージ表示用ヘルパー
export const getErrorMessage = (error: unknown): string => {
    if (error instanceof ApiError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return ERROR_MESSAGES.SYSTEM.UNKNOWN_ERROR;
};

// エラーログ出力
export const logError = (error: unknown, context?: string): void => {
    const errorMessage = getErrorMessage(error);
    const logContext = context ? `[${context}]` : '';

    console.error(`${logContext} エラー:`, errorMessage);

    if (error instanceof ApiError) {
        console.error('詳細:', {
            status: error.status,
            code: error.code,
            details: error.details,
        });
    }
};

// API呼び出しエラーハンドラー
export const createApiErrorHandler = (context: string) => {
    return (error: unknown) => {
        const apiError = error instanceof ApiError ? error : handleHttpError(error);
        logError(apiError, context);
        throw apiError;
    };
};