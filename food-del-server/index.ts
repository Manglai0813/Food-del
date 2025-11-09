import 'dotenv/config';
import { env } from './src/lib/env';
import express from 'express';
import type { Express, Request, Response } from 'express';
import cors from 'cors';
import foodRouter from './src/routes/foodRouter';
import userRouter from './src/routes/userRouter';
import cartRouter from './src/routes/cartRouter';
import categoryRouter from './src/routes/categoryRouter';
import orderRouter from './src/routes/orderRouter';
import { errorHandler } from './src/middleware/errorHandler';
import { fileAccessMiddleware } from './src/middleware/fileAccess';
import {
    securityHeaders,
    customSecurityHeaders,
    securityAuditHeaders,
    enhancedCorsHeaders
} from './src/middleware/securityHeaders';
import { generalRateLimit } from './src/middleware/rateLimiting';
import {
    requestTimeout,
    requestMonitoring,
    requestSizeLimits,
    requestControlErrorHandler
}
    from './src/middleware/requestControl';

// アプリケーション設定
const app: Express = express();

// セキュリティミドルウェアの適用

// 1. セキュリティヘッダー設定
app.use(securityHeaders);
app.use(customSecurityHeaders);
app.use(securityAuditHeaders);

// 2. CORS設定の強化
app.use(enhancedCorsHeaders);

// 開発環境では複数のOriginを許可
const corsOrigins = env.NODE_ENV === 'development'
    ? ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001']
    : env.CORS_ALLOWED_ORIGINS;

// CORSミドルウェアの適用
app.use(cors({
    origin: corsOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: env.CORS_ALLOW_CREDENTIALS,
    maxAge: 86400
}));

// 3. リクエスト監視とタイムアウト制御
app.use(requestMonitoring);
app.use(requestTimeout(30000)); // 30秒タイムアウト

// 4. 一般的なレート制限、すべてのAPIに適用）
app.use('/api/', generalRateLimit);

// 5. JSON/URL-encodedパーサー、サイズ制限付き
app.use(express.json(requestSizeLimits.json));
app.use(express.urlencoded(requestSizeLimits.urlencoded));
app.use(express.raw(requestSizeLimits.raw));
app.use(express.text(requestSizeLimits.text));

// 6. ファイルアクセスミドルウェア
app.use('/files', fileAccessMiddleware);

// APIエンドポイント
app.use('/api/foods', foodRouter);
app.use('/api/users', userRouter);
app.use('/api/carts', cartRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/orders', orderRouter);

// テストルーター
app.get('/', (_req: Request, res: Response) => {
    res.json({ message: 'Welcome to Food Delivery API' });
});

// エラーハンドリングミドルウェア
app.use(requestControlErrorHandler);
app.use(errorHandler);

// サーバー起動
const PORT: number = env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;