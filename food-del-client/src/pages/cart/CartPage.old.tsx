/**
 * カートページ
 */

import { useNavigate } from 'react-router-dom';
import { useCart, useCartOperations } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

export const CartPage: React.FC = () => {
        const navigate = useNavigate();
        const { data: cart, isLoading } = useCart();
        const { removeItem } = useCartOperations();

        // カートアイテム
        const cartItems = cart?.cart_items || [];
        const subtotal = cart?.summary?.totalAmount || 0;
        const deliveryFee = subtotal > 0 ? (subtotal >= 3000 ? 0 : 300) : 0;
        const total = subtotal + deliveryFee;

        // アイテム削除ハンドラ
        const handleRemoveItem = async (itemId: number) => {
                try {
                        await removeItem(itemId);
                } catch (error) {
                        console.error('削除エラー:', error);
                }
        };

        if (isLoading) {
                return <div className="max-w-[1200px] mx-auto my-25 px-5">Loading...</div>;
        }

        return (
                <div className="max-w-[1200px] mx-auto my-25 px-5">
                        {/* カートアイテムリスト */}
                        <div className="cart-items">
                                {/* ヘッダー */}
                                <div className="grid grid-cols-[0.7fr_2fr_1fr_1fr_1fr_0.5fr] items-center text-muted-foreground text-[max(1vw,12px)] text-center">
                                        <p>Items</p>
                                        <p className="text-left">Title</p>
                                        <p>Price</p>
                                        <p>Quantity</p>
                                        <p>Total</p>
                                        <p>Remove</p>
                                </div>
                                <br />
                                <Separator />

                                {/* カートアイテム */}
                                {cartItems.map((item) => (
                                        <div key={item.id}>
                                                <div className="grid grid-cols-[0.7fr_2fr_1fr_1fr_1fr_0.5fr] items-center my-5 text-center">
                                                        <img
                                                                src={item.food.image_path}
                                                                alt={item.food.name}
                                                                className="w-[50px] justify-self-center rounded"
                                                        />
                                                        <p className="text-left">{item.food.name}</p>
                                                        <p>${item.food.price}</p>
                                                        <p>{item.quantity}</p>
                                                        <p>${(item.food.price * item.quantity).toFixed(2)}</p>
                                                        <p
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="cursor-pointer text-destructive hover:text-destructive/80"
                                                        >
                                                                X
                                                        </p>
                                                </div>
                                                <Separator />
                                        </div>
                                ))}
                        </div>

                        {/* チェックアウトセクション */}
                        <div className="grid grid-cols-2 gap-10 mt-15 px-5 mobile:flex mobile:flex-col-reverse">
                                {/* Cart Totals */}
                                <div className="max-w-[400px] mobile:max-w-full">
                                        <h2 className="text-2xl font-semibold mb-8">Cart Totals</h2>

                                        <div className="flex justify-between py-4 text-foreground">
                                                <span>Subtotal</span>
                                                <span>${subtotal.toFixed(2)}</span>
                                        </div>
                                        <Separator />

                                        <div className="flex justify-between py-4 text-foreground">
                                                <span>Delivery Fee</span>
                                                <span>${deliveryFee === 0 ? 0 : deliveryFee}</span>
                                        </div>
                                        <Separator />

                                        <div className="flex justify-between py-4 text-foreground font-semibold">
                                                <span>Total</span>
                                                <span>${total === 0 ? 0 : total.toFixed(2)}</span>
                                        </div>

                                        <Button
                                                onClick={() => navigate('/checkout')}
                                                disabled={cartItems.length === 0}
                                                className="w-full mt-8"
                                                size="lg"
                                        >
                                                PROCEED TO CHECKOUT
                                        </Button>
                                </div>

                                {/* プロモコード */}
                                <div className="text-muted-foreground">
                                        <p>If you have a promo code, Enter it here</p>
                                        <div className="flex gap-2.5 mt-4 mobile:flex-col">
                                                <Input
                                                        type="text"
                                                        placeholder="promo code"
                                                        className="flex-1 mobile:w-full"
                                                />
                                                <Button variant="secondary" className="mobile:w-full">
                                                        Submit
                                                </Button>
                                        </div>
                                </div>
                        </div>
                </div>
        );
};
