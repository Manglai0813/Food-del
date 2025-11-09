import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrders, useUpdateOrderStatus } from '@/api';
import type { OrderStatus } from '@/types/order';
import {
    formatCurrency,
    formatDateTime,
    statusLabels,
    statusColors,
} from '@/utils/orderUtils';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Eye } from 'lucide-react';

// 注文一覧ページコンポーネント
const OrderListPage = () => {
    const navigate = useNavigate();

    // ステータスフィルタを管理
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');

    // ステータスフィルタをuseMemoでメモ化
    const queryParams = useMemo(() => {
        return statusFilter !== 'all' ? { status: statusFilter } : undefined;
    }, [statusFilter]);

    // 注文一覧を取得
    const { data: orders, isLoading, error, refetch } = useOrders(queryParams);

    // 注文ステータス更新の変更関数
    const updateStatusMutation = useUpdateOrderStatus();

    // 注文一覧を更新しtoast通知を表示
    const handleRefresh = () => {
        refetch();
        toast.success('注文一覧を更新しました');
    };

    // 注文ステータスを変更しtoast通知を表示
    const handleStatusChange = useCallback(async (orderId: number, newStatus: OrderStatus) => {
        try {
            await updateStatusMutation.mutateAsync({
                orderId,
                status: newStatus,
            });
            toast.success('注文ステータスが更新されました');
        } catch (error) {
            let errorMessage = '注文ステータスの更新に失敗しました';
            if (error instanceof Error) {
                errorMessage = error.message;
                // エラーメッセージの状態名を日本語に置換
                Object.entries(statusLabels).forEach(([key, label]) => {
                    errorMessage = errorMessage.replace(key, label);
                });
            }
            toast.error(errorMessage);
        }
    }, [updateStatusMutation]);

    // 注文詳細ページへ遷移
    const handleViewOrder = useCallback((orderId: number) => {
        navigate(`/orders/${orderId}`);
    }, [navigate]);

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">注文管理</h1>
                    <p className="text-sm md:text-base text-muted-foreground">全注文の確認・ステータス管理</p>
                </div>
                <Button
                    onClick={handleRefresh}
                    disabled={isLoading}
                    variant="outline"
                    size="sm"
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    更新
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <CardTitle className="text-lg md:text-xl">注文一覧</CardTitle>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="text-sm text-muted-foreground">ステータス:</span>
                            <Select
                                value={statusFilter}
                                onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
                            >
                                <SelectTrigger className="w-full sm:w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">全て</SelectItem>
                                    <SelectItem value="pending">待機中</SelectItem>
                                    <SelectItem value="confirmed">確認済</SelectItem>
                                    <SelectItem value="preparing">準備中</SelectItem>
                                    <SelectItem value="delivery">配送中</SelectItem>
                                    <SelectItem value="completed">完了</SelectItem>
                                    <SelectItem value="cancelled">キャンセル</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">読み込み中...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-destructive font-medium">エラーが発生しました</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {error instanceof Error ? error.message : '不明なエラー'}
                            </p>
                            <Button onClick={handleRefresh} variant="outline" className="mt-4">
                                再試行
                            </Button>
                        </div>
                    ) : !orders || orders.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">注文がありません</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>注文ID</TableHead>
                                        <TableHead>注文日時</TableHead>
                                        <TableHead>顧客名</TableHead>
                                        <TableHead>合計金額</TableHead>
                                        <TableHead>配送先</TableHead>
                                        <TableHead>電話番号</TableHead>
                                        <TableHead>ステータス</TableHead>
                                        <TableHead>アクション</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.map((order) => (
                                        <TableRow key={order.id}>
                                            <TableCell className="font-medium">#{order.id}</TableCell>
                                            <TableCell>{formatDateTime(order.order_date)}</TableCell>
                                            <TableCell>{order.user.name}</TableCell>
                                            <TableCell className="font-medium">
                                                {formatCurrency(order.total_amount)}
                                            </TableCell>
                                            <TableCell className="max-w-xs truncate">
                                                {order.delivery_address}
                                            </TableCell>
                                            <TableCell>{order.phone}</TableCell>
                                            <TableCell>
                                                <Select
                                                    value={order.status}
                                                    onValueChange={(value) =>
                                                        handleStatusChange(order.id, value as OrderStatus)
                                                    }
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <SelectTrigger className={`w-32 border-0 px-0 ${statusColors[order.status]}`}>
                                                        <span className="font-medium">{statusLabels[order.status]}</span>
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="pending">待機中</SelectItem>
                                                        <SelectItem value="confirmed">確認済</SelectItem>
                                                        <SelectItem value="preparing">準備中</SelectItem>
                                                        <SelectItem value="delivery">配送中</SelectItem>
                                                        <SelectItem value="completed">完了</SelectItem>
                                                        <SelectItem value="cancelled">キャンセル</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => handleViewOrder(order.id)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    詳細
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default OrderListPage;