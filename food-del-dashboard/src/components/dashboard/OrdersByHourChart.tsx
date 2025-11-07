import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// コンポーネントのプロパティ型定義
interface OrdersByHourChartProps {
        data?: Array<{
                hour: number;
                count: number;
        }>;
}

/**
 * 時間別注文数チャートコンポーネント
 * バーチャートで時間帯別の注文パターンを表示
 */
const OrdersByHourChart: React.FC<OrdersByHourChartProps> = ({ data }) => {
        // データが空の場合はローディング表示
        if (!data || data.length === 0) {
                return (
                        <Card>
                                <CardHeader>
                                        <CardTitle>時間別注文数</CardTitle>
                                </CardHeader>
                                <CardContent>
                                        <div className="flex items-center justify-center h-64">
                                                <div className="text-center">
                                                        <div className="animate-pulse bg-muted rounded-lg w-full h-32 mb-4"></div>
                                                        <div className="animate-pulse bg-muted rounded w-32 h-4 mx-auto"></div>
                                                </div>
                                        </div>
                                </CardContent>
                        </Card>
                );
        }

        // 時間を時分形式でフォーマット
        const formatHour = (hour: number) => {
                return `${hour}:00`;
        };

        // ツールチップ用の時間フォーマット
        const formatTooltipHour = (hour: number) => {
                return `${hour}:00 - ${hour + 1}:00`;
        };

        // ピーク時間を判定
        const maxCount = Math.max(...data.map(d => d.count));
        const peakThreshold = maxCount * 0.7;

        return (
                <Card>
                        <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                        時間別注文数
                                        <span className="text-sm font-normal text-muted-foreground">
                                                今日の注文パターン
                                        </span>
                                </CardTitle>
                        </CardHeader>
                        <CardContent>
                                <ResponsiveContainer width="100%" height={250}>
                                        <BarChart
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
                                                        dataKey="hour"
                                                        tickFormatter={formatHour}
                                                        stroke="hsl(var(--muted-foreground))"
                                                        fontSize={12}
                                                        tickLine={false}
                                                        axisLine={false}
                                                        interval={1}
                                                />
                                                <YAxis
                                                        stroke="hsl(var(--muted-foreground))"
                                                        fontSize={12}
                                                        tickLine={false}
                                                        axisLine={false}
                                                />
                                                <Tooltip
                                                        formatter={(value: number) => [value, '注文数']}
                                                        labelFormatter={(label) => `時間: ${formatTooltipHour(label)}`}
                                                        contentStyle={{
                                                                backgroundColor: 'hsl(var(--background))',
                                                                border: '1px solid hsl(var(--border))',
                                                                borderRadius: '6px',
                                                                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                                        }}
                                                />
                                                <Bar
                                                        dataKey="count"
                                                        radius={[2, 2, 0, 0]}
                                                        fill="hsl(var(--primary))"
                                                >
                                                        {data.map((entry, index) => (
                                                                <Cell
                                                                        key={`cell-${index}`}
                                                                        fill={entry.count >= peakThreshold ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                                                                />
                                                        ))}
                                                </Bar>
                                        </BarChart>
                                </ResponsiveContainer>

                                <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                                                <span>通常時間</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-sm bg-destructive"></div>
                                                <span>ピーク時間</span>
                                        </div>
                                </div>
                        </CardContent>
                </Card>
        );
};

export default OrdersByHourChart;