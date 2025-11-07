import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';
import { env } from '../lib/env';

/**
 * レート制限ミドルウェア
 * API保護とDDoS攻撃対策を提供します
 */

/**
 * IPアドレスがローカル開発環境かチェック
 */
const isLocalDevelopment = (req: Request): boolean => {
        const ip = req.ip || req.socket.remoteAddress || '';
        // ローカルIPまたは開発環境の場合はスキップ
        return env.NODE_ENV === 'development' ||
               ip === '127.0.0.1' ||
               ip === '::1' ||
               ip === '::ffff:127.0.0.1' ||
               ip.startsWith('192.168.') ||
               ip.startsWith('10.') ||
               ip.startsWith('172.16.');
};

/**
 * 一般的なAPIエンドポイント用レート制限
 * 環境変数で制御可能（開発環境では無効化可能）
 */
export const generalRateLimit = rateLimit({
        windowMs: env.RATE_LIMIT_WINDOW_MS, // 環境変数から取得
        max: env.RATE_LIMIT_MAX, // 環境変数から取得
        skip: (req: Request) => {
                // レート制限が無効化されている場合、またはローカル開発環境の場合はスキップ
                if (!env.RATE_LIMIT_ENABLED) {
                        return true;
                }
                return isLocalDevelopment(req);
        },
        message: {
                success: false,
                message: 'リクエストが多すぎます。15分後に再試行してください。',
                code: 'RATE_LIMIT_EXCEEDED',
                retryAfter: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000)
        },
        standardHeaders: true, // Rate limit情報をヘッダーに含める
        legacyHeaders: false, // 古いヘッダー形式は無効化
        // レスポンスのカスタマイズ
        handler: (req: Request, res: Response) => {
                console.warn(`[RATE_LIMIT] General limit exceeded for IP: ${req.ip} on ${req.path}`);
                res.status(429).json({
                        success: false,
                        message: 'リクエスト頻度が制限を超えました。しばらく待ってから再試行してください。',
                        retryAfter: Math.floor(env.RATE_LIMIT_WINDOW_MS / 1000),
                        timestamp: new Date().toISOString()
                });
        }
});

/**
 * 認証エンドポイント用厳格制限
 * 15分間で5リクエストまで（ブルートフォース攻撃対策）
 */
export const authRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000, // 15分間
        max: 5, // より厳格な制限
        message: {
                success: false,
                message: 'ログイン試行回数が上限に達しました。15分後に再試行してください。',
                code: 'AUTH_RATE_LIMIT_EXCEEDED'
        },
        skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
        handler: (req: Request, res: Response) => {
                res.status(429).json({
                        success: false,
                        message: 'セキュリティのため、ログイン試行が制限されています。15分後に再試行してください。',
                        code: 'AUTH_RATE_LIMIT_EXCEEDED',
                        retryAfter: 900,
                        timestamp: new Date().toISOString()
                });
        }
});

/**
 * 管理者エンドポイント用超厳格制限
 * 5分間で20リクエストまで
 */
export const adminRateLimit = rateLimit({
        windowMs: 5 * 60 * 1000, // 5分間
        max: 20, // 管理操作は少数に制限
        message: {
                success: false,
                message: '管理者操作の頻度制限に達しました。5分後に再試行してください。',
                code: 'ADMIN_RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
                const userId = (req as any).user?.id;
                console.warn(`[SECURITY] Admin rate limit reached for user: ${userId}, IP: ${req.ip}`);
                res.status(429).json({
                        success: false,
                        message: '管理者操作の頻度制限に達しました。5分後に再試行してください。',
                        code: 'ADMIN_RATE_LIMIT_EXCEEDED',
                        retryAfter: 300,
                        timestamp: new Date().toISOString()
                });
        }
});

/**
 * ファイルアップロード用制限
 * 10分間で5ファイルまで
 */
export const uploadRateLimit = rateLimit({
        windowMs: 10 * 60 * 1000, // 10分間
        max: 5, // ファイルアップロードは制限
        message: {
                success: false,
                message: 'ファイルアップロードの頻度制限に達しました。10分後に再試行してください。',
                code: 'UPLOAD_RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false
});

/**
 * パスワードリセット用制限
 * 1時間で3回まで
 */
export const passwordResetRateLimit = rateLimit({
        windowMs: 60 * 60 * 1000, // 1時間
        max: 3, // パスワードリセットは非常に制限
        message: {
                success: false,
                message: 'パスワードリセット試行回数が上限に達しました。1時間後に再試行してください。',
                code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req: Request, res: Response) => {
                console.warn(`[SECURITY] Password reset limit reached for IP: ${req.ip}`);
                res.status(429).json({
                        success: false,
                        message: 'パスワードリセット試行回数が上限に達しました。1時間後に再試行してください。',
                        code: 'PASSWORD_RESET_RATE_LIMIT_EXCEEDED',
                        retryAfter: 3600,
                        timestamp: new Date().toISOString()
                });
        }
});

/**
 * 動的レート制限（ユーザーの信頼度に基づく）
 * 認証済みユーザーには緩い制限、未認証には厳しい制限
 */
export const adaptiveRateLimit = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: (req: Request) => {
                const user = (req as any).user;

                if (!user) {
                        return 50; // 未認証ユーザーは半分
                }

                // ユーザーの役割に基づく制限
                switch (user.role) {
                        case 'admin':
                                return 200; // 管理者は2倍
                        case 'staff':
                                return 150; // スタッフは1.5倍
                        default:
                                return 100; // 一般ユーザー
                }
        },
        message: {
                success: false,
                message: 'リクエスト制限に達しました。しばらく待ってから再試行してください。',
                code: 'ADAPTIVE_RATE_LIMIT_EXCEEDED'
        },
        standardHeaders: true,
        legacyHeaders: false
});