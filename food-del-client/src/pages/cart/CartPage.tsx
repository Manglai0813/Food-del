import { useNavigate } from 'react-router-dom';
import { useCart, useCartOperations } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { showSuccess, showError } from '@/lib';
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

// カートページコンポーネント
export const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: cart, isLoading } = useCart();
    const { removeItem, updateItem, clearCart } = useCartOperations();
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());
    const [isClearing, setIsClearing] = useState(false);

    // カートアイテム
    const cartItems = cart?.cart_items || [];
    const subtotal = cart?.summary?.totalAmount || 0;
    const deliveryFee = subtotal > 0 ? (subtotal >= 3000 ? 0 : 300) : 0;
    const total = subtotal + deliveryFee;

    // アイテム削除ハンドラ
    const handleRemoveItem = async (itemId: number) => {
        try {
            setUpdatingItems(prev => new Set(prev).add(itemId));
            await removeItem(itemId);
            showSuccess('Item removed from cart');
        } catch (error) {
            console.error('削除エラー:', error);
            showError('Failed to remove item. Please try again.');
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    // 数量更新ハンドラ
    const handleUpdateQuantity = async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        try {
            setUpdatingItems(prev => new Set(prev).add(itemId));
            await updateItem({ itemId, data: { quantity: newQuantity } });
            showSuccess('Quantity updated');
        } catch (error) {
            console.error('更新エラー:', error);
            showError('Failed to update quantity. Please try again.');
        } finally {
            setUpdatingItems(prev => {
                const newSet = new Set(prev);
                newSet.delete(itemId);
                return newSet;
            });
        }
    };

    // カート全体クリアハンドラ
    const handleClearCart = async () => {
        try {
            setIsClearing(true);
            await clearCart();
            showSuccess('Cart cleared successfully');
        } catch (error) {
            console.error('カートクリアエラー:', error);
            showError('Failed to clear cart. Please try again.');
        } finally {
            setIsClearing(false);
        }
    };

    // ローディング状態
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading your cart...</p>
                </div>
            </div>
        );
    }

    // 空のカート状態
    if (cartItems.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center px-4">
                <Card className="max-w-md w-full text-center">
                    <CardContent className="pt-12 pb-8">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
                        <p className="text-muted-foreground mb-6">
                            Add some delicious items to get started!
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

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
            <div className="mb-8 flex flex-col mobile:flex-row mobile:items-center mobile:justify-between gap-4">
                <div>
                    <h1 className="text-3xl mobile:text-4xl font-bold mb-2">Shopping Cart</h1>
                    <p className="text-muted-foreground">
                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                    </p>
                </div>

                {cartItems.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/50"
                                disabled={isClearing}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Clear Cart
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will remove all items from your cart. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleClearCart}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Clear Cart
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>

            <div className="grid grid-cols-1 mobile:grid-cols-3 gap-8">
                <div className="mobile:col-span-2 space-y-4">
                    {cartItems.map((item) => {
                        const isUpdating = updatingItems.has(item.id);
                        const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/files${item.food.image_path}`;

                        return (
                            <Card key={item.id} className={`transition-opacity ${isUpdating ? 'opacity-50' : ''}`}>
                                <CardContent className="p-4 mobile:p-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0">
                                            <img
                                                src={imageUrl}
                                                alt={item.food.name}
                                                className="w-24 h-24 mobile:w-28 mobile:h-28 object-cover rounded-lg"
                                            />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h3 className="font-semibold text-base mobile:text-lg truncate">
                                                    {item.food.name}
                                                </h3>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveItem(item.id)}
                                                    disabled={isUpdating}
                                                    className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>

                                            <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                                {item.food.description}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                                        disabled={isUpdating || item.quantity <= 1}
                                                        className="h-8 w-8"
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </Button>
                                                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                                        disabled={isUpdating}
                                                        className="h-8 w-8"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                <div className="text-right">
                                                    <p className="text-xs text-muted-foreground">${item.food.price} each</p>
                                                    <p className="text-lg font-semibold text-primary">
                                                        ${(item.food.price * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <div className="mobile:col-span-1">
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                            <CardDescription>Review your order details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
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
                                        `$${deliveryFee}`
                                    )}
                                </span>
                            </div>

                            {subtotal > 0 && subtotal < 3000 && (
                                <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-xs text-muted-foreground">
                                        Add <strong className="text-foreground">${(3000 - subtotal).toFixed(2)}</strong> more for free delivery!
                                    </p>
                                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                                        <div
                                            className="bg-primary h-2 rounded-full transition-all"
                                            style={{ width: `${(subtotal / 3000) * 100}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <Separator />
                            <div className="flex justify-between text-lg font-semibold">
                                <span>Total</span>
                                <span className="text-primary">${total.toFixed(2)}</span>
                            </div>

                            <Button
                                onClick={() => navigate('/checkout')}
                                disabled={cartItems.length === 0}
                                className="w-full"
                                size="lg"
                            >
                                Proceed to Checkout
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>

                            <Button
                                onClick={() => navigate('/')}
                                variant="outline"
                                className="w-full"
                            >
                                Continue Shopping
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};