/**
 * Dashboard設定ファイル
 * 自動更新間隔とキャッシュ戦略の設定
 */

// 自動更新間隔設定 (ミリ秒)
export const DASHBOARD_REFRESH_INTERVALS = {
        overview: 5 * 60 * 1000,    // 5分 - 概要統計
        sales: 10 * 60 * 1000,      // 10分 - 売上統計
        products: 15 * 60 * 1000,   // 15分 - 商品統計
        orders: 5 * 60 * 1000,      // 5分 - 注文統計（リアルタイム重要）
} as const;

// Stale Time設定 (ミリ秒)
export const DASHBOARD_STALE_TIMES = {
        overview: 5 * 60 * 1000,    // 5分
        sales: 10 * 60 * 1000,      // 10分
        products: 15 * 60 * 1000,   // 15分
        orders: 3 * 60 * 1000,      // 3分
} as const;

// Garbage Collection Time設定 (ミリ秒)
export const DASHBOARD_GC_TIMES = {
        overview: 10 * 60 * 1000,   // 10分
        sales: 20 * 60 * 1000,      // 20分
        products: 30 * 60 * 1000,   // 30分
        orders: 10 * 60 * 1000,     // 10分
} as const;

// 自動更新設定
export const AUTO_REFRESH_CONFIG = {
        enabled: true,
        onVisibilityChange: true,
        onWindowFocus: true,
        backgroundRefresh: true,
} as const;

// パフォーマンス設定
export const PERFORMANCE_CONFIG = {
        maxRetries: 3,
        retryDelay: 1000,
        timeout: 10000,
        batchSize: 3,
} as const;

// チャート設定
export const CHART_CONFIG = {
        colors: {
                primary: 'hsl(var(--primary))',
                secondary: 'hsl(var(--chart-2))',
                success: 'hsl(var(--chart-3))',
                warning: 'hsl(var(--chart-4))',
                danger: 'hsl(var(--chart-5))',
        },
        animations: {
                enabled: true,
                duration: 300,
        },
        responsive: {
                breakpoints: {
                        mobile: 640,
                        tablet: 768,
                        desktop: 1024,
                },
        },
} as const;