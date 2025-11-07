import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import type { ApiResponse } from '../types/common';

/**
 * Zodバリデーションミドルウェア
 * リクエスト検証とエラーハンドリングを提供します
 */

// バリデーション対象の種類
type ValidationType = 'body' | 'query' | 'params';

/**
 * Zodスキーマに基づくリクエストボディバリデーション
 */
export const validateBody = <T>(schema: z.ZodSchema<T>) => {
        return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
                try {
                        const result = schema.safeParse(req.body);

                        if (!result.success) {
                                res.status(400).json({
                                        success: false,
                                        message: 'リクエストボディの検証に失敗しました',
                                        errors: result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
                                });
                                return;
                        }

                        // バリデーション済みデータをリクエストに設定
                        req.body = result.data;
                        next();
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: 'バリデーション処理中にエラーが発生しました',
                                errors: [(error as Error).message]
                        });
                }
        };
};

/**
 * Zodスキーマに基づくクエリパラメータバリデーション
 */
export const validateQuery = <T>(schema: z.ZodSchema<T>) => {
        return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
                try {
                        const result = schema.safeParse(req.query);

                        if (!result.success) {
                                res.status(400).json({
                                        success: false,
                                        message: 'クエリパラメータの検証に失敗しました',
                                        errors: result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
                                });
                                return;
                        }

                        // バリデーション済みデータをリクエストに設定
                        req.query = result.data as any;
                        next();
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: 'バリデーション処理中にエラーが発生しました',
                                errors: [(error as Error).message]
                        });
                }
        };
};

/**
 * Zodスキーマに基づくパスパラメータバリデーション
 */
export const validateParams = <T>(schema: z.ZodSchema<T>) => {
        return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
                try {
                        const result = schema.safeParse(req.params);

                        if (!result.success) {
                                res.status(400).json({
                                        success: false,
                                        message: 'パスパラメータの検証に失敗しました',
                                        errors: result.error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
                                });
                                return;
                        }

                        // バリデーション済みデータをリクエストに設定
                        req.params = result.data as any;
                        next();
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: 'バリデーション処理中にエラーが発生しました',
                                errors: [(error as Error).message]
                        });
                }
        };
};

/**
 * 複数箇所を同時にバリデーションする汎用ミドルウェア
 */
export const validate = (schemas: {
        body?: z.ZodSchema<any>;
        query?: z.ZodSchema<any>;
        params?: z.ZodSchema<any>;
}) => {
        return (req: Request, res: Response<ApiResponse>, next: NextFunction): void => {
                try {
                        const errors: string[] = [];

                        // ボディバリデーション
                        if (schemas.body) {
                                const bodyResult = schemas.body.safeParse(req.body);
                                if (!bodyResult.success) {
                                        errors.push(...bodyResult.error.issues.map((err: z.ZodIssue) => `body.${err.path.join('.')}: ${err.message}`));
                                } else {
                                        req.body = bodyResult.data;
                                }
                        }

                        // クエリバリデーション
                        if (schemas.query) {
                                const queryResult = schemas.query.safeParse(req.query);
                                if (!queryResult.success) {
                                        errors.push(...queryResult.error.issues.map((err: z.ZodIssue) => `query.${err.path.join('.')}: ${err.message}`));
                                } else {
                                        req.query = queryResult.data as any;
                                }
                        }

                        // パラメータバリデーション
                        if (schemas.params) {
                                const paramsResult = schemas.params.safeParse(req.params);
                                if (!paramsResult.success) {
                                        errors.push(...paramsResult.error.issues.map((err: z.ZodIssue) => `params.${err.path.join('.')}: ${err.message}`));
                                } else {
                                        req.params = paramsResult.data as any;
                                }
                        }

                        if (errors.length > 0) {
                                res.status(400).json({
                                        success: false,
                                        message: 'リクエスト検証に失敗しました',
                                        errors
                                });
                                return;
                        }

                        next();
                } catch (error) {
                        res.status(500).json({
                                success: false,
                                message: 'バリデーション処理中にエラーが発生しました',
                                errors: [(error as Error).message]
                        });
                }
        };
};

/**
 * 共通パスパラメータスキーマ
 */
export const IdParamsSchema = z.object({
        id: z.coerce.number().positive('IDは正の数値である必要があります')
});

export type IdParams = z.infer<typeof IdParamsSchema>;