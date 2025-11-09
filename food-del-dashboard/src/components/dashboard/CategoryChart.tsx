import React, { type ReactNode } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// コンポーネントのプロパティ型定義
interface CategoryChartProps {
    data?: Array<{
        categoryId: number;
        categoryName: string;
        productCount: number;
        revenue: number;
        percentage: number;
    }>;
    height?: number;
    isLoading?: boolean;
}

// チャートの色設定
const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
];

// カテゴリ別売上チャートコンポーネント
const CategoryChart: React.FC<CategoryChartProps> = ({ data, height = 300 }) => {
    // データが空の場合はローディング表示
    if (!data || data.length === 0) {
        return (
            <div className={`flex items-center justify-center`} style={{ height }}>
                <div className="text-center">
                    <div className="animate-pulse bg-muted rounded-full w-24 h-24 mx-auto mb-4"></div>
                    <div className="animate-pulse bg-muted rounded w-32 h-4 mx-auto mb-2"></div>
                    <div className="animate-pulse bg-muted rounded w-24 h-3 mx-auto"></div>
                </div>
            </div>
        );
    }

    // 通貨形式でフォーマット
    const formatCurrency = (value: number) => {
        return `¥${value.toLocaleString('ja-JP')}`;
    };

    // カスタムラベルをレンダリング
    const renderCustomizedLabel = (props: {
        cx?: number;
        cy?: number;
        midAngle?: number;
        innerRadius?: number;
        outerRadius?: number;
        percent?: number;
    }) => {
        const { cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 } = props;
        if (percent < 0.05) return null;

        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight="bold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // カスタム凡例をレンダリング
    const renderLegend = (props: { payload?: Array<{ color?: string; value?: string }> }): ReactNode => {
        const { payload = [] } = props;
        return (
            <ul className="flex flex-wrap justify-center gap-4 mt-4">
                {payload.map((entry, index: number) => (
                    <li key={`item-${index}`} className="flex items-center gap-2 text-sm">
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color || '#8884d8' }}
                        />
                        <span className="text-muted-foreground">{entry.value || ''}</span>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="40%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="revenue"
                >
                    {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value: number) => [
                        formatCurrency(value),
                        '売上'
                    ]}
                    labelFormatter={(label: string) => `${label}`}
                    contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    content={({ active, payload }) => {
                        if (active && payload && payload.length > 0) {
                            const data = payload[0].payload;
                            return (
                                <div className="bg-background border border-border rounded-md shadow-lg p-3">
                                    <p className="font-medium text-foreground mb-2">{data.categoryName}</p>
                                    <div className="space-y-1 text-sm">
                                        <p className="text-muted-foreground">売上: <span className="text-foreground font-medium">{formatCurrency(data.revenue)}</span></p>
                                        <p className="text-muted-foreground">商品数: <span className="text-foreground font-medium">{data.productCount}品目</span></p>
                                        <p className="text-muted-foreground">構成比: <span className="text-foreground font-medium">{data.percentage}%</span></p>
                                    </div>
                                </div>
                            );
                        }
                        return null;
                    }}
                />
                <Legend content={renderLegend as any} />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default CategoryChart;