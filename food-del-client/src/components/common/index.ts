/**
 * UIコンポーネントエクスポート
 * 基础UIコンポーネントライブラリ
 */

// トースト
export { ToastContainer } from './Toast';

// ローディング
export {
        Loading,
        PageLoading,
        InlineLoading,
} from './Loading';

// 分頁器
export { Pagination } from './Pagination';

// 型定義エクスポート
export type { LoadingProps } from './Loading';

// タイプスクリプトの型宣言
declare module './Loading' {
        export interface LoadingProps {
                size?: 'sm' | 'md' | 'lg' | 'xl';
                variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
                color?: 'primary' | 'white' | 'gray';
                overlay?: boolean;
                text?: string;
                className?: string;
        }
};