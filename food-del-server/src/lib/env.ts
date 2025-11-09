// 環境変数設定型定義
interface EnvConfig {
    JWT_SECRET: string;
    JWT_REFRESH_SECRET: string;
    DATABASE_URL: string;
    PORT: number;
    NODE_ENV: string;
    CORS_ALLOWED_ORIGINS: string[];
    CORS_ALLOW_CREDENTIALS: boolean;
    RATE_LIMIT_ENABLED: boolean;
    RATE_LIMIT_MAX: number;
    RATE_LIMIT_WINDOW_MS: number;
}

// 環境変数の検証とデフォルト値設定
function validateEnv(): EnvConfig {
    // 環境変数を取得
    const origins = process.env.CORS_ALLOWED_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:3000'];
    const allowCredentials = process.env.CORS_ALLOW_CREDENTIALS === 'true';

    // 環境変数オブジェクトを作成
    const config = {
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
        DATABASE_URL: process.env.DATABASE_URL,
        PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 5000,
        NODE_ENV: process.env.NODE_ENV || 'development',
        CORS_ALLOWED_ORIGINS: origins,
        CORS_ALLOW_CREDENTIALS: allowCredentials,
        RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED === 'true',
        RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX, 10) : 100,
        RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : 15 * 60 * 1000
    };

    // 必須環境変数のチェック
    const requiredVars: (keyof Omit<EnvConfig, 'PORT' | 'NODE_ENV' | 'CORS_ALLOWED_ORIGINS' | 'CORS_ALLOW_CREDENTIALS'>)[] = [
        'JWT_SECRET',
        'JWT_REFRESH_SECRET',
        'DATABASE_URL'
    ];

    // 足りない環境変数を収集
    const missing = requiredVars.filter(key => !config[key]);

    // 足りない環境変数があればエラーメッセージを表示して終了
    if (missing.length > 0) {
        console.error('Missing required environment variables:');
        missing.forEach(varName => {
            console.error(`   - ${varName}`);
        });
        console.error('\nPlease set these environment variables in your .env file or system environment');
        console.error('Example .env file:');
        console.error('JWT_SECRET=your-super-secret-key-here');
        console.error('JWT_REFRESH_SECRET=your-refresh-secret-key-here');
        console.error('DATABASE_URL=postgresql://username:password@localhost:5432/database');
        process.exit(1);
    }

    // JWT_SECRET強度チェック
    if (config.JWT_SECRET && config.JWT_SECRET.length < 32) {
        console.warn('Warning: JWT_SECRET should be at least 32 characters for security');
    }

    // PORTの有効性チェック
    if (isNaN(config.PORT) || config.PORT <= 0 || config.PORT > 65535) {
        console.error('Invalid PORT value. Using default: 5000');
        config.PORT = 5000;
    }

    // 型アサーションでEnvConfig型として返す
    return config as EnvConfig;
}

// 検証済み環境変数をエクスポート
export const env = validateEnv();

// 開発時の利便性のための型エクスポート
export type { EnvConfig };