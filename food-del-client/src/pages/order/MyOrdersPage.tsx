import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useOrderOperations } from '@/hooks';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { showSuccess, showError } from '@/lib';
import {
    FileText,
    Package,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    ShoppingBag,
    Calendar,
    DollarSign,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

// マイオーダーページコンポーネント
export const MyOrdersPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: orders, isLoading, error } = useOrders();
    const { cancelOrder } = useOrderOperations();
    const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null);

    // 注文キャンセル処理
    const handleCancelOrder = async (orderId: number) => {
        try {
            setCancellingOrderId(orderId);
            await cancelOrder({ id: orderId });
            showSuccess('Order cancelled successfully');
        } catch (error) {
            console.error('注文キャンセルエラー:', error);
            showError('Failed to cancel order. Please try again.');
        } finally {
            setCancellingOrderId(null);
        }
    };

    // ステータスバッジ取得
    const getStatusBadge = (status: OrderStatus) => {
        const configs: Record<OrderStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode; label: string }> = {
            pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" />, label: 'Pending' },
            confirmed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3 mr-1" />, label: 'Confirmed' },
            preparing: { variant: 'default', icon: <Package className="h-3 w-3 mr-1" />, label: 'Preparing' },
            delivery: { variant: 'default', icon: <Truck className="h-3 w-3 mr-1" />, label: 'Out for Delivery' },
            completed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3 mr-1" />, label: 'Delivered' },
            cancelled: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" />, label: 'Cancelled' },
        };
        const config = configs[status] || configs.pending;
        return (
            <Badge variant={config.variant} className="flex items-center w-fit">
                {config.icon}
                {config.label}
            </Badge>
        );
    };

    // ローディング中
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your orders...</p>
                </div>
            </div>
        );
    }

    // エラー時
    if (error) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <XCircle className="w-10 h-10 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Failed to Load Orders</h2>
                        <p className="text-muted-foreground mb-6">
                            Something went wrong while loading your orders.
                        </p>
                        <Button onClick={() => window.location.reload()} size="lg">
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // 空の注文リスト
    if (!orders || orders.length === 0) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">No Orders Yet</h2>
                        <p className="text-muted-foreground mb-6">
                            You haven't placed any orders yet. Start shopping to see your orders here!
                        </p>
                        <Button onClick={() => navigate('/')} size="lg">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Start Shopping
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const imageBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
            {/* ヘッダー */}
            <div className="mb-8">
                <h1 className="text-3xl mobile:text-4xl font-bold mb-2">My Orders</h1>
                <p className="text-muted-foreground">
                    View and track all your orders
                </p>
            </div>

            {/* 注文リスト */}
            <div className="space-y-6">
                {orders.map((order) => {
                    const subtotal = order.total_amount;
                    const deliveryFee = subtotal >= 3000 ? 0 : 300;
                    const total = subtotal + deliveryFee;
                    const canCancel = ['pending', 'confirmed'].includes(order.status);

                    return (
                        <Card key={order.id} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex flex-col mobile:flex-row mobile:items-center mobile:justify-between gap-4">
                                    <div>
                                        <CardTitle className="flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Order #{order.id}
                                        </CardTitle>
                                        <CardDescription className="flex items-center gap-2 mt-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(order.order_date).toLocaleDateString('en-US', {
                                                month: 'long',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </CardDescription>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {getStatusBadge(order.status as OrderStatus)}
                                        {canCancel && (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={cancellingOrderId === order.id}
                                                        className="text-destructive hover:bg-destructive/10 border-destructive/30"
                                                    >
                                                        {cancellingOrderId === order.id ? 'Cancelling...' : 'Cancel Order'}
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Cancel Order #{order.id}?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to cancel this order? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>No, Keep Order</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleCancelOrder(order.id)}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                        >
                                                            Yes, Cancel Order
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                {/* 商品リスト */}
                                <div className="space-y-3">
                                    {order.items && order.items.length > 0 ? (
                                        <>
                                            {order.items.slice(0, 3).map((item) => (
                                                <div key={item.id} className="flex items-center gap-4">
                                                    <img
                                                        src={`${imageBaseUrl}/files${item.food.image_path}`}
                                                        alt={item.food.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{item.food.name}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            ${item.price.toFixed(2)} × {item.quantity}
                                                        </p>
                                                    </div>
                                                    <p className="font-medium">
                                                        ${(item.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-sm text-muted-foreground">
                                                    +{order.items.length - 3} more items
                                                </p>
                                            )}
                                        </>
                                    ) : (
                                        <div className="text-center py-4">
                                            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                                            <p className="text-sm text-muted-foreground">
                                                {order.summary?.itemCount || 0} items in this order
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Separator />

                                {/* 配送先住所 */}
                                <div className="flex items-start gap-3">
                                    <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-muted-foreground">Delivery Address</p>
                                        <p className="text-foreground text-sm">{order.delivery_address}</p>
                                    </div>
                                </div>

                                <Separator />

                                {/* 合計と詳細ボタン */}
                                <div className="flex flex-col mobile:flex-row mobile:items-center mobile:justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Total:</span>
                                        <span className="text-lg font-semibold text-primary">
                                            ${total.toFixed(2)}
                                        </span>
                                    </div>
                                    <Button
                                        onClick={() => navigate(`/order-success?id=${order.id}`)}
                                        variant="outline"
                                    >
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* 継続ショッピングボタン */}
            <div className="mt-8 text-center">
                <Button onClick={() => navigate('/')} variant="outline" size="lg">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Continue Shopping
                </Button>
            </div>
        </div>
    );
};