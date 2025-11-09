import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@/types';

// 汎用エラーハンドラーミドルウェア
export const errorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
): void => {
    // エラーからステータスコードとメッセージを抽出
    const statusCode = (error && typeof error === 'object' && 'statusCode' in error && typeof error.statusCode === 'number')
        ? error.statusCode
        : 500;

    // エラーメッセージを設定
    const message = (error instanceof Error) ? error.message : 'サーバー内部エラー';

    // レスポンスオブジェクトを作成して送信
    const response: ApiResponse<null> = {
        success: false,
        message
    };
    if (error && typeof error === 'object' && 'code' in error) {
        response.code = String(error.code);
    }
    res.status(statusCode).json(response);
};