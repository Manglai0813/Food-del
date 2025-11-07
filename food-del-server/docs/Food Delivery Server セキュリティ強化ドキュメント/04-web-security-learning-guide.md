# Webセキュリティ学習ガイド

## 学習目標と前提知識

本ガイドは、Food Delivery Serverプロジェクトを通じてWebセキュリティの実践的な知識を習得することを目的としています。理論と実装を組み合わせた段階的な学習アプローチを採用します。

## 第1章: セキュリティ基礎概念

### 1.1 CIA Triad（情報セキュリティの3要素）

#### **機密性（Confidentiality）**
```typescript
// 例: JWTトークンによる認証情報の保護
const token = jwt.sign({
    id: user.id,
    email: user.email,  // 公開しても良い情報
    role: user.role
    // password は含めない！（機密性）
}, JWT_SECRET);
```

**学習ポイント**:
- 機密情報（パスワード、個人情報）の適切な取り扱い
- アクセス制御による情報保護
- 暗号化技術の活用

#### **完全性（Integrity）**
```typescript
// 例: bcryptハッシュによるパスワード完全性保護
const hashedPassword = await bcrypt.hash(password, 10);

// 検証時
const isValid = await bcrypt.compare(inputPassword, hashedPassword);
// ハッシュ値の改ざんを検出可能
```

**学習ポイント**:
- データの改ざん検出
- ハッシュ関数の使用
- デジタル署名の概念

#### **可用性（Availability）**
```typescript
// 例: レート制限による可用性保護
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 100, // 最大100リクエスト
    message: 'サービス保護のため、リクエストを制限しています'
});
```

**学習ポイント**:
- DoS/DDoS攻撃対策
- システムリソース管理
- 負荷分散とフォルトトレラント設計

### 1.2 攻撃手法と対策パターン

#### **OWASP Top 10（2021）**

##### 1. Broken Access Control（アクセス制御の不備）
```typescript
// ❌ 脆弱な実装
app.get('/admin/users', (req, res) => {
    // 認証チェックなし
    const users = await User.findAll();
    res.json(users);
});

// ✅ セキュアな実装
app.get('/admin/users', isAuthenticated, isAdmin, async (req, res) => {
    // 多層防御: 認証 + 認可
    const users = await User.findAll({
        select: { password: false } // パスワード除外
    });
    res.json(users);
});
```

##### 2. Cryptographic Failures（暗号化の不備）
```typescript
// ❌ 脆弱な実装
const token = jwt.sign(payload, 'secret123'); // 弱いシークレット

// ✅ セキュアな実装
const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
    issuer: 'food-delivery-app',
    audience: 'food-delivery-users'
});
```

##### 3. Injection（インジェクション攻撃）
```typescript
// ❌ SQLインジェクション脆弱
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Prisma ORMで保護
const user = await prisma.user.findUnique({
    where: { email } // 自動的にエスケープ処理
});
```

## 第2章: 認証とセッション管理

### 2.1 JWTトークンのセキュリティ

#### **JWTの構造理解**
```
Header.Payload.Signature
```

```typescript
// JWT構造の詳細
interface JWTHeader {
    alg: 'HS256';  // 署名アルゴリズム
    typ: 'JWT';    // トークンタイプ
}

interface JWTPayload {
    iss: string;   // 発行者
    sub: string;   // 主体（ユーザーID）
    aud: string;   // 対象者
    exp: number;   // 有効期限
    iat: number;   // 発行時刻
    nbf?: number;  // 有効開始時刻
}
```

#### **JWTセキュリティベストプラクティス**

1. **適切なシークレット管理**
```typescript
// ❌ 危険な例
const JWT_SECRET = 'mysecret';

// ✅ セキュアな例
const JWT_SECRET = process.env.JWT_SECRET; // 32文字以上のランダム文字列
if (!JWT_SECRET || JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters');
}
```

2. **有効期限の設定**
```typescript
// 短期間のアクセストークン
const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });

// 長期間のリフレッシュトークン
const refreshToken = jwt.sign({ userId }, REFRESH_SECRET, { expiresIn: '7d' });
```

3. **トークン無効化戦略**
```typescript
// ブラックリスト方式
class TokenBlacklist {
    private blacklist = new Set<string>();

    addToBlacklist(tokenId: string) {
        this.blacklist.add(tokenId);
    }

    isBlacklisted(tokenId: string): boolean {
        return this.blacklist.has(tokenId);
    }
}
```

### 2.2 セッション管理のセキュリティ

#### **セッション固定攻撃対策**
```typescript
// ログイン成功時にセッションIDを再生成
app.post('/login', async (req, res) => {
    const user = await authenticateUser(req.body);
    if (user) {
        req.session.regenerate((err) => {
            req.session.userId = user.id;
            res.json({ success: true });
        });
    }
});
```

## 第3章: 入力検証とデータサニタイゼーション

### 3.1 入力検証の多層防御

#### **フロントエンド検証**
```typescript
// クライアントサイド基本検証（バイパス可能）
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
    showError('有効なメールアドレスを入力してください');
}
```

#### **バックエンド検証（必須）**
```typescript
// Zodスキーマによる堅牢な検証
const UserRegistrationSchema = z.object({
    name: z.string()
        .min(1, '名前は必須です')
        .max(100, '名前は100文字以内にしてください')
        .regex(/^[^\x00-\x1f\x7f-\x9f]*$/, '制御文字は使用できません'),

    email: z.string()
        .email('有効なメールアドレスを入力してください')
        .toLowerCase()
        .transform(val => val.trim()),

    password: z.string()
        .min(8, 'パスワードは8文字以上にしてください')
        .regex(/^(?=.*[a-zA-Z])(?=.*\d)/, '英字と数字を含めてください')
});
```

### 3.2 XSS（クロスサイトスクリプティング）対策

#### **出力エスケープ**
```typescript
// HTMLエスケープ関数
function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// JSONレスポンスでも注意
app.get('/api/user/profile', (req, res) => {
    const user = await getUserProfile(req.user.id);
    res.json({
        name: escapeHtml(user.name), // XSS対策
        email: user.email
    });
});
```

#### **Content Security Policy（CSP）**
```typescript
// CSPヘッダー設定
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"], // 必要最小限
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
    },
}));
```

## 第4章: API セキュリティ

### 4.1 レート制限の設計思想

#### **段階的制限アプローチ**
```typescript
// レベル1: 一般制限（緩やか）
const generalLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分
    max: 1000, // 一般ユーザー
    skip: (req) => req.user?.role === 'premium' // プレミアムユーザー除外
});

// レベル2: 認証系制限（厳格）
const authLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // ログイン試行
    skipSuccessfulRequests: true
});

// レベル3: 管理系制限（最厳格）
const adminLimit = rateLimit({
    windowMs: 60 * 1000, // 1分
    max: 10 // 管理操作
});
```

#### **適応的制限**
```typescript
// ユーザーの行動に基づく動的制限
class AdaptiveRateLimit {
    calculateLimit(user: User, endpoint: string): number {
        let baseLimit = 100;

        // ユーザーの信頼度スコア
        const trustScore = this.calculateTrustScore(user);

        // エンドポイントのリスクレベル
        const riskLevel = this.getEndpointRisk(endpoint);

        return Math.floor(baseLimit * trustScore / riskLevel);
    }

    private calculateTrustScore(user: User): number {
        // アカウント年数、過去の違反履歴等から算出
        return user.accountAge * 0.1 + (1 - user.violationCount * 0.1);
    }
}
```

### 4.2 API バージョニングとセキュリティ

#### **セキュアなバージョニング**
```typescript
// APIバージョン管理
app.use('/api/v1', v1Router);
app.use('/api/v2', v2Router);

// 古いバージョンの段階的廃止
app.use('/api/v1', (req, res, next) => {
    res.setHeader('X-API-Deprecation-Warning',
        'API v1 is deprecated. Please migrate to v2');
    next();
});
```

## 第5章: インフラストラクチャセキュリティ

### 5.1 HTTPSとTLS設定

#### **本番環境のTLS設定**
```typescript
// Express HTTPS設定
import https from 'https';
import fs from 'fs';

const options = {
    key: fs.readFileSync('path/to/private-key.pem'),
    cert: fs.readFileSync('path/to/certificate.pem'),
    // セキュリティ強化
    ciphers: 'ECDHE-RSA-AES128-GCM-SHA256:!RC4:!MD5:!aNULL:!eNULL:!NULL:!DH:!EDH',
    honorCipherOrder: true,
    secureProtocol: 'TLSv1_2_method'
};

https.createServer(options, app).listen(443);
```

### 5.2 環境変数とシークレット管理

#### **階層化された設定管理**
```typescript
// config/security.ts
interface SecurityConfig {
    jwt: {
        accessTokenSecret: string;
        refreshTokenSecret: string;
        accessTokenExpiry: string;
        refreshTokenExpiry: string;
    };
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
    encryption: {
        algorithm: string;
        keyLength: number;
    };
}

// 環境別設定
export const securityConfig: SecurityConfig = {
    jwt: {
        accessTokenSecret: requireEnv('JWT_ACCESS_SECRET'),
        refreshTokenSecret: requireEnv('JWT_REFRESH_SECRET'),
        accessTokenExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
        refreshTokenExpiry: process.env.JWT_REFRESH_EXPIRY || '7d'
    },
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX || '100')
    }
};

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Required environment variable ${key} is not set`);
    }
    return value;
}
```

## 第6章: セキュリティテストと監査

### 6.1 自動化セキュリティテスト

#### **セキュリティテストスイート**
```typescript
// tests/security/rate-limit.test.ts
describe('Rate Limiting Security', () => {
    test('should block excessive login attempts', async () => {
        const loginData = { email: 'test@example.com', password: 'wrong' };

        // 6回連続でログイン失敗
        for (let i = 0; i < 6; i++) {
            await request(app)
                .post('/api/user/auth/login')
                .send(loginData);
        }

        // 7回目はレート制限でブロック
        const response = await request(app)
            .post('/api/user/auth/login')
            .send(loginData);

        expect(response.status).toBe(429);
        expect(response.body.message).toContain('リクエストが多すぎます');
    });

    test('should include security headers', async () => {
        const response = await request(app).get('/api/food');

        expect(response.headers['x-content-type-options']).toBe('nosniff');
        expect(response.headers['x-frame-options']).toBe('DENY');
        expect(response.headers['x-xss-protection']).toBe('1; mode=block');
    });
});
```

### 6.2 セキュリティ監査ログ

#### **構造化セキュリティログ**
```typescript
// services/securityAudit.ts
interface SecurityAuditLog {
    timestamp: Date;
    eventType: 'AUTH' | 'ACCESS' | 'DATA' | 'SYSTEM';
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    userId?: number;
    ipAddress: string;
    userAgent: string;
    action: string;
    resource: string;
    outcome: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
    metadata?: Record<string, any>;
}

class SecurityAuditor {
    async logSecurityEvent(event: SecurityAuditLog) {
        // データベースに記録
        await prisma.securityLog.create({ data: event });

        // 重要度に応じてアラート
        if (event.severity === 'CRITICAL') {
            await this.sendImmediateAlert(event);
        }

        // リアルタイム監視ダッシュボードに送信
        this.publishToMonitoring(event);
    }

    private async sendImmediateAlert(event: SecurityAuditLog) {
        // Slack、メール等での緊急通知
        console.error('[SECURITY ALERT]', event);
    }
}
```

## 学習の進め方と実践課題

### 段階的学習プロセス

1. **理論学習**（1-2日）
   - セキュリティ基礎概念の理解
   - 攻撃手法とその対策の学習

2. **基本実装**（2-3日）
   - レート制限の実装
   - セキュリティヘッダーの設定

3. **応用実装**（3-4日）
   - ブルートフォース対策
   - セキュリティ監視機能

4. **テストと検証**（1-2日）
   - セキュリティテストの作成
   - 脆弱性スキャンの実施

### 実践課題

1. **基礎課題**: レート制限ミドルウェアの自作
2. **応用課題**: カスタムセキュリティログシステムの構築
3. **発展課題**: セキュリティダッシュボードの作成

次のセクションでは、実際の実装手順とテスト方法について詳述します。