import { assets } from '@/assets';
import { Button } from '@/components/ui/button';

// ヒーローバナーコンポーネント
export const HeroBanner: React.FC = () => {
    const scrollToMenu = () => {
        document.getElementById('explore-menu')?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div
            className="h-[34vw] my-8 w-full bg-no-repeat bg-cover bg-center relative animate-fadeIn rounded-2xl shadow-md overflow-hidden"
            style={{ backgroundImage: `url(${assets.header_img})` }}
        >
            <div className="absolute flex flex-col items-start gap-[1.5vw] max-w-[50%] bottom-[10%] left-[6vw] animate-[fadeIn_3s] max-[1050px]:max-w-[45%] max-[750px]:max-w-[65%]">
                <h2 className="font-medium text-white text-[max(4.5vw,22px)]">
                    Order your favorite food here
                </h2>

                <p className="text-white text-[1vw] max-[750px]:hidden">
                    Choose from a diverse menu featuring a delectable array of dishes crafted with the
                    finest ingredients and culinary expertise. Our mission is to satisfy your cravings and
                    elevate your dining experience, one delicious meal at a time.
                </p>

                <Button
                    onClick={scrollToMenu}
                    variant="secondary"
                    size="lg"
                    className="rounded-full px-8 text-base font-medium"
                >
                    View Menu
                </Button>
            </div>
        </div>
    );
};