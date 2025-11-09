import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// コンポーネントのプロパティ型定義
interface SalesChartProps {
    data?: Array<{
        date: string;
        revenue: number;
        orders: number;
    }>;
    height?: number;
    showBoth?: boolean;
    isLoading?: boolean;
}

// 売上トレンドチャートコンポーネント
const SalesChart: React.FC<SalesChartProps> = ({ data, height = 300, showBoth = false }) => {
    // データが空の場合はローディング表示
    if (!data || data.length === 0) {
        return (
            <div className={`flex items-center justify-center`} style={{ height }}>
                <div className="text-center">
                    <div className="animate-pulse bg-muted rounded-lg w-32 h-4 mx-auto mb-2"></div>
                    <div className="animate-pulse bg-muted rounded w-24 h-3 mx-auto"></div>
                </div>
            </div>
        );
    }

    // 日付を月日形式でフォーマット
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
        });
    };

    // 通貨形式でフォーマット
    const formatCurrency = (value: number) => {
        return `¥${value.toLocaleString('ja-JP')}`;
    };

    // ツールチップ用の日付フォーマット
    const formatTooltipDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    tickFormatter={(value) => `¥${(value / 1000).toFixed(0)}K`}
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                {showBoth && (
                    <YAxis
                        yAxisId="right"
                        orientation="right"
                        tickFormatter={(value) => `${value}件`}
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                    />
                )}
                <Tooltip
                    formatter={(value: number, name: string) => {
                        if (name === 'revenue') {
                            return [formatCurrency(value), '売上'];
                        }
                        return [`${value}件`, '注文数'];
                    }}
                    labelFormatter={(label) => formatTooltipDate(label)}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                />
                {showBoth && (
                    <Legend
                        wrapperStyle={{
                            paddingTop: '20px',
                        }}
                    />
                )}
                <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="売上"
                    dot={{
                        fill: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        r: 4,
                    }}
                    activeDot={{
                        r: 6,
                        stroke: 'hsl(var(--primary))',
                        strokeWidth: 2,
                        fill: 'hsl(var(--background))',
                    }}
                />
                {showBoth && (
                    <Line
                        type="monotone"
                        dataKey="orders"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        name="注文数"
                        yAxisId="right"
                        dot={{
                            fill: 'hsl(var(--chart-2))',
                            strokeWidth: 2,
                            r: 4,
                        }}
                        activeDot={{
                            r: 6,
                            stroke: 'hsl(var(--chart-2))',
                            strokeWidth: 2,
                            fill: 'hsl(var(--background))',
                        }}
                    />
                )}
            </LineChart>
        </ResponsiveContainer>
    );
};

export default SalesChart;