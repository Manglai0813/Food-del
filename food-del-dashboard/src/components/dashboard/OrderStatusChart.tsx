import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

// 注文状況チャートのプロパティ型定義
interface OrderStatusChartProps {
        data?: Array<{
                status: string;
                count: number;
                percentage: number;
        }>;
}

/**
 * 注文状況チャートコンポーネント
 * 注文状態別の統計情報をプログレスバーで表示
 */
const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
        // データが空の場合はローディング表示
        if (!data || data.length === 0) {
                return (
                        <Card>
                                <CardHeader>
                                        <CardTitle>注文状況サマリー</CardTitle>
                                </CardHeader>
                                <CardContent>
                                        <div className="space-y-4">
                                                {Array.from({ length: 3 }).map((_, i) => (
                                                        <div key={i} className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="animate-pulse bg-muted rounded-full w-6 h-6"></div>
                                                                        <div className="animate-pulse bg-muted rounded w-16 h-4"></div>
                                                                </div>
                                                                <div className="animate-pulse bg-muted rounded w-12 h-4"></div>
                                                        </div>
                                                ))}
                                        </div>
                                </CardContent>
                        </Card>
                );
        }

        // 状態に対応したアイコンを返す
        const getStatusIcon = (status: string) => {
                switch (status) {
                        case '完了':
                                return <CheckCircle className="h-5 w-5 text-green-600" />;
                        case '準備中':
                                return <Clock className="h-5 w-5 text-yellow-600" />;
                        case 'キャンセル':
                                return <XCircle className="h-5 w-5 text-red-600" />;
                        default:
                                return <Clock className="h-5 w-5 text-gray-600" />;
                }
        };

        // 状態に対応した色を返す
        const getStatusColor = (status: string) => {
                switch (status) {
                        case '完了':
                                return 'bg-green-500';
                        case '準備中':
                                return 'bg-yellow-500';
                        case 'キャンセル':
                                return 'bg-red-500';
                        default:
                                return 'bg-gray-500';
                }
        };

        // 総注文数を計算
        const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

        return (
                <Card>
                        <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                        注文状況サマリー
                                        <span className="text-sm font-normal text-muted-foreground">
                                                総計: {totalOrders} 件
                                        </span>
                                </CardTitle>
                        </CardHeader>
                        <CardContent>
                                <div className="space-y-4">
                                        {data.map((item, index) => (
                                                <div key={index} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                        {getStatusIcon(item.status)}
                                                                        <span className="font-medium text-sm">{item.status}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm">
                                                                        <span className="font-medium">{item.count} 件</span>
                                                                        <span className="text-muted-foreground">
                                                                                ({item.percentage.toFixed(1)}%)
                                                                        </span>
                                                                </div>
                                                        </div>

                                                        <Progress
                                                                value={item.percentage}
                                                                className="h-2"
                                                                style={{
                                                                        '--progress-background': getStatusColor(item.status),
                                                                } as React.CSSProperties}
                                                        />
                                                </div>
                                        ))}
                                </div>

                                <div className="mt-6 pt-4 border-t">
                                        <div className="grid grid-cols-2 gap-4 text-center">
                                                <div>
                                                        <p className="text-2xl font-bold text-green-600">
                                                                {data.find(d => d.status === '完了')?.percentage.toFixed(1) || '0'}%
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">完了率</p>
                                                </div>
                                                <div>
                                                        <p className="text-2xl font-bold text-yellow-600">
                                                                {data.find(d => d.status === '準備中')?.count || 0}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">処理中</p>
                                                </div>
                                        </div>
                                </div>
                        </CardContent>
                </Card>
        );
};

export default OrderStatusChart;