/**
 * 注文確定ページ - 現代的なデザイン
 * Card + Toast + レスポンシブ対応
 */

import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useCartOperations } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CreditCard, MapPin, User, Phone, Mail } from 'lucide-react';
import { showSuccess, showError } from '@/lib';

export const PlaceOrderPage: React.FC = () => {
        const navigate = useNavigate();
        const { data: cart, isLoading: cartLoading } = useCart();
        const { checkout } = useCartOperations();
        const [isSubmitting, setIsSubmitting] = useState(false);

        const [formData, setFormData] = useState({
                firstName: '',
                lastName: '',
                email: '',
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: '',
                phone: '',
        });

        const cartItems = cart?.cart_items || [];
        const subtotal = cart?.summary?.totalAmount || 0;
        const deliveryFee = subtotal >= 3000 ? 0 : 300;
        const total = subtotal + deliveryFee;

        // 入力変更ハンドラ
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const { name, value } = e.target;
                setFormData((prev) => ({ ...prev, [name]: value }));
        };

        // 注文送信ハンドラ
        const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
                e.preventDefault();

                // 購入前チェック
                if (cartItems.length === 0) {
                        showError('Your cart is empty. Please add items before checkout.');
                        return;
                }

                try {
                        setIsSubmitting(true);

                        // 配送先住所を組み立て
                        const deliveryAddress = `${formData.street}, ${formData.city}, ${formData.state} ${formData.zipCode}, ${formData.country}`;

                        const response = await checkout({
                                delivery_address: deliveryAddress,
                                phone: formData.phone,
                                notes: `Name: ${formData.firstName} ${formData.lastName}, Email: ${formData.email}`,
                        });

                        showSuccess('Order placed successfully!');

                        // 成功したら注文IDと共に成功ページへ
                        navigate(`/order-success?id=${response.data?.id}`);
                } catch (error: unknown) {
                        console.error('注文エラー:', error);
                        let errorMessage = 'Failed to place order. Please try again.';
                        if (error instanceof Error) {
                                errorMessage = error.message;
                        } else if (typeof error === 'object' && error !== null) {
                                const errRecord = error as Record<string, unknown>;
                                const responseData = errRecord.response as Record<string, unknown>;
                                if (responseData && typeof responseData === 'object') {
                                        const dataObj = responseData.data as Record<string, unknown>;
                                        if (dataObj && typeof dataObj.message === 'string') {
                                                errorMessage = dataObj.message;
                                        }
                                }
                        }
                        showError(errorMessage);
                } finally {
                        setIsSubmitting(false);
                }
        };

        // カート読み込み中
        if (cartLoading) {
                return (
                        <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                        <p className="text-muted-foreground">Loading checkout...</p>
                                </div>
                        </div>
                );
        }

        // 空のカート
        if (cartItems.length === 0) {
                return (
                        <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
                                <Card className="max-w-md mx-auto text-center">
                                        <CardContent className="pt-12 pb-8">
                                                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                                                        <CreditCard className="w-10 h-10 text-muted-foreground" />
                                                </div>
                                                <h2 className="text-2xl font-semibold mb-2">No items to checkout</h2>
                                                <p className="text-muted-foreground mb-6">
                                                        Please add items to your cart before proceeding to checkout.
                                                </p>
                                                <Button onClick={() => navigate('/')} size="lg">
                                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                                        Continue Shopping
                                                </Button>
                                        </CardContent>
                                </Card>
                        </div>
                );
        }

        return (
                <div className="container max-w-7xl mx-auto px-4 py-8 mobile:py-12">
                        {/* ヘッダー */}
                        <div className="mb-8">
                                <Button
                                        variant="ghost"
                                        onClick={() => navigate('/cart')}
                                        className="mb-4 -ml-2"
                                >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back to Cart
                                </Button>
                                <h1 className="text-3xl mobile:text-4xl font-bold mb-2">Checkout</h1>
                                <p className="text-muted-foreground">
                                        Complete your order by providing delivery information
                                </p>
                        </div>

                        <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 mobile:grid-cols-3 gap-8">
                                        {/* 左側：配送情報フォーム */}
                                        <div className="mobile:col-span-2 space-y-6">
                                                {/* 個人情報 */}
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center gap-2">
                                                                        <User className="h-5 w-5" />
                                                                        Personal Information
                                                                </CardTitle>
                                                                <CardDescription>Please provide your contact details</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                                <div className="grid grid-cols-1 mobile:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                                <Label htmlFor="firstName">First Name *</Label>
                                                                                <Input
                                                                                        id="firstName"
                                                                                        name="firstName"
                                                                                        value={formData.firstName}
                                                                                        onChange={handleChange}
                                                                                        placeholder="John"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                                <Label htmlFor="lastName">Last Name *</Label>
                                                                                <Input
                                                                                        id="lastName"
                                                                                        name="lastName"
                                                                                        value={formData.lastName}
                                                                                        onChange={handleChange}
                                                                                        placeholder="Doe"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                        <Label htmlFor="email" className="flex items-center gap-2">
                                                                                <Mail className="h-4 w-4" />
                                                                                Email *
                                                                        </Label>
                                                                        <Input
                                                                                id="email"
                                                                                name="email"
                                                                                type="email"
                                                                                value={formData.email}
                                                                                onChange={handleChange}
                                                                                placeholder="john.doe@example.com"
                                                                                required
                                                                        />
                                                                </div>

                                                                <div className="space-y-2">
                                                                        <Label htmlFor="phone" className="flex items-center gap-2">
                                                                                <Phone className="h-4 w-4" />
                                                                                Phone *
                                                                        </Label>
                                                                        <Input
                                                                                id="phone"
                                                                                name="phone"
                                                                                type="tel"
                                                                                value={formData.phone}
                                                                                onChange={handleChange}
                                                                                placeholder="090-1234-5678"
                                                                                required
                                                                        />
                                                                </div>
                                                        </CardContent>
                                                </Card>

                                                {/* 配送先住所 */}
                                                <Card>
                                                        <CardHeader>
                                                                <CardTitle className="flex items-center gap-2">
                                                                        <MapPin className="h-5 w-5" />
                                                                        Delivery Address
                                                                </CardTitle>
                                                                <CardDescription>Where should we deliver your order?</CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                                <div className="space-y-2">
                                                                        <Label htmlFor="street">Street Address *</Label>
                                                                        <Input
                                                                                id="street"
                                                                                name="street"
                                                                                value={formData.street}
                                                                                onChange={handleChange}
                                                                                placeholder="123 Main Street"
                                                                                required
                                                                        />
                                                                </div>

                                                                <div className="grid grid-cols-1 mobile:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                                <Label htmlFor="city">City *</Label>
                                                                                <Input
                                                                                        id="city"
                                                                                        name="city"
                                                                                        value={formData.city}
                                                                                        onChange={handleChange}
                                                                                        placeholder="Tokyo"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                                <Label htmlFor="state">State / Province *</Label>
                                                                                <Input
                                                                                        id="state"
                                                                                        name="state"
                                                                                        value={formData.state}
                                                                                        onChange={handleChange}
                                                                                        placeholder="Shibuya"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                </div>

                                                                <div className="grid grid-cols-1 mobile:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                                <Label htmlFor="zipCode">Zip / Postal Code *</Label>
                                                                                <Input
                                                                                        id="zipCode"
                                                                                        name="zipCode"
                                                                                        value={formData.zipCode}
                                                                                        onChange={handleChange}
                                                                                        placeholder="150-0001"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                                <Label htmlFor="country">Country *</Label>
                                                                                <Input
                                                                                        id="country"
                                                                                        name="country"
                                                                                        value={formData.country}
                                                                                        onChange={handleChange}
                                                                                        placeholder="Japan"
                                                                                        required
                                                                                />
                                                                        </div>
                                                                </div>
                                                        </CardContent>
                                                </Card>
                                        </div>

                                        {/* 右側：注文サマリー */}
                                        <div className="mobile:col-span-1">
                                                <Card className="sticky top-4">
                                                        <CardHeader>
                                                                <CardTitle>Order Summary</CardTitle>
                                                                <CardDescription>
                                                                        {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                                                                </CardDescription>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                                {/* 商品リスト（簡略版） */}
                                                                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                                                                        {cartItems.map((item) => (
                                                                                <div key={item.id} className="flex justify-between text-sm">
                                                                                        <div className="flex-1">
                                                                                                <p className="font-medium truncate">{item.food.name}</p>
                                                                                                <p className="text-muted-foreground">Qty: {item.quantity}</p>
                                                                                        </div>
                                                                                        <p className="font-medium ml-2">
                                                                                                ${(item.food.price * item.quantity).toFixed(2)}
                                                                                        </p>
                                                                                </div>
                                                                        ))}
                                                                </div>

                                                                <Separator />

                                                                {/* 小計 */}
                                                                <div className="flex justify-between text-sm">
                                                                        <span className="text-muted-foreground">Subtotal</span>
                                                                        <span className="font-medium">${subtotal.toFixed(2)}</span>
                                                                </div>

                                                                {/* 配送料 */}
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

                                                                {/* 配送料無料の案内 */}
                                                                {subtotal > 0 && subtotal < 3000 && (
                                                                        <div className="bg-muted/50 p-3 rounded-lg">
                                                                                <p className="text-xs text-muted-foreground">
                                                                                        Add <strong className="text-foreground">${(3000 - subtotal).toFixed(2)}</strong> more for free delivery!
                                                                                </p>
                                                                        </div>
                                                                )}

                                                                <Separator />

                                                                {/* 合計 */}
                                                                <div className="flex justify-between text-lg font-semibold">
                                                                        <span>Total</span>
                                                                        <span className="text-primary">${total.toFixed(2)}</span>
                                                                </div>

                                                                {/* 送信ボタン */}
                                                                <Button
                                                                        type="submit"
                                                                        disabled={isSubmitting || cartItems.length === 0}
                                                                        className="w-full"
                                                                        size="lg"
                                                                >
                                                                        {isSubmitting ? (
                                                                                <>
                                                                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                                                        Processing...
                                                                                </>
                                                                        ) : (
                                                                                <>
                                                                                        <CreditCard className="mr-2 h-4 w-4" />
                                                                                        Place Order
                                                                                </>
                                                                        )}
                                                                </Button>

                                                                <p className="text-xs text-center text-muted-foreground">
                                                                        By placing this order, you agree to our terms and conditions
                                                                </p>
                                                        </CardContent>
                                                </Card>
                                        </div>
                                </div>
                        </form>
                </div>
        );
};
