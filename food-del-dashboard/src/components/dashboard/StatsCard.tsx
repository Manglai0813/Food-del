import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

// 統計カードのプロパティ型定義
interface StatsCardProps {
    title: string;
    value?: number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
    subtitle?: string;
    icon: React.ReactNode;
    formatter?: (value: number) => string;
    compact?: boolean;
    loading?: boolean;
}

// 統計カードコンポーネント
const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    change,
    trend,
    subtitle,
    icon,
    formatter = (v) => v.toLocaleString('ja-JP'),
    compact = false,
    loading = false,
}) => {
    // トレンドに基づいた色を返す
    const getTrendColor = (trend?: string) => {
        switch (trend) {
            case 'up': return 'text-green-600';
            case 'down': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    // トレンドに基づいたアイコンを返す
    const getTrendIcon = (trend?: string) => {
        switch (trend) {
            case 'up': return <TrendingUp className="h-4 w-4" />;
            case 'down': return <TrendingDown className="h-4 w-4" />;
            default: return <Minus className="h-4 w-4" />;
        }
    };

    // ローディング状態を判定
    const isLoading = loading || value === undefined;

    return (
        <Card>
            <CardContent className={compact ? "p-4" : "p-6"}>
                <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                        <p className={`font-medium text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
                            {title}
                        </p>
                        <p className={`font-bold ${compact ? 'text-lg' : 'text-2xl'}`}>
                            {isLoading ? (
                                <span className="animate-pulse bg-muted rounded w-16 h-6 inline-block"></span>
                            ) : (
                                formatter(value!)
                            )}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
                        )}
                    </div>
                    <div className={`bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 ${compact ? 'h-8 w-8' : 'h-12 w-12'
                        }`}>
                        {icon}
                    </div>
                </div>

                {change !== undefined && !isLoading && (
                    <div className={`flex items-center mt-4 text-sm ${getTrendColor(trend)}`}>
                        {getTrendIcon(trend)}
                        <span className="ml-1">
                            {change > 0 ? '+' : ''}{change.toFixed(1)}% 前日比
                        </span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default StatsCard;