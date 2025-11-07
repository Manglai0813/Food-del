/**
 * カテゴリ探索メニューコンポーネント
 */

import { categoryImages, getCategoryImage } from '@/assets';
import { Separator } from '@/components/ui/separator';

interface ExploreMenuProps {
        category: string;
        setCategory: (category: string) => void;
        categories?: Array<{ name: string }>;
}

// カテゴリ探索メニューコンポーネント
export const ExploreMenu: React.FC<ExploreMenuProps> = ({
        category,
        setCategory,
        categories,
}) => {
        // カテゴリリスト
        const categoryList = categories?.map((cat) => cat.name) || Object.keys(categoryImages);

        return (
                <div className="flex flex-col gap-5" id="explore-menu">
                        <h1 className="text-foreground font-medium text-2xl mobile:text-3xl">Explore our menu</h1>

                        <p className="w-full mobile:max-w-[80%] text-sm mobile:text-base text-muted-foreground">
                                Choose from a diverse menu featuring a delectable array of dishes. Our mission is to
                                satisfy your cravings and elevate your dining experience, one delicious meal at a time
                        </p>

                        {/* カテゴリリスト */}
                        <div className="flex justify-between items-center gap-8 text-center my-5 overflow-x-scroll scrollbar-hide py-2">
                                {categoryList.map((itemName) => (
                                        <div
                                                key={itemName}
                                                onClick={() => {
                                                        const newCategory = category === itemName ? 'All' : itemName;
                                                        setCategory(newCategory);
                                                }}
                                                className="cursor-pointer group flex-shrink-0 px-2"
                                        >
                                                <div className={`
              w-[7.5vw] min-w-[80px] rounded-full transition-all duration-200
              ${category === itemName ? 'ring-4 ring-primary ring-offset-2' : ''}
            `}>
                                                        <img
                                                                src={getCategoryImage(itemName)}
                                                                alt={itemName}
                                                                className={`
                  w-full rounded-full cursor-pointer transition-transform duration-200
                  ${category === itemName ? '' : 'hover:scale-110'}
                `}
                                                        />
                                                </div>
                                                <p className={`
              mt-2.5 text-base cursor-pointer transition-colors whitespace-nowrap
              ${category === itemName ? 'text-primary font-medium' : 'text-muted-foreground group-hover:text-foreground'}
            `}>
                                                        {itemName}
                                                </p>
                                        </div>
                                ))}
                        </div>

                        <Separator className="my-2.5" />
                </div>
        );
};
