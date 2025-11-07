# セキュリティ実装・テストガイド

## 実装フェーズ詳細手順

本ガイドでは、セキュリティ強化機能の段階的実装手順とテスト方法を詳述します。各ステップでの学習ポイントと検証方法を含めた実践的なアプローチを提供します。

## フェーズ1: 基盤セキュリティの実装

### ステップ1: 開発環境の準備

#### 1.1 依存関係のインストール
```bash
# 基本セキュリティパッケージ
bun add express-rate-limit helmet express-slow-down

# 開発・テスト用パッケージ
bun add -d @types/express-rate-limit @types/jest supertest

# オプション: 高度なセキュリティ機能
bun add express-brute express-brute-memory ioredis
```

#### 1.2 TypeScript型定義の追加
```typescript
// src/types/security.ts
export interface RateLimitConfig {
    windowMs: number;
    max: number;
    message: string;
    standardHeaders: boolean;
    legacyHeaders: boolean;
}

export interface SecurityConfig {
    rateLimit: {
        general: RateLimitConfig;
        auth: RateLimitConfig;
        admin: RateLimitConfig;
    };
    request: {
        maxSize: string;
        timeout: number;
    };
    headers: {
        csp: string;
        hsts: boolean;
    };
}
```

### ステップ2: レート制限の実装

#### 2.1 基本レート制限ミドルウェア
```typescript
// src/middleware/rateLimiting.ts
import rateLimit from 'express-rate-limit';
import type { Request, Response } from 'express';

/**
 * 一般的なAPIエンドポイント用レート制限
 * 学習ポイント: 基本的なレート制限の仕組み
 */
export const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分間のウィンドウ
    max: 100, // ウィンドウ内での最大リクエスト数
    message: {
        success: false,
        message: 'リクエストが多すぎます。15分後に再試行してください。',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true, // Rate limit情報をヘッダーに含める
    legacyHeaders: false, // 古いヘッダー形式は無効化
    // IP取得ロジックのカスタマイズ
    keyGenerator: (req: Request) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
    },
    // レスポンスのカスタマイズ
    handler: (req: Request, res: Response) => {
        res.status(429).json({
            success: false,
            message: 'レート制限に達しました',
            retryAfter: Math.round(15 * 60), // 秒数
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * 認証エンドポイント用厳格制限
 * 学習ポイント: セキュリティクリティカルなエンドポイントの保護
 */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // より厳格な制限
    message: {
        success: false,
        message: 'ログイン試行回数が上限に達しました。15分後に再試行してください。',
        code: 'AUTH_RATE_LIMIT_EXCEEDED'
    },
    skipSuccessfulRequests: true, // 成功したリクエストはカウントしない
    // ログイン成功時の追跡
    onLimitReached: (req: Request, res: Response, options) => {
        console.warn(`Rate limit reached for IP: ${req.ip} on ${req.path}`);
        // セキュリティログに記録
    }
});

/**
 * 管理者エンドポイント用超厳格制限
 * 学習ポイント: 管理機能の高度な保護
 */
export const adminRateLimit = rateLimit({
    windowMs: 5 * 60 * 1000, // 5分間
    max: 20, // 管理操作は少数に制限
    message: {
        success: false,
        message: '管理者操作の頻度制限に達しました。5分後に再試行してください。',
        code: 'ADMIN_RATE_LIMIT_EXCEEDED'
    }
});
```

#### 2.2 動的レート制限（応用実装）
```typescript
// src/middleware/adaptiveRateLimit.ts
import rateLimit from 'express-rate-limit';
import type { Request } from 'express';

/**
 * ユーザーの信頼度に基づく適応的制限
 * 学習ポイント: 動的セキュリティポリシー
 */
export class AdaptiveRateLimit {
    createAdaptiveLimit() {
        return rateLimit({
            windowMs: 15 * 60 * 1000,
            max: (req: Request) => {
                return this.calculateUserLimit(req);
            },
            keyGenerator: (req: Request) => {
                // ユーザー認証済みの場合はユーザーIDを使用
                if (req.user?.id) {
                    return `user:${req.user.id}`;
                }
                return `ip:${req.ip}`;
            }
        });
    }

    private calculateUserLimit(req: Request): number {
        const baseLimit = 100;

        // 認証済みユーザー
        if (req.user) {
            const trustScore = this.calculateTrustScore(req.user);
            return Math.floor(baseLimit * trustScore);
        }

        // 匿名ユーザーは低い制限
        return baseLimit * 0.5;
    }

    private calculateTrustScore(user: any): number {
        let score = 1.0;

        // アカウント年数ボーナス
        const accountAge = this.getAccountAgeInMonths(user.created_at);
        score += Math.min(accountAge * 0.1, 1.0);

        // 役割による調整
        if (user.role === 'admin') score *= 2;
        if (user.role === 'staff') score *= 1.5;

        return Math.min(score, 3.0); // 最大3倍
    }

    private getAccountAgeInMonths(createdAt: Date): number {
        const now = new Date();
        return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24 * 30);
    }
}
```

### ステップ3: セキュリティヘッダーの実装

#### 3.1 Helmet設定
```typescript
// src/middleware/securityHeaders.ts
import helmet from 'helmet';
import type { Request, Response, NextFunction } from 'express';

/**
 * 包括的セキュリティヘッダー設定
 * 学習ポイント: HTTPセキュリティヘッダーの理解
 */
export const securityHeaders = helmet({
    // Content Type Options: MIMEタイプスニッフィング防止
    contentTypeOptions: {
        nosniff: true
    },

    // Frame Options: クリックジャッキング防止
    frameguard: {
        action: 'deny'
    },

    // XSS Filter: 反射型XSS攻撃の軽減
    xssFilter: true,

    // HTTP Strict Transport Security: HTTPS強制
    hsts: {
        maxAge: 31536000, // 1年
        includeSubDomains: true,
        preload: true
    },

    // Content Security Policy: XSS攻撃の包括的防止
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
            // 開発環境での調整
            ...(process.env.NODE_ENV === 'development' && {
                scriptSrc: ["'self'", "'unsafe-eval'"]
            })
        },
    },

    // Referrer Policy: リファラー情報の制御
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    },

    // DNS Prefetch Control: DNSプリフェッチの制御
    dnsPrefetchControl: {
        allow: false
    }
});

/**
 * カスタムセキュリティヘッダー
 * 学習ポイント: 追加のセキュリティ対策
 */
export const customSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
    // サーバー情報の隠蔽
    res.removeHeader('X-Powered-By');

    // APIバージョン情報
    res.setHeader('X-API-Version', '1.0');

    // セキュリティポリシーバージョン
    res.setHeader('X-Security-Policy', '2024.1');

    // Content Security Policy報告
    if (process.env.NODE_ENV === 'production') {
        res.setHeader('Report-To', JSON.stringify({
            group: 'csp-endpoint',
            max_age: 10886400,
            endpoints: [{ url: '/api/security/csp-report' }]
        }));
    }

    next();
};
```

### ステップ4: リクエスト制御の実装

#### 4.1 サイズ・タイムアウト制限
```typescript
// src/middleware/requestControl.ts
import type { Request, Response, NextFunction } from 'express';

/**
 * リクエストサイズ制限設定
 * 学習ポイント: DoS攻撃対策
 */
export const requestSizeLimits = {
    // JSON payload制限
    json: {
        limit: '1mb',
        type: 'application/json',
        verify: (req: Request, res: Response, buf: Buffer) => {
            // ペイロード検証
            if (buf.length > 1024 * 1024) { // 1MB
                throw new Error('ペイロードサイズが大きすぎます');
            }
        }
    },

    // URL-encoded制限
    urlencoded: {
        limit: '1mb',
        extended: true,
        parameterLimit: 1000 // パラメータ数制限
    },

    // Raw body制限
    raw: {
        limit: '1mb',
        type: 'application/octet-stream'
    }
};

/**
 * リクエストタイムアウト制御
 * 学習ポイント: リソース保護
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const timeout = setTimeout(() => {
            if (!res.headersSent) {
                // タイムアウトログの記録
                console.warn(`Request timeout: ${req.method} ${req.path} from ${req.ip}`);

                res.status(408).json({
                    success: false,
                    message: 'リクエストがタイムアウトしました',
                    code: 'REQUEST_TIMEOUT',
                    timestamp: new Date().toISOString()
                });
            }
        }, timeoutMs);

        // レスポンス完了時にタイムアウトをクリア
        res.on('finish', () => {
            clearTimeout(timeout);
        });

        // エラー時にもクリア
        res.on('close', () => {
            clearTimeout(timeout);
        });

        next();
    };
};

/**
 * リクエスト監視ミドルウェア
 * 学習ポイント: セキュリティ監視
 */
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // リクエスト情報のログ
    const logData = {
        method: req.method,
        path: req.path,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        contentLength: req.get('Content-Length'),
        timestamp: new Date().toISOString()
    };

    // 不審なパターンの検出
    if (this.detectSuspiciousPattern(req)) {
        console.warn('[SECURITY] Suspicious request detected:', logData);
    }

    // レスポンス完了時の処理
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        console.log(`${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`);
    });

    next();
};

// 不審なパターンの検出
function detectSuspiciousPattern(req: Request): boolean {
    // SQLインジェクション試行の検出
    const sqlPatterns = /('|(\\')|(;)|(\\;)|(select|insert|update|delete|drop|create|alter)/i;
    const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);

    if (sqlPatterns.test(queryString)) {
        return true;
    }

    // 異常に大きなヘッダー
    const headerSize = JSON.stringify(req.headers).length;
    if (headerSize > 8192) { // 8KB
        return true;
    }

    // パストラバーサル試行
    const pathTraversal = /(\.\.|\/\.\.|\\\.\.)/;
    if (pathTraversal.test(req.path)) {
        return true;
    }

    return false;
}
```

## フェーズ2: 高度なセキュリティ機能

### ステップ5: ブルートフォース攻撃対策

#### 5.1 ログイン試行制御
```typescript
// src/services/bruteForceProtection.ts
interface LoginAttemptRecord {
    email: string;
    attempts: number;
    firstAttempt: Date;
    lastAttempt: Date;
    lockedUntil?: Date;
    successCount: number;
}

/**
 * ブルートフォース攻撃対策サービス
 * 学習ポイント: 認証セキュリティの実装
 */
export class BruteForceProtection {
    private attempts = new Map<string, LoginAttemptRecord>();
    private readonly MAX_ATTEMPTS = 5;
    private readonly LOCK_TIME_MS = 15 * 60 * 1000; // 15分
    private readonly WINDOW_TIME_MS = 60 * 60 * 1000; // 1時間

    /**
     * ログイン試行の記録と検証
     */
    async recordLoginAttempt(email: string, success: boolean, ip: string): Promise<{
        allowed: boolean;
        lockedUntil?: Date;
        attemptsRemaining?: number;
    }> {
        const key = email.toLowerCase();
        const now = new Date();

        let record = this.attempts.get(key) || {
            email,
            attempts: 0,
            firstAttempt: now,
            lastAttempt: now,
            successCount: 0
        };

        // ロック時間の確認
        if (record.lockedUntil && now < record.lockedUntil) {
            return {
                allowed: false,
                lockedUntil: record.lockedUntil
            };
        }

        // ウィンドウ時間のリセット
        if (now.getTime() - record.firstAttempt.getTime() > this.WINDOW_TIME_MS) {
            record = {
                email,
                attempts: 0,
                firstAttempt: now,
                lastAttempt: now,
                successCount: record.successCount
            };
        }

        if (success) {
            // 成功時はカウンターをリセット
            record.successCount++;
            this.attempts.delete(key);

            // 成功ログの記録
            this.logSecurityEvent({
                type: 'LOGIN_SUCCESS',
                email,
                ip,
                timestamp: now
            });

            return { allowed: true };
        } else {
            // 失敗時はカウンターを増加
            record.attempts++;
            record.lastAttempt = now;

            if (record.attempts >= this.MAX_ATTEMPTS) {
                record.lockedUntil = new Date(now.getTime() + this.LOCK_TIME_MS);

                // ロックログの記録
                this.logSecurityEvent({
                    type: 'ACCOUNT_LOCKED',
                    email,
                    ip,
                    attempts: record.attempts,
                    timestamp: now
                });
            }

            this.attempts.set(key, record);

            return {
                allowed: record.attempts < this.MAX_ATTEMPTS,
                attemptsRemaining: Math.max(0, this.MAX_ATTEMPTS - record.attempts),
                ...(record.lockedUntil && { lockedUntil: record.lockedUntil })
            };
        }
    }

    /**
     * アカウントロック状態の確認
     */
    isAccountLocked(email: string): boolean {
        const record = this.attempts.get(email.toLowerCase());
        if (!record?.lockedUntil) return false;

        const now = new Date();
        if (now >= record.lockedUntil) {
            // ロック解除
            record.lockedUntil = undefined;
            return false;
        }

        return true;
    }

    /**
     * セキュリティイベントのログ記録
     */
    private logSecurityEvent(event: any) {
        // 構造化ログの出力
        console.log('[SECURITY_EVENT]', JSON.stringify(event, null, 2));

        // データベースへの記録（本番環境）
        if (process.env.NODE_ENV === 'production') {
            // await prisma.securityLog.create({ data: event });
        }
    }
}
```

#### 5.2 ユーザーコントローラーでの統合
```typescript
// src/controllers/userController.ts の修正
import { BruteForceProtection } from '@/services/bruteForceProtection';

const bruteForceProtection = new BruteForceProtection();

export const loginUser = async (req: BodyRequest<LoginRequest>, res: Response) => {
    const { email, password } = req.body;
    const clientIP = req.ip || 'unknown';

    try {
        // ブルートフォース保護の事前チェック
        if (bruteForceProtection.isAccountLocked(email)) {
            return res.status(423).json({
                success: false,
                message: 'アカウントが一時的にロックされています。15分後に再試行してください。',
                code: 'ACCOUNT_LOCKED'
            });
        }

        // 通常の認証処理
        const user = await prisma.user.findUnique({ where: { email } });
        const isPasswordValid = user && await AuthService.comparePassword(password, user.password);

        // ブルートフォース保護への記録
        const protectionResult = await bruteForceProtection.recordLoginAttempt(
            email,
            !!isPasswordValid,
            clientIP
        );

        if (!protectionResult.allowed) {
            return res.status(429).json({
                success: false,
                message: 'ログイン試行回数が上限に達しました。',
                lockedUntil: protectionResult.lockedUntil,
                code: 'TOO_MANY_ATTEMPTS'
            });
        }

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'メールアドレスまたはパスワードが正しくありません。',
                attemptsRemaining: protectionResult.attemptsRemaining
            });
        }

        // 成功時の処理
        const token = AuthService.createToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: 'ログインが成功しました',
            data: { token, user: { /* user data */ } }
        });

    } catch (error) {
        console.error('ログインエラー:', error);
        res.status(500).json({
            success: false,
            message: 'ログイン処理中にエラーが発生しました'
        });
    }
};
```

## フェーズ3: テストと検証

### ステップ6: セキュリティテストの実装

#### 6.1 レート制限テスト
```typescript
// tests/security/rateLimit.test.ts
import request from 'supertest';
import app from '../../index';

describe('Rate Limiting Security Tests', () => {
    beforeEach(() => {
        // テスト前のレート制限カウンターリセット
        jest.clearAllMocks();
    });

    test('一般APIのレート制限テスト', async () => {
        // 100回リクエストを送信
        const requests = Array(101).fill(null).map(() =>
            request(app).get('/api/food')
        );

        const responses = await Promise.all(requests);

        // 最後のリクエストはレート制限でブロックされる
        const lastResponse = responses[responses.length - 1];
        expect(lastResponse.status).toBe(429);
        expect(lastResponse.body.message).toContain('リクエストが多すぎます');
    });

    test('認証APIのレート制限テスト', async () => {
        const loginData = { email: 'test@example.com', password: 'wrongpassword' };

        // 6回連続でログイン失敗
        for (let i = 0; i < 6; i++) {
            const response = await request(app)
                .post('/api/user/auth/login')
                .send(loginData);

            if (i < 5) {
                expect(response.status).toBe(401); // 認証失敗
            } else {
                expect(response.status).toBe(429); // レート制限
            }
        }
    });

    test('レート制限ヘッダーの確認', async () => {
        const response = await request(app).get('/api/food');

        expect(response.headers['x-ratelimit-limit']).toBeDefined();
        expect(response.headers['x-ratelimit-remaining']).toBeDefined();
        expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
});
```

#### 6.2 セキュリティヘッダーテスト
```typescript
// tests/security/headers.test.ts
describe('Security Headers Tests', () => {
    test('セキュリティヘッダーの存在確認', async () => {
        const response = await request(app).get('/api/food');

        // 基本セキュリティヘッダー
        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('DENY');
        expect(response.headers['x-xss-protection']).toBe('1; mode=block');

        // HSTS（本番環境のみ）
        if (process.env.NODE_ENV === 'production') {
            expect(response.headers['strict-transport-security']).toBeDefined();
        }

        // CSP
        expect(response.headers['content-security-policy']).toBeDefined();
    });

    test('サーバー情報の隠蔽確認', async () => {
        const response = await request(app).get('/api/food');

        expect(response.headers['x-powered-by']).toBeUndefined();
        expect(response.headers['server']).toBeUndefined();
    });
});
```

#### 6.3 ブルートフォース対策テスト
```typescript
// tests/security/bruteForce.test.ts
describe('Brute Force Protection Tests', () => {
    test('ログイン試行制限テスト', async () => {
        const loginData = { email: 'test@example.com', password: 'wrongpassword' };

        // 5回失敗後にアカウントロック
        for (let i = 0; i < 6; i++) {
            const response = await request(app)
                .post('/api/user/auth/login')
                .send(loginData);

            if (i < 5) {
                expect(response.status).toBe(401);
                expect(response.body.attemptsRemaining).toBe(4 - i);
            } else {
                expect(response.status).toBe(423);
                expect(response.body.code).toBe('ACCOUNT_LOCKED');
            }
        }
    });

    test('アカウントロック後の正常ログインブロック', async () => {
        // アカウントをロック状態にする
        const wrongData = { email: 'user@example.com', password: 'wrong' };
        for (let i = 0; i < 5; i++) {
            await request(app).post('/api/user/auth/login').send(wrongData);
        }

        // 正しいパスワードでもブロックされる
        const correctData = { email: 'user@example.com', password: 'correctpassword' };
        const response = await request(app)
            .post('/api/user/auth/login')
            .send(correctData);

        expect(response.status).toBe(423);
    });
});
```

### ステップ7: セキュリティ監査とモニタリング

#### 7.1 セキュリティログシステム
```typescript
// src/services/securityMonitoring.ts
interface SecurityMetrics {
    totalRequests: number;
    rateLimitHits: number;
    authFailures: number;
    suspiciousActivities: number;
    blockedIPs: Set<string>;
}

export class SecurityMonitoring {
    private metrics: SecurityMetrics = {
        totalRequests: 0,
        rateLimitHits: 0,
        authFailures: 0,
        suspiciousActivities: 0,
        blockedIPs: new Set()
    };

    /**
     * セキュリティイベントの記録
     */
    recordSecurityEvent(event: {
        type: 'RATE_LIMIT' | 'AUTH_FAILURE' | 'SUSPICIOUS' | 'BLOCKED_IP';
        ip: string;
        details?: any;
    }) {
        switch (event.type) {
            case 'RATE_LIMIT':
                this.metrics.rateLimitHits++;
                break;
            case 'AUTH_FAILURE':
                this.metrics.authFailures++;
                break;
            case 'SUSPICIOUS':
                this.metrics.suspiciousActivities++;
                break;
            case 'BLOCKED_IP':
                this.metrics.blockedIPs.add(event.ip);
                break;
        }

        // アラート条件の確認
        this.checkAlertConditions();
    }

    /**
     * メトリクスレポートの生成
     */
    generateSecurityReport(): object {
        return {
            timestamp: new Date().toISOString(),
            metrics: {
                ...this.metrics,
                blockedIPs: Array.from(this.metrics.blockedIPs)
            },
            alertLevel: this.calculateAlertLevel()
        };
    }

    private checkAlertConditions() {
        // 高頻度の認証失敗
        if (this.metrics.authFailures > 50) {
            this.sendAlert('HIGH_AUTH_FAILURE_RATE');
        }

        // 多数の不審な活動
        if (this.metrics.suspiciousActivities > 20) {
            this.sendAlert('HIGH_SUSPICIOUS_ACTIVITY');
        }
    }

    private calculateAlertLevel(): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
        const totalIncidents = this.metrics.rateLimitHits +
                              this.metrics.authFailures +
                              this.metrics.suspiciousActivities;

        if (totalIncidents > 100) return 'CRITICAL';
        if (totalIncidents > 50) return 'HIGH';
        if (totalIncidents > 20) return 'MEDIUM';
        return 'LOW';
    }

    private sendAlert(type: string) {
        console.error(`[SECURITY ALERT] ${type}:`, this.generateSecurityReport());
        // 本番環境では外部アラートシステムに送信
    }
}
```

## パフォーマンステストと最適化

### ステップ8: 負荷テストとパフォーマンス検証

#### 8.1 負荷テストスクリプト
```typescript
// tests/performance/loadTest.ts
import { performance } from 'perf_hooks';

/**
 * セキュリティ機能の負荷テスト
 */
export class SecurityLoadTest {
    async testRateLimitPerformance() {
        const startTime = performance.now();
        const concurrentRequests = 50;

        const requests = Array(concurrentRequests).fill(null).map(async () => {
            return request(app).get('/api/food');
        });

        const responses = await Promise.all(requests);
        const endTime = performance.now();

        const successCount = responses.filter(r => r.status === 200).length;
        const rateLimitedCount = responses.filter(r => r.status === 429).length;

        console.log(`Load Test Results:
            Duration: ${endTime - startTime}ms
            Successful: ${successCount}
            Rate Limited: ${rateLimitedCount}
            Average Response Time: ${(endTime - startTime) / concurrentRequests}ms
        `);

        return {
            duration: endTime - startTime,
            successRate: successCount / concurrentRequests,
            rateLimitEffectiveness: rateLimitedCount / concurrentRequests
        };
    }
}
```

### デプロイメント前チェックリスト

#### セキュリティ確認項目
- [ ] レート制限が正常に動作している
- [ ] セキュリティヘッダーが設定されている
- [ ] JWT SECRET が本番用の安全な値に設定されている
- [ ] エラーメッセージが情報漏洩していない
- [ ] ブルートフォース対策が機能している
- [ ] セキュリティテストがすべて合格している
- [ ] 負荷テストでパフォーマンス低下が許容範囲内
- [ ] ログ機能が正常に動作している

#### 本番環境設定
```bash
# .env.production
NODE_ENV=production
JWT_SECRET=<256-bit-secure-random-secret>
JWT_REFRESH_SECRET=<256-bit-secure-random-refresh-secret>
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
```

この実装ガイドにより、段階的かつ確実にセキュリティ機能を追加し、各段階でテストによる検証を行うことができます。学習効果を最大化するため、各実装段階での理解確認と、実際の攻撃シナリオでのテストを推奨します。