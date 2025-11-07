import type { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@/types';

/**
 * グローバルエラーハンドリングミドルウェア
 * 全てのエラーを統一フォーマットで処理
 */
export const errorHandler = (
        error: any,
        _req: Request,
        res: Response,
        _next: NextFunction
): void => {
        const statusCode = error.statusCode || 500;
        const message = error.message || 'サーバー内部エラー';

        res.status(statusCode).json({
                success: false,
                message,
                ...(error.code && { code: error.code })
        } as ApiResponse);
};