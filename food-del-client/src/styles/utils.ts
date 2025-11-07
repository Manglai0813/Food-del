/**
 * スタイルユーティリティ関数
 * Tailwind CSS + CSS Modules混合システム用
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Tailwindクラスとカスタムクラスをマージするユーティリティ
 * @param inputs - クラス名の配列
 * @returns マージされたクラス名
 */
export function cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs));
}

/**
 * レスポンシブブレークポイントのヘルパー
 */
export const breakpoints = {
        mobile: '(max-width: 750px)',
        tablet: '(max-width: 900px)',
        desktop: '(max-width: 1050px)',
} as const;

/**
 * メディアクエリ判定フック用ヘルパー
 */
export const mediaQueries = {
        isMobile: `(max-width: 750px)`,
        isTablet: `(max-width: 900px)`,
        isDesktop: `(max-width: 1050px)`,
        isLarge: `(min-width: 1051px)`,
} as const;

/**
 * アニメーション遅延計算
 * @param index - 要素のインデックス
 * @param baseDelay - ベース遅延時間（ms）
 * @returns CSS animation-delay値
 */
export function calculateAnimationDelay(index: number, baseDelay: number = 100): string {
        return `${index * baseDelay}ms`;
}

/**
 * 条件付きクラス適用ヘルパー
 */
export const conditionalClasses = {
        /**
         * アクティブ状態のクラス
         */
        active: (isActive: boolean, activeClass: string, inactiveClass?: string) =>
                isActive ? activeClass : inactiveClass || '',

        /**
         * ローディング状態のクラス
         */
        loading: (isLoading: boolean, loadingClass: string = 'opacity-50 pointer-events-none') =>
                isLoading ? loadingClass : '',

        /**
         * エラー状態のクラス
         */
        error: (hasError: boolean, errorClass: string = 'border-red-500 text-red-500') =>
                hasError ? errorClass : '',
};

/**
 * グリッドレスポンシブクラス生成
 * @param columns - デスクトップ列数
 * @param tabletColumns - タブレット列数（オプション）
 * @param mobileColumns - モバイル列数（オプション）
 */
export function gridResponsive(
        columns: number,
        tabletColumns?: number,
        mobileColumns: number = 1
): string {
        const desktop = `grid-cols-${columns}`;
        const tablet = tabletColumns ? `tablet:grid-cols-${tabletColumns}` : '';
        const mobile = `mobile:grid-cols-${mobileColumns}`;

        return cn(desktop, tablet, mobile);
}

/**
 * Flexボックスレスポンシブクラス生成
 */
export const flexResponsive = {
        /**
         * デスクトップは横並び、モバイルは縦並び
         */
        rowToCol: 'flex flex-row mobile:flex-col',

        /**
         * デスクトップは縦並び、モバイルは横並び
         */
        colToRow: 'flex flex-col mobile:flex-row',

        /**
         * 中央揃え（すべてのブレークポイント）
         */
        center: 'flex items-center justify-center',

        /**
         * スペース分散
         */
        spaceBetween: 'flex items-center justify-between',
};

/**
 * パディング・マージンのレスポンシブヘルパー
 */
export const spacing = {
        /**
         * レスポンシブパディング
         */
        padding: {
                section: 'py-16 mobile:py-8',
                container: 'px-vw-6 mobile:px-4',
                card: 'p-6 mobile:p-4',
        },

        /**
         * レスポンシブマージン
         */
        margin: {
                section: 'my-16 mobile:my-8',
                element: 'my-4 mobile:my-2',
        },
};

/**
 * テキストサイズのレスポンシブヘルパー
 */
export const textResponsive = {
        heading: {
                h1: 'text-4xl mobile:text-2xl font-bold',
                h2: 'text-3xl mobile:text-xl font-semibold',
                h3: 'text-2xl mobile:text-lg font-medium',
                h4: 'text-xl mobile:text-base font-medium',
        },
        body: {
                large: 'text-lg mobile:text-base',
                normal: 'text-base mobile:text-sm',
                small: 'text-sm mobile:text-xs',
        },
};

/**
 * ボタンバリアント
 */
export const buttonVariants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        outline: 'btn-outline',
        ghost: 'btn-base text-gray-600 hover:bg-gray-100',
        link: 'btn-base text-tomato hover:text-red-600 hover:underline p-0',
};

/**
 * カードバリアント
 */
export const cardVariants = {
        default: 'card-base p-6',
        compact: 'card-base p-4',
        elevated: 'card-base p-6 shadow-lg hover:shadow-xl',
        bordered: 'border border-border-light rounded-lg p-6 hover:border-tomato transition-colors',
};

/**
 * CSS変数の動的設定ヘルパー
 */
export function setCSSVariable(name: string, value: string, element: Element = document.documentElement) {
        element.setAttribute('style', `${element.getAttribute('style') || ''} --${name}: ${value};`);
}

/**
 * CSS変数の取得ヘルパー
 */
export function getCSSVariable(name: string, element: Element = document.documentElement): string {
        return getComputedStyle(element).getPropertyValue(`--${name}`).trim();
}