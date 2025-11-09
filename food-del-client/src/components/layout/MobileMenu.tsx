import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiMenu, HiHome, HiShoppingCart, HiLogout } from 'react-icons/hi';
import { MdRestaurantMenu, MdContactMail } from 'react-icons/md';
import { FaClipboardList } from 'react-icons/fa';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks';
import { useCartStore } from '@/stores';

interface MobileMenuProps {
    setShowLogin: (show: boolean) => void;
}

// モバイルメニューコンポーネント
export const MobileMenu: React.FC<MobileMenuProps> = ({ setShowLogin }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const cartData = useCartStore((state) => state.cartData);

    // カート内の商品総数
    const totalItems = cartData?.summary?.totalItems || 0;

    // ログアウト処理
    const handleLogout = async () => {
        try {
            await logout();
            setOpen(false);
            navigate('/');
        } catch (error) {
            console.error('ログアウトエラー:', error);
        }
    };

    // メニュー項目クリック時
    const handleMenuClick = (href: string) => {
        setOpen(false);
        if (href.startsWith('#')) {
            // アンカーリンク
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            navigate(href);
        }
    };

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="mobile:hidden"
                    aria-label="メニューを開く"
                >
                    <HiMenu className="h-6 w-6" />
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[280px] sm:w-[320px]">
                <SheetHeader>
                    <SheetTitle className="text-left">Menu</SheetTitle>
                    <SheetDescription className="text-left">
                        Navigate to different sections and manage your account
                    </SheetDescription>
                </SheetHeader>

                <div className="flex flex-col gap-4 mt-6">
                    {/* ナビゲーションメニュー */}
                    <nav className="flex flex-col gap-2">
                        <MenuItem
                            icon={<HiHome className="h-5 w-5" />}
                            label="Home"
                            onClick={() => handleMenuClick('/')}
                        />
                        <MenuItem
                            icon={<MdRestaurantMenu className="h-5 w-5" />}
                            label="Menu"
                            onClick={() => handleMenuClick('#explore-menu')}
                        />
                        <MenuItem
                            icon={<HiShoppingCart className="h-5 w-5" />}
                            label="Cart"
                            badge={totalItems > 0 ? totalItems : undefined}
                            onClick={() => handleMenuClick('/cart')}
                        />
                        <MenuItem
                            icon={<MdContactMail className="h-5 w-5" />}
                            label="Contact Us"
                            onClick={() => handleMenuClick('#footer')}
                        />
                    </nav>

                    <Separator />

                    {user ? (
                        <div className="flex flex-col gap-2">
                            <div className="px-3 py-2 bg-secondary rounded-lg">
                                <p className="text-sm font-medium">{user.name || user.email}</p>
                                <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>

                            <MenuItem
                                icon={<FaClipboardList className="h-5 w-5" />}
                                label="My Orders"
                                onClick={() => handleMenuClick('/my-orders')}
                            />

                            <MenuItem
                                icon={<HiLogout className="h-5 w-5" />}
                                label="Logout"
                                variant="destructive"
                                onClick={handleLogout}
                            />
                        </div>
                    ) : (
                        <Button
                            onClick={() => {
                                setOpen(false);
                                setShowLogin(true);
                            }}
                            className="w-full"
                        >
                            Sign in
                        </Button>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
};

// メニューアイテムコンポーネント
interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    badge?: number;
    variant?: 'default' | 'destructive';
    onClick: () => void;
}

// メニューアイテムコンポーネント
const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    label,
    badge,
    variant = 'default',
    onClick,
}) => {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg
        transition-colors text-left w-full
        ${variant === 'destructive'
                    ? 'hover:bg-destructive/10 text-destructive'
                    : 'hover:bg-secondary'
                }
      `}
        >
            <span className={variant === 'destructive' ? 'text-destructive' : 'text-foreground'}>
                {icon}
            </span>
            <span className="flex-1 font-medium">{label}</span>
            {badge !== undefined && (
                <Badge variant="default" className="ml-auto">
                    {badge}
                </Badge>
            )}
        </button>
    );
};