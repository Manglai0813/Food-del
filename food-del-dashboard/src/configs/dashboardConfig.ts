// 自動更新間隔設定 (ミリ秒)
export const DASHBOARD_REFRESH_INTERVALS = {
    overview: 5 * 60 * 1000,
    sales: 10 * 60 * 1000,
    products: 15 * 60 * 1000,
    orders: 5 * 60 * 1000,
} as const;

// Stale Time設定 (ミリ秒)
export const DASHBOARD_STALE_TIMES = {
    overview: 5 * 60 * 1000,
    sales: 10 * 60 * 1000,
    products: 15 * 60 * 1000,
    orders: 3 * 60 * 1000,
} as const;

// Garbage Collection Time設定 (ミリ秒)
export const DASHBOARD_GC_TIMES = {
    overview: 10 * 60 * 1000,
    sales: 20 * 60 * 1000,
    products: 30 * 60 * 1000,
    orders: 10 * 60 * 1000,
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