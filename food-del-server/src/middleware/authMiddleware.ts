import type { Response, NextFunction } from 'express';
import type { AuthRequest, ApiResponse } from '@/types';
import { isJwtPayload } from '@/types';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

/**
 * ユーザー認証ミドルウェア
 * すべてのログインユーザー用
 */
export const isAuthenticated = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
): Promise<void> => {
        try {
                // Authorizationヘッダーを取得
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        res.status(401).json({
                                success: false,
                                message: "アクセストークンが必要です"
                        } as ApiResponse);
                        return;
                }

                // JWTトークンを検証
                const token = authHeader.split(' ')[1];
                if (!token) {
                        res.status(401).json({
                                success: false,
                                message: "トークンが無効です"
                        } as ApiResponse);
                        return;
                }

                const decoded = jwt.verify(token, env.JWT_SECRET);

                // JWT验证类型安全检查
                if (!isJwtPayload(decoded)) {
                        res.status(401).json({
                                success: false,
                                message: "無効なトークンペイロードです"
                        } as ApiResponse);
                        return;
                }

                // ユーザー情報を取得
                const user = await prisma.user.findUnique({
                        where: { id: decoded.id },
                        select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                phone: true,
                                created_at: true,
                                updated_at: true
                                // パスワードは返却しない
                        }
                });

                // ユーザーが存在しない場合はエラー
                if (!user) {
                        res.status(404).json({
                                success: false,
                                message: "ユーザーが見つかりません"
                        } as ApiResponse);
                        return;
                }

                // ユーザー情報をリクエストに追加
                req.user = user;
                next();

        } catch (error) {
                if (error instanceof jwt.JsonWebTokenError) {
                        res.status(401).json({
                                success: false,
                                message: "トークンが無効です"
                        } as ApiResponse);
                        return;
                }

                if (error instanceof jwt.TokenExpiredError) {
                        res.status(401).json({
                                success: false,
                                message: "トークンの有効期限が切れています",
                                code: "TOKEN_EXPIRED"
                        } as ApiResponse);
                        return;
                }

                // 認証エラーをログ出力
                console.error('認証エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "サーバー内部エラー"
                } as ApiResponse);
                return;
        }
};

/**
 * ユーザーが管理者であるか検証する（認証 + 権限チェック統合版）
 * JWT認証と管理者権限を同時にチェック
 */
export const isAdmin = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
): Promise<void> => {
        try {
                // まずJWT認証を実行
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        res.status(401).json({
                                success: false,
                                message: "アクセストークンが必要です"
                        } as ApiResponse);
                        return;
                }

                const token = authHeader.split(' ')[1];
                if (!token) {
                        res.status(401).json({
                                success: false,
                                message: "トークンが無効です"
                        } as ApiResponse);
                        return;
                }

                const decoded = jwt.verify(token, env.JWT_SECRET);

                if (!isJwtPayload(decoded)) {
                        res.status(401).json({
                                success: false,
                                message: "無効なトークンペイロードです"
                        } as ApiResponse);
                        return;
                }

                // ユーザー情報を取得
                const user = await prisma.user.findUnique({
                        where: { id: decoded.id },
                        select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                phone: true,
                                created_at: true,
                                updated_at: true
                        }
                });

                if (!user) {
                        res.status(404).json({
                                success: false,
                                message: "ユーザーが見つかりません"
                        } as ApiResponse);
                        return;
                }

                // 管理者権限チェック
                if (user.role !== 'admin') {
                        res.status(403).json({
                                success: false,
                                message: "管理者権限が必要です",
                                code: "INSUFFICIENT_PERMISSIONS"
                        } as ApiResponse);
                        return;
                }

                // ユーザー情報をリクエストに追加
                req.user = user;
                next();

        } catch (error) {
                if (error instanceof jwt.JsonWebTokenError) {
                        res.status(401).json({
                                success: false,
                                message: "トークンが無効です"
                        } as ApiResponse);
                        return;
                }

                if (error instanceof jwt.TokenExpiredError) {
                        res.status(401).json({
                                success: false,
                                message: "トークンの有効期限が切れています",
                                code: "TOKEN_EXPIRED"
                        } as ApiResponse);
                        return;
                }

                console.error('認証エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "サーバー内部エラー"
                } as ApiResponse);
                return;
        }
};

/**
 * ユーザーが従業員（管理者またはスタッフ）であるか検証する（認証 + 権限チェック統合版）
 */
export const isStaff = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
): Promise<void> => {
        try {
                // JWT認証を実行
                const authHeader = req.headers.authorization;
                if (!authHeader || !authHeader.startsWith('Bearer ')) {
                        res.status(401).json({
                                success: false,
                                message: "アクセストークンが必要です"
                        } as ApiResponse);
                        return;
                }

                const token = authHeader.split(' ')[1];
                if (!token) {
                        res.status(401).json({
                                success: false,
                                message: "トークンが無効です"
                        } as ApiResponse);
                        return;
                }

                const decoded = jwt.verify(token, env.JWT_SECRET);

                if (!isJwtPayload(decoded)) {
                        res.status(401).json({
                                success: false,
                                message: "無効なトークンペイロードです"
                        } as ApiResponse);
                        return;
                }

                // ユーザー情報を取得
                const user = await prisma.user.findUnique({
                        where: { id: decoded.id },
                        select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                phone: true,
                                created_at: true,
                                updated_at: true
                        }
                });

                if (!user) {
                        res.status(404).json({
                                success: false,
                                message: "ユーザーが見つかりません"
                        } as ApiResponse);
                        return;
                }

                // スタッフ権限チェック
                const allowedRoles = ['admin', 'staff'];
                if (!allowedRoles.includes(user.role)) {
                        res.status(403).json({
                                success: false,
                                message: "スタッフ権限が必要です"
                        } as ApiResponse);
                        return;
                }

                // ユーザー情報をリクエストに追加
                req.user = user;
                next();

        } catch (error) {
                if (error instanceof jwt.JsonWebTokenError) {
                        res.status(401).json({
                                success: false,
                                message: "トークンが無効です"
                        } as ApiResponse);
                        return;
                }

                if (error instanceof jwt.TokenExpiredError) {
                        res.status(401).json({
                                success: false,
                                message: "トークンの有効期限が切れています",
                                code: "TOKEN_EXPIRED"
                        } as ApiResponse);
                        return;
                }

                console.error('認証エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "サーバー内部エラー"
                } as ApiResponse);
                return;
        }
};