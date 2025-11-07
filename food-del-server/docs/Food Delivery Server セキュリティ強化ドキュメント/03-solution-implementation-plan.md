# セキュリティ強化実装計画

## 実装戦略概要

本文書では、特定されたセキュリティ脆弱性に対する具体的な解決策と実装アプローチを詳述します。学習プロジェクトとしての価値を最大化するため、段階的な実装計画を採用します。

## 実装アーキテクチャ設計

### セキュリティ層の追加
```
┌─────────────────────────────────────┐
│         Security Middleware Layer   │
├─────────────────────────────────────┤
│ Rate Limiting │ Security Headers    │
│ Request Size  │ Timeout Control     │
│ Brute Force   │ IP Control          │
│ Monitoring    │ Audit Logging       │
└─────────────────────────────────────┘
          │
┌─────────────────────────────────────┐
│         Existing Application        │
│   Controllers → Services → DB       │
└─────────────────────────────────────┘
```

## P0級対策（緊急実装）

### 🛡️ **解決策1: APIレート制限の実装**

#### 技術選択理由
- **express-rate-limit**: シンプルで軽量、学習に最適
- **メモリストレージ**: 学習環境に適した簡単な設定
- **段階的制限**: ユーザビリティを考慮した設計

#### 実装設計
```typescript
// src/middleware/rateLimiting.ts
import rateLimit from 'express-rate-limit';

/**
 * 一般的なAPIエンドポイント用レート制限
 * 15分間で100リクエストまで
 */
export const generalRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // 最大リクエスト数
    message: {
        success: false,
        message: 'リクエストが多すぎます。しばらく待ってから再試行してください。',
        retryAfter: '15分'
    },
    standardHeaders: true, // Rate limit情報をヘッダーに含める
    legacyHeaders: false,
});

/**
 * 認証エンドポイント用厳格制限
 * 15分間で5リクエストまで
 */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'ログイン試行回数が上限に達しました。15分後に再試行してください。',
        code: 'TOO_MANY_LOGIN_ATTEMPTS'
    },
    skipSuccessfulRequests: true, // 成功時はカウントしない
});
```

#### 適用方法
```typescript
// src/routes/userRouter.ts の変更
import { authRateLimit } from '@/middleware/rateLimiting';

// 認証系エンドポイントに適用
userRouter.post("/auth/login", authRateLimit, loginUser);
userRouter.post("/auth/register", authRateLimit, registerUser);
```

### 🛡️ **解決策2: セキュリティヘッダーの実装**

#### Helmet.js設定
```typescript
// src/middleware/security.ts
import helmet from 'helmet';

export const securityHeaders = helmet({
    // コンテンツタイプスニッフィング防止
    contentTypeOptions: {
        nosniff: true
    },

    // クリックジャッキング防止
    frameguard: {
        action: 'deny'
    },

    // XSS フィルター有効化
    xssFilter: true,

    // HTTPS強制（本番環境）
    hsts: {
        maxAge: 31536000, // 1年
        includeSubDomains: true,
        preload: true
    },

    // Content Security Policy
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
        },
    },

    // リファラーポリシー
    referrerPolicy: {
        policy: 'strict-origin-when-cross-origin'
    }
});
```

### 🛡️ **解決策3: リクエスト制御の実装**

#### サイズ・タイムアウト制限
```typescript
// src/middleware/requestControl.ts
import { Request, Response, NextFunction } from 'express';

/**
 * リクエストサイズ制限
 * JSON: 1MB, URL-encoded: 1MB
 */
export const requestSizeLimits = {
    json: { limit: '1mb' },
    urlencoded: {
        limit: '1mb',
        extended: true,
        parameterLimit: 1000 // パラメータ数制限
    }
};

/**
 * リクエストタイムアウト制御
 * 30秒でタイムアウト
 */
export const requestTimeout = (req: Request, res: Response, next: NextFunction) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(408).json({
                success: false,
                message: 'リクエストがタイムアウトしました',
                code: 'REQUEST_TIMEOUT'
            });
        }
    }, 30000); // 30秒

    res.on('finish', () => {
        clearTimeout(timeout);
    });

    next();
};
```

### 🛡️ **解決策4: JWT SECRET強化**

#### セキュア設定生成
```typescript
// src/lib/generateSecrets.ts
import crypto from 'crypto';

/**
 * セキュアなシークレット生成関数
 * 256bit（32バイト）のランダムシークレット
 */
export function generateSecureSecret(): string {
    return crypto.randomBytes(32).toString('base64');
}

/**
 * 環境変数検証と警告
 */
export function validateJWTSecrets() {
    const jwtSecret = process.env.JWT_SECRET;
    const refreshSecret = process.env.JWT_REFRESH_SECRET;

    if (!jwtSecret || jwtSecret.length < 32) {
        console.warn('⚠️  JWT_SECRET が短すぎます（推奨：32文字以上）');
        console.warn('新しいシークレット:', generateSecureSecret());
    }

    if (!refreshSecret || refreshSecret.length < 32) {
        console.warn('⚠️  JWT_REFRESH_SECRET が短すぎます');
        console.warn('新しいリフレッシュシークレット:', generateSecureSecret());
    }
}
```

#### .env.example更新
```bash
# JWT設定（セキュアな長さ）
JWT_SECRET=base64:your-super-secure-32-character-or-longer-secret-key-here
JWT_REFRESH_SECRET=base64:your-super-secure-refresh-secret-key-here

# セキュリティ設定
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX=5
REQUEST_TIMEOUT_MS=30000
```

## P1級対策（重要実装）

### 🔒 **解決策5: ブルートフォース攻撃対策**

#### アカウントロック機能
```typescript
// src/services/bruteForceProtection.ts
interface LoginAttempt {
    email: string;
    attempts: number;
    lastAttempt: Date;
    lockedUntil?: Date;
}

class BruteForceProtection {
    private attempts = new Map<string, LoginAttempt>();
    private readonly MAX_ATTEMPTS = 5;
    private readonly LOCK_TIME = 15 * 60 * 1000; // 15分

    /**
     * ログイン試行の記録
     */
    recordAttempt(email: string, success: boolean): boolean {
        const key = email.toLowerCase();
        const now = new Date();
        const attempt = this.attempts.get(key) || {
            email,
            attempts: 0,
            lastAttempt: now
        };

        // ロック時間チェック
        if (attempt.lockedUntil && now < attempt.lockedUntil) {
            return false; // まだロック中
        }

        if (success) {
            // 成功時はリセット
            this.attempts.delete(key);
            return true;
        }

        // 失敗時はカウントアップ
        attempt.attempts++;
        attempt.lastAttempt = now;

        if (attempt.attempts >= this.MAX_ATTEMPTS) {
            attempt.lockedUntil = new Date(now.getTime() + this.LOCK_TIME);
        }

        this.attempts.set(key, attempt);
        return attempt.attempts < this.MAX_ATTEMPTS;
    }
}
```

### 🔒 **解決策6: エラーメッセージの統一化**

#### セキュアエラーハンドリング
```typescript
// src/utils/secureErrorMessages.ts

/**
 * 認証関連のエラーメッセージを統一
 * 詳細情報を漏洩させない
 */
export const AuthErrorMessages = {
    // ログイン失敗時は常に同じメッセージ
    INVALID_CREDENTIALS: 'メールアドレスまたはパスワードが正しくありません',

    // アカウントロック
    ACCOUNT_LOCKED: 'セキュリティのため、このアカウントは一時的にロックされています',

    // レート制限
    TOO_MANY_ATTEMPTS: 'ログイン試行回数が上限に達しました。しばらく待ってから再試行してください',

    // 一般的なエラー
    AUTHENTICATION_FAILED: '認証に失敗しました',

    // トークン関連
    TOKEN_INVALID: 'セッションが無効です。再度ログインしてください',
    TOKEN_EXPIRED: 'セッションの有効期限が切れています。再度ログインしてください'
};

/**
 * セキュアなエラーレスポンス生成
 */
export function createSecureErrorResponse(
    message: string,
    code?: string,
    httpStatus: number = 401
) {
    return {
        success: false,
        message,
        ...(code && { code }),
        timestamp: new Date().toISOString()
    };
}
```

## P2級対策（セキュリティ向上）

### 📊 **解決策7: セキュリティ監視システム**

#### 構造化ログ実装
```typescript
// src/services/securityLogger.ts
interface SecurityEvent {
    eventType: 'LOGIN_ATTEMPT' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' |
               'RATE_LIMIT_HIT' | 'SUSPICIOUS_ACTIVITY' | 'API_ACCESS';
    userId?: number;
    email?: string;
    ipAddress: string;
    userAgent: string;
    endpoint: string;
    timestamp: Date;
    metadata?: Record<string, any>;
}

class SecurityLogger {
    /**
     * セキュリティイベントのログ記録
     */
    logSecurityEvent(event: SecurityEvent) {
        const logEntry = {
            ...event,
            level: this.getLogLevel(event.eventType),
            sessionId: this.generateSessionId(),
        };

        // ファイルログ + コンソール出力
        console.log('[SECURITY]', JSON.stringify(logEntry, null, 2));

        // 重要なイベントはアラート
        if (this.isHighPriorityEvent(event.eventType)) {
            this.sendAlert(logEntry);
        }
    }

    private getLogLevel(eventType: string): string {
        const highPriority = ['SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_HIT'];
        return highPriority.includes(eventType) ? 'WARN' : 'INFO';
    }
}
```

### 🌐 **解決策8: IP制御システム**

#### IP白名单・黑名单
```typescript
// src/middleware/ipControl.ts
class IPController {
    private blacklist = new Set<string>();
    private whitelist = new Set<string>();

    /**
     * IP アクセス制御ミドルウェア
     */
    createIPFilter() {
        return (req: Request, res: Response, next: NextFunction) => {
            const clientIP = this.getClientIP(req);

            // 黒名单チェック
            if (this.blacklist.has(clientIP)) {
                return res.status(403).json({
                    success: false,
                    message: 'アクセスが拒否されました',
                    code: 'IP_BLOCKED'
                });
            }

            // 管理者エンドポイントは白名单チェック
            if (req.path.includes('/admin') && !this.whitelist.has(clientIP)) {
                return res.status(403).json({
                    success: false,
                    message: '管理者エリアへのアクセスが制限されています'
                });
            }

            next();
        };
    }

    private getClientIP(req: Request): string {
        return (req.headers['x-forwarded-for'] as string)?.split(',')[0] ||
               req.connection.remoteAddress ||
               req.socket.remoteAddress ||
               '未知';
    }
}
```

## 実装順序とマイルストーン

### フェーズ1（P0対策）- 1-2日
1. ✅ 依存関係の追加
2. ✅ レート制限ミドルウェア実装
3. ✅ セキュリティヘッダー設定
4. ✅ リクエスト制御実装
5. ✅ JWT設定強化

### フェーズ2（P1対策）- 2-3日
1. ✅ ブルートフォース対策
2. ✅ エラーメッセージ統一
3. ✅ セキュリティログ基盤

### フェーズ3（P2対策）- 3-4日
1. ✅ IP制御システム
2. ✅ 監視・アラート機能
3. ✅ 設定管理システム
4. ✅ テスト・検証

## 成功指標とテスト計画

### セキュリティテスト項目
1. **レート制限テスト**: 制限値での動作確認
2. **ブルートフォーステスト**: アカウントロック動作
3. **ヘッダーテスト**: セキュリティヘッダー設定確認
4. **負荷テスト**: 大量リクエスト処理能力

### 監視指標
- API レスポンス時間
- エラー率
- セキュリティイベント数
- システムリソース使用率

次のセクションでは、学習価値を最大化するためのWeb セキュリティ基礎知識について解説します。