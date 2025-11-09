import { useMemo } from 'react';
import { toast } from 'sonner';
import { DollarSign, ShoppingCart, Package, TrendingUp, RefreshCw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    StatsCard,
    SalesChart,
    CategoryChart,
    OrdersByHourChart,
    TopProductsList,
    OrderStatusChart
} from '@/components/dashboard';
import {
    useDashboardOverview,
    useDashboardSales,
    useDashboardProducts,
    useDashboardOrders,
    useOrderStats
} from '@/api';
import { useDashboardAutoRefresh } from '@/hooks';

// 通貨フォーマット関数はコンポーネント外に定義
const formatCurrency = (value?: number) => {
    if (value == null) return '¥0';
    return new Intl.NumberFormat('ja-JP', {
        style: 'currency',
        currency: 'JPY',
        minimumFractionDigits: 0,
    }).format(value);
};

// ステータスラベルはコンポーネント外に定義
const statusLabels: Record<string, string> = {
    pending: '待機中',
    confirmed: '確認済',
    preparing: '準備中',
    delivery: '配送中',
    completed: '完了',
    cancelled: 'キャンセル'
};

// ダッシュボードページコンポーネント
const DashboardPage = () => {
    // データ取得ホック群
    const overviewQuery = useDashboardOverview();
    const salesQuery = useDashboardSales();
    const productQuery = useDashboardProducts();
    const orderQuery = useDashboardOrders();
    const orderStatsQuery = useOrderStats();

    // ダッシュボード更新ホック
    const { refreshDashboard: _refreshDashboard } = useDashboardAutoRefresh();

    // ダッシュボード更新ハンドラーはtoast通知を表示
    const handleRefreshDashboard = () => {
        _refreshDashboard();
        toast.success('ダッシュボードを更新しました');
    };

    // データソースを統一化しuseMemoでメモ化
    const unifiedStats = useMemo(() => ({
        totalRevenue: orderStatsQuery.data?.total_revenue ?? overviewQuery.data?.totalRevenue.value,
        totalOrders: orderStatsQuery.data?.total_orders ?? overviewQuery.data?.totalOrders.value,
        totalProducts: overviewQuery.data?.totalProducts,
        averageOrderValue: overviewQuery.data?.averageOrderValue,
    }), [orderStatsQuery.data, overviewQuery.data]);

    // 売上データをメモ化
    const salesData = useMemo(() => {
        if (orderStatsQuery.data?.revenue_trend) {
            return orderStatsQuery.data.revenue_trend.map(item => ({
                date: item.date,
                revenue: item.revenue,
                orders: item.order_count
            }));
        }
        return salesQuery.data?.dailySales;
    }, [orderStatsQuery.data, salesQuery.data]);

    // 注文ステータスデータをメモ化
    const orderStatusData = useMemo(() => {
        if (orderStatsQuery.data?.status_breakdown) {
            const total = Object.values(orderStatsQuery.data.status_breakdown).reduce((sum, count) => sum + count, 0);
            return Object.entries(orderStatsQuery.data.status_breakdown).map(([status, count]) => ({
                status: statusLabels[status] || status,
                count,
                percentage: total > 0 ? (count / total) * 100 : 0
            }));
        }
        return orderQuery.data?.orderStatus;
    }, [orderStatsQuery.data, orderQuery.data]);

    // エラーとローディング状態を集約
    const queries = [
        { query: overviewQuery, name: 'ダッシュボード概要' },
        { query: salesQuery, name: '売上統計' },
        { query: productQuery, name: '商品統計' },
        { query: orderQuery, name: '注文統計' },
        { query: orderStatsQuery, name: '注文詳細統計' }
    ];

    // ローディング状態を管理
    const isAnyLoading = queries.some(q => q.query.isLoading);

    // エラー状態を管理
    const isAnyError = queries.some(q => q.query.isError);

    // エラーの詳細情報を集約
    const errorDetails = queries
        .filter(q => q.query.isError)
        .map(q => ({
            name: q.name,
            error: q.query.error instanceof Error ? q.query.error.message : '不明なエラー'
        }));

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">ダッシュボード</h1>
                    <p className="text-sm md:text-base text-muted-foreground">
                        売上統計と運営状況の概要をご確認いただけます
                    </p>
                </div>
                <Button
                    onClick={handleRefreshDashboard}
                    disabled={isAnyLoading}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isAnyLoading ? 'animate-spin' : ''}`} />
                    更新
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    title="総売上"
                    value={unifiedStats.totalRevenue}
                    icon={<DollarSign className="h-6 w-6 text-primary" />}
                    formatter={formatCurrency}
                    loading={orderStatsQuery.isLoading || overviewQuery.isLoading}
                />
                <StatsCard
                    title="総注文数"
                    value={unifiedStats.totalOrders}
                    icon={<ShoppingCart className="h-6 w-6 text-primary" />}
                    formatter={v => v ? `${v} 件` : '0 件'}
                    loading={orderStatsQuery.isLoading || overviewQuery.isLoading}
                />
                <StatsCard
                    title="商品数"
                    value={unifiedStats.totalProducts?.value}
                    subtitle={`アクティブ: ${unifiedStats.totalProducts?.activeCount || 0}`}
                    icon={<Package className="h-6 w-6 text-primary" />}
                    formatter={v => v ? `${v} 品目` : '0 品目'}
                    loading={overviewQuery.isLoading}
                />
                <StatsCard
                    title="平均注文額"
                    value={unifiedStats.averageOrderValue?.value}
                    change={unifiedStats.averageOrderValue?.change}
                    trend={unifiedStats.averageOrderValue?.trend}
                    icon={<TrendingUp className="h-6 w-6 text-primary" />}
                    formatter={formatCurrency}
                    loading={overviewQuery.isLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>売上トレンド</CardTitle>
                        <p className="text-sm text-muted-foreground">過去7日間の売上推移</p>

                    </CardHeader>
                    <CardContent>
                        <SalesChart data={salesData} isLoading={orderStatsQuery.isLoading || salesQuery.isLoading} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>カテゴリ別売上</CardTitle>
                        <p className="text-sm text-muted-foreground">売上構成比</p>

                    </CardHeader>
                    <CardContent>
                        <CategoryChart data={productQuery.data?.categoryStats} isLoading={productQuery.isLoading} />
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <TopProductsList products={productQuery.data?.topProducts} isLoading={productQuery.isLoading} />
                <OrdersByHourChart data={orderQuery.data?.ordersByHour} isLoading={orderQuery.isLoading} />
                <OrderStatusChart data={orderStatusData} isLoading={orderStatsQuery.isLoading || orderQuery.isLoading} />
            </div>

            {isAnyError && (
                <div className="mt-6">
                    <Card className="border-destructive">
                        <CardContent className="pt-6">
                            <div className="text-destructive">
                                <p className="font-medium text-center">データの取得中にエラーが発生しました</p>
                                <div className="text-sm mt-3 text-left bg-destructive/10 p-3 rounded">
                                    <p className="font-semibold mb-2">エラー詳細:</p>
                                    <ul className="space-y-1">
                                        {errorDetails.map((detail, idx) => (
                                            <li key={idx} className="text-xs">
                                                <span className="font-medium">• {detail.name}:</span> {detail.error}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="text-sm mt-3 text-center">APIサーバーが起動していることを確認してください</p>
                                <div className="text-center mt-4">
                                    <Button
                                        onClick={handleRefreshDashboard}
                                        variant="outline"
                                        size="sm"
                                    >
                                        再試行
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;