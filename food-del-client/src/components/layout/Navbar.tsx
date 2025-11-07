/**
 * ナビゲーションバーコンポーネント
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineSearch, HiOutlineShoppingCart } from 'react-icons/hi';
import { assets } from '@/assets';
import { useAuth } from '@/hooks';
import { useCartStore } from '@/stores';
import { Button } from '@/components/ui/button';
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MobileMenu } from './MobileMenu';

interface NavbarProps {
        setShowLogin: (show: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ setShowLogin }) => {
        const [activeMenu, setActiveMenu] = useState<string>('home');
        const navigate = useNavigate();

        // 認証状態
        const { user, logout } = useAuth();

        // カート情報
        const cartData = useCartStore((state) => state.cartData);
        const totalAmount = cartData?.summary?.totalAmount || 0;

        // ログアウト処理
        const handleLogout = async () => {
                try {
                        await logout();
                        navigate('/');
                } catch (error) {
                        console.error('ログアウトエラー:', error);
                }
        };

        return (
                <div className="py-5 flex justify-between items-center">
                        {/* 左側：モバイルメニュー + ロゴ */}
                        <div className="flex items-center gap-3">
                                {/* モバイルメニュー（小画面のみ表示） */}
                                <MobileMenu setShowLogin={setShowLogin} />

                                {/* ロゴ */}
                                <Link to="/">
                                        <img
                                                src={assets.logo}
                                                alt="Logo"
                                                className="w-[100px] mobile:w-[150px] desktop:w-[140px] tablet:w-[120px]"
                                        />
                                </Link>
                        </div>

                        {/* ナビゲーションメニュー（大画面のみ表示） */}
                        <nav className="hidden mobile:flex items-center gap-6">
                                <Link
                                        to="/"
                                        onClick={() => setActiveMenu('home')}
                                        className={`
            text-lg font-medium transition-colors hover:text-primary cursor-pointer
            ${activeMenu === 'home' ? 'text-primary' : 'text-muted-foreground'}
          `}
                                >
                                        Home
                                </Link>
                                <a
                                        href="#explore-menu"
                                        onClick={() => setActiveMenu('menu')}
                                        className={`
            text-lg font-medium transition-colors hover:text-primary cursor-pointer
            ${activeMenu === 'menu' ? 'text-primary' : 'text-muted-foreground'}
          `}
                                >
                                        Menu
                                </a>
                                <a
                                        href="#food-display"
                                        onClick={() => setActiveMenu('food-list')}
                                        className={`
            text-lg font-medium transition-colors hover:text-primary cursor-pointer
            ${activeMenu === 'food-list' ? 'text-primary' : 'text-muted-foreground'}
          `}
                                >
                                        Food List
                                </a>
                                <a
                                        href="#footer"
                                        onClick={() => setActiveMenu('contact-us')}
                                        className={`
            text-lg font-medium transition-colors hover:text-primary cursor-pointer
            ${activeMenu === 'contact-us' ? 'text-primary' : 'text-muted-foreground'}
          `}
                                >
                                        Contact Us
                                </a>
                        </nav>

                        {/* 右側メニュー */}
                        <div className="flex items-center gap-5 mobile:gap-10 desktop:gap-8 tablet:gap-5">
                                {/* 検索アイコン */}
                                <button className="text-foreground hover:text-primary transition-colors">
                                        <HiOutlineSearch className="w-6 h-6 mobile:w-7 mobile:h-7" />
                                </button>

                                {/* カートアイコン（大画面のみ表示） */}
                                <div className="relative hidden mobile:block">
                                        <Link to="/cart" className="text-foreground hover:text-primary transition-colors">
                                                <HiOutlineShoppingCart className="w-7 h-7" />
                                        </Link>
                                        {totalAmount > 0 && (
                                                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full z-10" />
                                        )}
                                </div>

                                {/* ログイン/プロフィール（大画面のみ表示） */}
                                {!user ? (
                                        <Button
                                                variant="outline"
                                                onClick={() => setShowLogin(true)}
                                                className="hidden mobile:flex rounded-full border-primary hover:bg-primary/10 px-8 h-10 text-base"
                                        >
                                                Sign in
                                        </Button>
                                ) : (
                                        <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                        <button className="hidden mobile:block cursor-pointer focus:outline-none">
                                                                <img src={assets.profile_icon} alt="Profile" />
                                                        </button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem
                                                                onClick={() => navigate('/my-orders')}
                                                                className="cursor-pointer"
                                                        >
                                                                <img src={assets.bag_icon} alt="Orders" className="w-5 mr-2" />
                                                                <span>Orders</span>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                                onClick={handleLogout}
                                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                        >
                                                                <img src={assets.logout_icon} alt="Logout" className="w-5 mr-2" />
                                                                <span>Logout</span>
                                                        </DropdownMenuItem>
                                                </DropdownMenuContent>
                                        </DropdownMenu>
                                )}
                        </div>
                </div>
        );
};
