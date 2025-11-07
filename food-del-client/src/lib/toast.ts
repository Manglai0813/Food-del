/**
 * Toastユーティリティ
 * react-hot-toastのカスタマイズ設定
 */

import toast from 'react-hot-toast';

// 成功メッセージ
export const showSuccess = (message: string) => {
        toast.success(message, {
                duration: 3000,
                position: 'top-center',
                style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                },
        });
};

// エラーメッセージ
export const showError = (message: string) => {
        toast.error(message, {
                duration: 4000,
                position: 'top-center',
                style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--destructive))',
                },
        });
};

// 情報メッセージ
export const showInfo = (message: string) => {
        toast(message, {
                duration: 3000,
                position: 'top-center',
                icon: 'ℹ️',
                style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                },
        });
};

// ローディング中のトースト
export const showLoading = (message: string) => {
        return toast.loading(message, {
                position: 'top-center',
                style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                },
        });
};

// プロミスベースのトースト
export const showPromise = <T,>(
        promise: Promise<T>,
        {
                loading,
                success,
                error,
        }: {
                loading: string;
                success: string;
                error: string;
        }
) => {
        return toast.promise(
                promise,
                {
                        loading,
                        success,
                        error,
                },
                {
                        position: 'top-center',
                        style: {
                                background: 'hsl(var(--background))',
                                color: 'hsl(var(--foreground))',
                                border: '1px solid hsl(var(--border))',
                        },
                }
        );
};
