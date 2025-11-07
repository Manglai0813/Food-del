/**
 * フッターコンポーネント
 */

import { assets } from '@/assets';
import { Separator } from '@/components/ui/separator';

export const FooterNew: React.FC = () => {
        return (
                <div className="bg-muted/50 flex flex-col items-center gap-5 pt-12 mobile:pt-20 pb-5 px-5 mobile:px-[8vw] rounded-t-3xl" id="footer">
                        {/* フッターコンテンツ */}
                        <div className="w-full flex flex-col gap-8 mobile:grid mobile:grid-cols-[2fr_1fr_1fr] mobile:gap-20">
                                {/* 左側：ロゴと説明 */}
                                <div className="flex flex-col items-start gap-4">
                                        <img src={assets.logo} alt="Logo" className="w-32 mobile:w-40" />
                                        <p className="text-muted-foreground text-sm mobile:text-base">
                                                Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum
                                                has been the industry's standard dummy text ever since the 1500s, when an unknown
                                                printer took a galley of type and scrambled it to make a type specimen book.
                                        </p>
                                        <div className="flex gap-3 mobile:gap-4">
                                                <img src={assets.facebook_icon} alt="Facebook" className="w-8 mobile:w-10 cursor-pointer hover:scale-110 transition-transform" />
                                                <img src={assets.twitter_icon} alt="Twitter" className="w-8 mobile:w-10 cursor-pointer hover:scale-110 transition-transform" />
                                                <img src={assets.linkedin_icon} alt="LinkedIn" className="w-8 mobile:w-10 cursor-pointer hover:scale-110 transition-transform" />
                                        </div>
                                </div>

                                {/* 中央：会社情報 */}
                                <div className="flex flex-col items-start gap-3 mobile:gap-5">
                                        <h2 className="text-foreground text-lg mobile:text-xl font-semibold">COMPANY</h2>
                                        <ul className="list-none">
                                                <li className="mb-2 text-sm mobile:text-base text-foreground cursor-pointer hover:text-primary transition-colors">Home</li>
                                                <li className="mb-2 text-sm mobile:text-base text-foreground cursor-pointer hover:text-primary transition-colors">About us</li>
                                                <li className="mb-2 text-sm mobile:text-base text-foreground cursor-pointer hover:text-primary transition-colors">Delivery</li>
                                                <li className="mb-2 text-sm mobile:text-base text-foreground cursor-pointer hover:text-primary transition-colors">Privacy policy</li>
                                        </ul>
                                </div>

                                {/* 右側：連絡先 */}
                                <div className="flex flex-col items-start gap-3 mobile:gap-5">
                                        <h2 className="text-foreground text-lg mobile:text-xl font-semibold">GET IN TOUCH</h2>
                                        <ul className="list-none">
                                                <li className="mb-2 text-sm mobile:text-base text-foreground">+1 (555) 123-4567</li>
                                                <li className="mb-2 text-sm mobile:text-base text-foreground">contact@fooddelivery.com</li>
                                        </ul>
                                </div>
                        </div>

                        {/* 区切り線 */}
                        <Separator className="my-3 mobile:my-5" />

                        {/* コピーライト */}
                        <p className="text-center text-xs mobile:text-sm text-muted-foreground">
                                Copyright 2025 © FoodDelivery.com - All Right Reserved.
                        </p>
                </div>
        );
};
