/**
 * スタイルシステムエクスポート
 * Tailwind CSS + CSS Modules混合システム
 */

// ユーティリティ関数
export {
        cn,
        breakpoints,
        mediaQueries,
        calculateAnimationDelay,
        conditionalClasses,
        gridResponsive,
        flexResponsive,
        spacing,
        textResponsive,
        buttonVariants,
        cardVariants,
        setCSSVariable,
        getCSSVariable,
} from './utils';

// CSS Modulesの型定義ヘルパー
export type CSSModuleClasses = { readonly [key: string]: string };

// 共通スタイル定数
export const commonClasses = {
        // レイアウト
        container: 'container-custom',
        section: 'py-16 mobile:py-8',

        // ボタン
        button: {
                primary: 'btn-primary',
                secondary: 'btn-secondary',
                outline: 'btn-outline',
        },

        // カード
        card: {
                default: 'card-base',
                elevated: 'card-base shadow-lg hover:shadow-xl',
        },

        // 入力フィールド
        input: 'input-base',

        // アニメーション
        fadeIn: 'fade-in',

        // ユーティリティ
        center: 'flex-center',
        spaceBetween: 'flex items-center justify-between',
} as const;

// テーマカラー（CSS変数として使用）
export const themeColors = {
        primary: 'rgb(255, 99, 71)', // tomato
        primaryLight: '#fff4f2',
        primaryDark: '#49557e',
        textPrimary: '#262626',
        textSecondary: '#747474',
        border: '#e4e4e4',
} as const;