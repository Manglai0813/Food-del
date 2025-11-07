import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

/**
 * セキュリティヘッダー設定
 * XSS、クリックジャッキング、その他の攻撃から保護
 */

/**
 * Helmet.jsを使用した包括的セキュリティヘッダー設定
 */
export const securityHeaders = helmet({
        // Frame Options: クリックジャッキング防止
        frameguard: {
                action: 'deny'
        },

        // HTTP Strict Transport Security: HTTPS強制（本番環境のみ）
        hsts: process.env.NODE_ENV === 'production' ? {
                maxAge: 31536000, // 1年間
                includeSubDomains: true,
                preload: true
        } : false,

        // Content Security Policy: XSS攻撃の包括的防止
        contentSecurityPolicy: {
                directives: {
                        defaultSrc: ["'self'"],
                        styleSrc: [
                                "'self'",
                                "'unsafe-inline'", // CSSフレームワーク用（必要に応じて）
                                "https://fonts.googleapis.com"
                        ],
                        scriptSrc: [
                                "'self'",
                                // 開発環境では eval() を許可（Hot reload用）
                                ...(process.env.NODE_ENV === 'development' ? ["'unsafe-eval'"] : [])
                        ],
                        imgSrc: [
                                "'self'",
                                "data:",
                                "https:",
                                "blob:" // アップロード画像のプレビュー用
                        ],
                        connectSrc: [
                                "'self'",
                                // WebSocket接続（開発環境）
                                ...(process.env.NODE_ENV === 'development' ? ["ws:", "wss:"] : [])
                        ],
                        fontSrc: [
                                "'self'",
                                "https://fonts.gstatic.com"
                        ],
                        objectSrc: ["'none'"], // Flash等のプラグイン禁止
                        mediaSrc: ["'self'"],
                        frameSrc: ["'none'"], // iframe禁止
                        baseUri: ["'self'"], // base タグ制限
                        formAction: ["'self'"], // form送信先制限
                },
                // CSP違反レポート（本番環境）
                ...(process.env.NODE_ENV === 'production' && {
                        reportOnly: false, // 違反時はブロック
                })
        },

        // Referrer Policy: リファラー情報の制御
        referrerPolicy: {
                policy: 'strict-origin-when-cross-origin'
        },

        // DNS Prefetch Control: DNSプリフェッチの制御
        dnsPrefetchControl: {
                allow: false
        },

        // Origin Agent Cluster: オリジンエージェントクラスター分離
        originAgentCluster: true,

        // Cross-Origin-Resource-Policy: 静的リソースのクロスオリジンアクセス許可
        crossOriginResourcePolicy: {
                policy: 'cross-origin' // 画像などの静的リソースをクロスオリジンで共有可能に
        }
});

/**
 * カスタムセキュリティヘッダー
 * 追加のセキュリティ対策とAPI情報
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
        // サーバー情報の隠蔽
        res.removeHeader('X-Powered-By');
        res.removeHeader('Server');

        // API情報ヘッダー
        res.setHeader('X-API-Version', '1.0');
        res.setHeader('X-Security-Policy', '2024.1');

        // クロスドメインポリシー
        res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');

        // ダウンロード制御
        res.setHeader('X-Download-Options', 'noopen');

        // Content Type 設定の強制
        if (req.path.startsWith('/api/')) {
                res.setHeader('Content-Type', 'application/json; charset=utf-8');
        }

        // キャッシュ制御（セキュリティ重要なエンドポイント）
        if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
                res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
                res.setHeader('Pragma', 'no-cache');
                res.setHeader('Expires', '0');
                res.setHeader('Surrogate-Control', 'no-store');
        }

        // CSRF対策用ヘッダー（POST/PUT/DELETE時）
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
                res.setHeader('X-Content-Type-Options', 'nosniff');
                res.setHeader('X-Frame-Options', 'DENY');
        }

        next();
};

/**
 * セキュリティレスポンス監査ヘッダー
 * セキュリティイベントの追跡用
 */
export const securityAuditHeaders = (req: Request, res: Response, next: NextFunction) => {
        // リクエストID生成（ログ追跡用）
        const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        req.headers['x-request-id'] = requestId;
        res.setHeader('X-Request-ID', requestId);

        // セキュリティ関連の監査情報
        if (req.path.includes('/auth/') || req.path.includes('/admin/')) {
                res.setHeader('X-Security-Audit', 'enabled');
        }

        // レスポンス完了時のログ記録
        res.on('finish', () => {
                if (res.statusCode >= 400) {
                        console.log(`[SECURITY_AUDIT] ${req.method} ${req.path} - ${res.statusCode} - RequestID: ${requestId}`);
                }
        });

        next();
};

/**
 * CORS セキュリティ強化
 * 既存のCORS設定に加えて追加のセキュリティ
 */
export const enhancedCorsHeaders = (req: Request, res: Response, next: NextFunction) => {
        const origin = req.get('Origin');

        // 許可されたOriginリスト
        let allowedOrigins: string[];

        if (process.env.NODE_ENV === 'development') {
                // 開発環境では localhost と 127.0.0.1 を許可（ポートは 3000-3999）
                allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001'];
        } else {
                allowedOrigins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:3000'];
        }

        // Origin検証の強化
        if (origin && !allowedOrigins.includes(origin)) {
                console.warn(`[SECURITY] Blocked request from unauthorized origin: ${origin}`);
                console.warn(`[SECURITY] Allowed origins: ${allowedOrigins.join(', ')}`);

                // 不正なOriginからのリクエストを記録
                if (req.path.startsWith('/api/')) {
                        res.status(403).json({
                                success: false,
                                message: 'アクセスが拒否されました',
                                code: 'CORS_ORIGIN_DENIED'
                        });
                        return;
                }
        }

        // Preflight リクエストのセキュリティ強化
        if (req.method === 'OPTIONS') {
                res.setHeader('Access-Control-Max-Age', '300'); // 5分間キャッシュ
                res.setHeader('Vary', 'Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
        }

        next();
};