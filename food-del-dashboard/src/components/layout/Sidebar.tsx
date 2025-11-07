import React from 'react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
        LayoutDashboard,
        UtensilsCrossed,
        Tags,
        ShoppingCart,
        Users,
        X
} from 'lucide-react';

// Sidebarコンポーネントのプロパティ型定義
interface SidebarProps {
        isOpen: boolean;
        onClose: () => void;
        collapsed?: boolean;
}

// ナビゲーションアイテムの型定義
interface NavItem {
        label: string;
        path: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
        badge?: number;
}

// ナビゲーションアイテムのリスト
const navItems: NavItem[] = [
        { label: 'ダッシュボード', path: '/', icon: LayoutDashboard },
        { label: '商品管理', path: '/foods', icon: UtensilsCrossed },
        { label: 'カテゴリー', path: '/categories', icon: Tags },
        { label: '注文管理', path: '/orders', icon: ShoppingCart },
        { label: 'ユーザー管理', path: '/users', icon: Users },
];

/**
 * サイドバーナビゲーションコンポーネント
 * レスポンシブデザイン対応で折りたたみ機能付き
 */
const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed = false }) => {
        return (
                <div className={cn(
                        "fixed inset-y-0 left-0 z-30 bg-card shadow-lg transform transition-all duration-300",
                        collapsed ? 'w-16' : 'w-64',
                        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}>
                        <div className={cn(
                                "flex items-center justify-between border-b border-border h-16",
                                collapsed ? "px-4" : "px-6"
                        )}>
                                <div className="flex items-center w-full">
                                        <span className="text-xl">🍕</span>
                                        <span className={cn(
                                                "ml-2 text-xl font-bold text-card-foreground transition-all duration-500 overflow-hidden whitespace-nowrap",
                                                collapsed
                                                        ? 'max-w-0 opacity-0 translate-x-2'
                                                        : 'max-w-32 opacity-100 translate-x-0'
                                        )}>
                                                Food Del
                                        </span>
                                </div>
                                <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onClose}
                                        className="lg:hidden"
                                >
                                        <X size={20} />
                                </Button>
                        </div>

                        <nav className="mt-6">
                                <ul className={cn("space-y-2", collapsed ? "px-2" : "px-4")}>
                                        {navItems.map((item) => (
                                                <li key={item.path}>
                                                        <NavLink
                                                                to={item.path}
                                                                className={({ isActive }) =>
                                                                        cn(
                                                                                "flex w-full rounded-lg text-left transition-colors",
                                                                                collapsed ? 'items-center justify-center h-12 w-12 mx-auto p-0' : 'items-center justify-between px-4 py-3',
                                                                                isActive
                                                                                        ? 'bg-primary text-primary-foreground'
                                                                                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                                                        )
                                                                }
                                                                onClick={() => window.innerWidth < 1024 && onClose()}
                                                                title={collapsed ? item.label : undefined}
                                                        >
                                                                {collapsed ? (
                                                                        <item.icon size={20} />
                                                                ) : (
                                                                        <>
                                                                                <div className="flex items-center">
                                                                                        <item.icon size={20} className="mr-3" />
                                                                                        <span className="font-medium transition-all duration-500 overflow-hidden whitespace-nowrap max-w-32 opacity-100 translate-x-0">
                                                                                                {item.label}
                                                                                        </span>
                                                                                </div>
                                                                                {item.badge && (
                                                                                        <Badge
                                                                                                variant="secondary"
                                                                                                className="ml-auto transition-all duration-500 overflow-hidden max-w-8 opacity-100 scale-100"
                                                                                        >
                                                                                                {item.badge}
                                                                                        </Badge>
                                                                                )}
                                                                        </>
                                                                )}
                                                        </NavLink>
                                                </li>
                                        ))}
                                </ul>
                        </nav>
                </div>
        );
};

export default Sidebar;