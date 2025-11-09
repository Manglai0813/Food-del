import { useNavigate, useSearchParams } from 'react-router-dom';
import { useOrder, useOrderHistory } from '@/hooks';
import type { OrderStatus, OrderStatusHistory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    CheckCircle2,
    Package,
    Truck,
    MapPin,
    Phone,
    FileText,
    Clock,
    ShoppingBag,
    Home,
    HelpCircle
} from 'lucide-react';

// 注文成功ページコンポーネント
export const OrderSuccessPage: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const orderId = Number(searchParams.get('id'));

    // 注文詳細とステータス履歴を取得
    const { data: order, isLoading, error } = useOrder(orderId);
    const { data: statusHistory } = useOrderHistory(orderId);

    // ステータスラベル取得
    const getStatusLabel = (status: OrderStatus): string => {
        const labels: Record<OrderStatus, string> = {
            pending: 'Order Confirmed',
            confirmed: 'Confirmed',
            preparing: 'Preparing',
            delivery: 'Out for Delivery',
            completed: 'Delivered',
            cancelled: 'Cancelled',
        };
        return labels[status] || status;
    };

    // ステータスバッジ取得
    const getStatusBadge = (status: OrderStatus) => {
        const configs: Record<OrderStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
            pending: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
            confirmed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
            preparing: { variant: 'default', icon: <Package className="h-3 w-3 mr-1" /> },
            delivery: { variant: 'default', icon: <Truck className="h-3 w-3 mr-1" /> },
            completed: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3 mr-1" /> },
            cancelled: { variant: 'destructive', icon: <FileText className="h-3 w-3 mr-1" /> },
        };
        const config = configs[status] || configs.pending;
        return (
            <Badge variant={config.variant} className="flex items-center w-fit">
                {config.icon}
                {getStatusLabel(status)}
            </Badge>
        );
    };

    // 配送進行状況ステップ
    const getDeliverySteps = (currentStatus: OrderStatus) => {
        const steps = [
            { key: 'pending', label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
            { key: 'confirmed', label: 'Confirmed', icon: <CheckCircle2 className="h-4 w-4" /> },
            { key: 'preparing', label: 'Preparing', icon: <Package className="h-4 w-4" /> },
            { key: 'delivery', label: 'On the Way', icon: <Truck className="h-4 w-4" /> },
            { key: 'completed', label: 'Delivered', icon: <CheckCircle2 className="h-4 w-4" /> },
        ];

        const statusOrder = ['pending', 'confirmed', 'preparing', 'delivery', 'completed'];
        const currentIndex = statusOrder.indexOf(currentStatus);

        return steps.map((step, index) => ({
            ...step,
            completed: index <= currentIndex,
            active: index === currentIndex,
        }));
    };

    // ローディング中
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading order details...</p>
                </div>
            </div>
        );
    }

    // エラー時
    if (error || !order) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
                <Card className="max-w-md mx-auto text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Order Not Found</h2>
                        <p className="text-muted-foreground mb-6">
                            We couldn't find the order you're looking for.
                        </p>
                        <Button onClick={() => navigate('/')} size="lg">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const deliverySteps = getDeliverySteps(order.status as OrderStatus);
    const subtotal = order.summary.totalAmount;
    const deliveryFee = subtotal >= 3000 ? 0 : 300;
    const imageBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-fadeIn">
                    <CheckCircle2 className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
                <h1 className="text-3xl mobile:text-4xl font-bold mb-2">
                    Order Placed Successfully!
                </h1>
                <p className="text-muted-foreground">
                    Order #{order.id} · {new Date(order.order_date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                    })}
                </p>
            </div>

            <div className="grid grid-cols-1 mobile:grid-cols-3 gap-8">
                <div className="mobile:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Truck className="h-5 w-5" />
                                    Delivery Status
                                </CardTitle>
                                {getStatusBadge(order.status as OrderStatus)}
                            </div>
                            <CardDescription>Track your order progress</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    {deliverySteps.map((step, index) => (
                                        <div key={step.key} className="flex items-center flex-1">
                                            <div className="flex flex-col items-center z-10 bg-background">
                                                <div
                                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.completed
                                                        ? 'bg-green-500 text-white'
                                                        : 'bg-muted text-muted-foreground border-2 border-border'
                                                        }`}
                                                >
                                                    {step.completed ? step.icon : <div className="w-2 h-2 rounded-full bg-muted-foreground" />}
                                                </div>
                                                <span className={`text-xs mt-2 text-center whitespace-nowrap ${step.completed ? 'text-foreground font-medium' : 'text-muted-foreground'
                                                    }`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                            {index < deliverySteps.length - 1 && (
                                                <div
                                                    className={`flex-1 h-0.5 -mx-5 transition-colors ${step.completed ? 'bg-green-500' : 'bg-muted'
                                                        }`}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ShoppingBag className="h-5 w-5" />
                                Order Items
                            </CardTitle>
                            <CardDescription>{order.items.length} items in this order</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-4 border border-border rounded-lg"
                                >
                                    <img
                                        src={`${imageBaseUrl}/files${item.food.image_path}`}
                                        alt={item.food.name}
                                        className="w-16 h-16 mobile:w-20 mobile:h-20 object-cover rounded-lg"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base truncate">{item.food.name}</h4>
                                        <p className="text-sm text-muted-foreground">
                                            ${item.price.toFixed(2)} × {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-lg text-primary">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Delivery Information
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-muted-foreground">Address</p>
                                    <p className="text-foreground">{order.delivery_address}</p>
                                </div>
                            </div>

                            <Separator />

                            <div className="flex items-start gap-3">
                                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="flex-1">
                                    <p className="font-medium text-sm text-muted-foreground">Phone</p>
                                    <p className="text-foreground">{order.phone}</p>
                                </div>
                            </div>

                            {order.notes && (
                                <>
                                    <Separator />
                                    <div className="flex items-start gap-3">
                                        <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <p className="font-medium text-sm text-muted-foreground">Notes</p>
                                            <p className="text-foreground">{order.notes}</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {statusHistory && statusHistory.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Order History
                                </CardTitle>
                                <CardDescription>Timeline of your order updates</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {statusHistory.map((history: OrderStatusHistory, index: number) => (
                                    <div key={history.id} className="flex items-start gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-2 h-2 bg-primary rounded-full" />
                                            {index < statusHistory.length - 1 && (
                                                <div className="w-0.5 h-full bg-muted my-1" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex-1">
                                                    <p className="font-medium">
                                                        {getStatusLabel(history.new_status as OrderStatus)}
                                                    </p>
                                                    {history.note && (
                                                        <p className="text-sm text-muted-foreground mt-1">{history.note}</p>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                                    {new Date(history.updated_at).toLocaleString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="mobile:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal</span>
                                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="font-medium">
                                        {deliveryFee === 0 ? (
                                            <Badge variant="secondary" className="font-normal">Free</Badge>
                                        ) : (
                                            `$${deliveryFee.toFixed(2)}`
                                        )}
                                    </span>
                                </div>

                                <Separator />

                                <div className="flex justify-between text-lg font-semibold">
                                    <span>Total</span>
                                    <span className="text-primary">${(subtotal + deliveryFee).toFixed(2)}</span>
                                </div>
                            </div>

                            <Separator />

                            <div className="space-y-3">
                                <Button
                                    onClick={() => navigate('/my-orders')}
                                    className="w-full"
                                    size="lg"
                                >
                                    <FileText className="mr-2 h-4 w-4" />
                                    View My Orders
                                </Button>
                                <Button
                                    onClick={() => navigate('/')}
                                    variant="outline"
                                    className="w-full"
                                    size="lg"
                                >
                                    <Home className="mr-2 h-4 w-4" />
                                    Back to Home
                                </Button>
                            </div>

                            <Card className="bg-muted/50 border-0">
                                <CardContent className="pt-6">
                                    <div className="flex items-start gap-3">
                                        <HelpCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-sm mb-1">Need Help?</h4>
                                            <p className="text-xs text-muted-foreground mb-3">
                                                Contact us if you have any questions about your order.
                                            </p>
                                            <Button variant="secondary" className="w-full" size="sm">
                                                Contact Support
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};
