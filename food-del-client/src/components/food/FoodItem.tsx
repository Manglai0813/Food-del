import { type Food } from '@/types';
import { assets } from '@/assets';
import { useCartOperations } from '@/hooks';
import { useCartStore } from '@/stores';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Plus, Minus } from 'lucide-react';

interface FoodItemProps {
    food: Food;
}

// 食品アイテムコンポーネント
export const FoodItem: React.FC<FoodItemProps> = ({ food }) => {
    const { addItem, updateItem, removeItem } = useCartOperations();
    const cartData = useCartStore((state) => state.cartData);
    // カート内のこの商品の数量を取得
    const cartItem = cartData?.cart_items.find((item) => item.food_id === food.id);
    const quantity = cartItem?.quantity || 0;

    // 加算処理
    const handleAdd = async () => {
        try {
            if (quantity === 0) {
                // カートに新規追加
                await addItem({ food_id: food.id, quantity: 1 });
            } else if (cartItem) {
                // 既存アイテムの数量更新
                await updateItem({ itemId: cartItem.id, data: { quantity: quantity + 1 } });
            }
        } catch (error) {
            console.error('商品追加エラー:', error);
        }
    };

    // 減算処理
    const handleRemove = async () => {
        if (!cartItem) return;

        try {
            if (quantity === 1) {
                // 数量1の場合は削除
                await removeItem(cartItem.id);
            } else {
                // 数量を減らす
                await updateItem({ itemId: cartItem.id, data: { quantity: quantity - 1 } });
            }
        } catch (error) {
            console.error('商品削除エラー:', error);
        }
    };

    // 画像URLを構築
    const imageUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/files${food.image_path}`;

    return (
        <TooltipProvider>
            <Card className="overflow-hidden transition-all duration-200 hover:shadow-lg group">
                <div className="relative">
                    <img
                        src={imageUrl}
                        alt={food.name}
                        className="w-full aspect-[4/3] object-cover"
                    />
                </div>

                <CardContent className="p-4 space-y-3">
                    <div className="space-y-2">
                        <h3 className="text-base font-semibold leading-tight">{food.name}</h3>

                        <img src={assets.rating_starts} alt="評価" className="w-16" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <p className="text-muted-foreground text-sm line-clamp-2 cursor-help">
                                    {food.description}
                                </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                                <p className="text-sm">{food.description}</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                        <span className="text-2xl font-bold text-primary">${food.price}</span>
                        {quantity === 0 ? (
                            <Button
                                size="icon"
                                onClick={handleAdd}
                                className="rounded-full h-9 w-9"
                            >
                                <Plus className="h-5 w-5" />
                            </Button>
                        ) : (
                            <div className="flex items-center gap-2 bg-secondary rounded-full px-2 py-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleRemove}
                                    className="h-7 w-7 rounded-full hover:bg-background"
                                >
                                    <Minus className="h-4 w-4" />
                                </Button>
                                <span className="font-medium text-sm min-w-[20px] text-center text-foreground">{quantity}</span>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleAdd}
                                    className="h-7 w-7 rounded-full hover:bg-background"
                                >
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </TooltipProvider>
    );
};