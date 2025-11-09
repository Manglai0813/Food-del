import React from 'react';
import { cn } from '@/styles';

interface LoadingProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: 'spinner' | 'dots' | 'pulse' | 'bars';
    color?: 'primary' | 'white' | 'gray';
    overlay?: boolean;
    text?: string;
    className?: string;
}

// 汎用ローディングコンポーネント
export const Loading: React.FC<LoadingProps> = ({
    size = 'md',
    variant = 'spinner',
    color = 'primary',
    overlay = false,
    text,
    className,
}) => {
    // サイズマッピング
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    // カラーマッピング
    const colorClasses = {
        primary: 'text-primary',
        white: 'text-white',
        gray: 'text-muted-foreground',
    };

    // スピナーコンポーネント
    const Spinner = () => (
        <svg
            className={cn(
                'animate-spin',
                sizeClasses[size],
                colorClasses[color],
                className
            )}
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    // ドットローディング
    const Dots = () => (
        <div className={cn('flex space-x-1', className)}>
            {[0, 1, 2].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-full animate-pulse',
                        size === 'sm' && 'w-2 h-2',
                        size === 'md' && 'w-3 h-3',
                        size === 'lg' && 'w-4 h-4',
                        size === 'xl' && 'w-5 h-5',
                        color === 'primary' && 'bg-primary',
                        color === 'white' && 'bg-white',
                        color === 'gray' && 'bg-muted-foreground'
                    )}
                    style={{
                        animationDelay: `${i * 0.15}s`,
                        animationDuration: '1s',
                    }}
                />
            ))}
        </div>
    );

    // パルスローディング
    const Pulse = () => (
        <div
            className={cn(
                'rounded-full animate-pulse',
                sizeClasses[size],
                color === 'primary' && 'bg-tomato',
                color === 'white' && 'bg-white',
                color === 'gray' && 'bg-gray-500',
                className
            )}
        />
    );

    // バーローディング
    const Bars = () => (
        <div className={cn('flex items-end space-x-1', className)}>
            {[0, 1, 2, 3].map((i) => (
                <div
                    key={i}
                    className={cn(
                        'rounded-sm animate-pulse',
                        size === 'sm' && 'w-1 h-4',
                        size === 'md' && 'w-1.5 h-6',
                        size === 'lg' && 'w-2 h-8',
                        size === 'xl' && 'w-3 h-10',
                        color === 'primary' && 'bg-primary',
                        color === 'white' && 'bg-white',
                        color === 'gray' && 'bg-muted-foreground'
                    )}
                    style={{
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '1.2s',
                    }}
                />
            ))}
        </div>
    );

    // バリアント選択
    const renderVariant = () => {
        switch (variant) {
            case 'dots':
                return <Dots />;
            case 'pulse':
                return <Pulse />;
            case 'bars':
                return <Bars />;
            default:
                return <Spinner />;
        }
    };

    // コンテンツ
    const content = (
        <div className="flex flex-col items-center justify-center space-y-2">
            {renderVariant()}
            {text && (
                <p className={cn(
                    'text-sm font-medium',
                    colorClasses[color]
                )}>
                    {text}
                </p>
            )}
        </div>
    );

    // オーバーレイ表示
    if (overlay) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-modal">
                <div className="bg-white rounded-lg p-6 shadow-xl">
                    {content}
                </div>
            </div>
        );
    }

    return content;
};

// ページローディング用の全画面ローディング
export const PageLoading: React.FC<{ text?: string }> = ({ text = "読み込み中..." }) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-muted">
            <Loading size="lg" text={text} />
        </div>
    );
};

// インライン要素用の小さなローディング
export const InlineLoading: React.FC<{ className?: string }> = ({ className }) => {
    return <Loading size="sm" variant="spinner" className={className} />;
};