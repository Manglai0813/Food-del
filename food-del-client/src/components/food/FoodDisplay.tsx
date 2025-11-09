import { type FoodWithCategory } from '@/types';
import { useCart } from '@/hooks';
import { FoodItem } from './FoodItem';

interface FoodDisplayProps {
    foods: FoodWithCategory[];
    loading?: boolean;
    error?: string | null;
    category?: string;
}

// 食品表示コンポーネント
export const FoodDisplay: React.FC<FoodDisplayProps> = ({
    foods,
    loading,
    error,
    category = 'All',
}) => {
    useCart(); // カートデータを監視（全FoodItem共通）
    // ローディング状態
    if (loading) {
        return (
            <div className="mt-8">
                <h2 className="text-[max(2vw,24px)] font-semibold">Loading dishes...</h2>
            </div>
        );
    }

    // エラー状態
    if (error) {
        return (
            <div className="mt-8">
                <h2 className="text-[max(2vw,24px)] font-semibold text-destructive">{error}</h2>
            </div>
        );
    }

    return (
        <div className="mt-8 mb-16">
            <h2 className="text-[max(2vw,24px)] font-semibold">Top dishes near you</h2>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] mt-8 gap-8 gap-y-12">
                {foods.map((food) => (
                    <FoodItem key={food.id} food={food} />
                ))}
            </div>

            {/* 商品がない場合 */}
            {foods.length === 0 && (
                <p className="text-center text-muted-foreground mt-8">
                    {category === 'All'
                        ? 'No dishes available.'
                        : `No ${category} dishes available.`}
                </p>
            )}
        </div>
    );
};
