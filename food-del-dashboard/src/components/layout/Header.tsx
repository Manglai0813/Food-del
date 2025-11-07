import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
        DropdownMenu,
        DropdownMenuContent,
        DropdownMenuItem,
        DropdownMenuLabel,
        DropdownMenuSeparator,
        DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Menu, Bell, User, LogOut, PanelLeftClose, PanelLeft } from 'lucide-react';
import { useAuth } from '@/hooks';

// Propsの型定義
interface HeaderProps {
        onToggleSidebar: () => void;
        onToggleCollapse: () => void;
        collapsed: boolean;
}

/**
 * ヘッダーコンポーネント
 * shadcn/ui Button, Avatar, DropdownMenu を使用
 */
const Header: React.FC<HeaderProps> = ({ onToggleSidebar, onToggleCollapse, collapsed }) => {
        const { user, logout } = useAuth();

        return (
                <header className={`fixed top-0 right-0 bg-card shadow-sm border-b border-border h-16 flex items-center justify-between px-6 z-50 left-0 lg:${collapsed ? 'left-16' : 'left-64'
                        }`}>
                        <div className="flex items-center">
                                <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onToggleCollapse}
                                        className="hidden lg:flex mr-2"
                                        title={collapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
                                >
                                        {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
                                </Button>
                                <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={onToggleSidebar}
                                        className="lg:hidden"
                                >
                                        <Menu size={20} />
                                </Button>
                                <h2 className="ml-4 text-lg font-semibold text-card-foreground hidden sm:block">
                                        管理ダッシュボード
                                </h2>
                        </div>

                        <div className="flex items-center space-x-4">
                                <Button
                                        variant="ghost"
                                        size="sm"
                                        className="relative"
                                >
                                        <Bell size={20} />
                                </Button>
                                <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                                <Button
                                                        variant="ghost"
                                                        className="flex items-center space-x-2 h-auto px-2 py-1"
                                                >
                                                        <Avatar className="h-8 w-8">
                                                                <AvatarImage src={undefined} alt={user?.name} />
                                                                <AvatarFallback className="bg-primary text-primary-foreground">
                                                                        <User size={16} />
                                                                </AvatarFallback>
                                                        </Avatar>
                                                        <span className="hidden sm:block font-medium text-card-foreground">
                                                                {user?.name}
                                                        </span>
                                                </Button>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent className="w-56" align="end">
                                                <DropdownMenuLabel>
                                                        <div className="flex flex-col space-y-1">
                                                                <p className="text-sm font-medium">{user?.name}</p>
                                                                <p className="text-xs text-muted-foreground">{user?.email}</p>
                                                        </div>
                                                </DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-destructive" onClick={logout}>
                                                        <LogOut className="mr-2 h-4 w-4" />
                                                        <span>ログアウト</span>
                                                </DropdownMenuItem>
                                        </DropdownMenuContent>
                                </DropdownMenu>
                        </div>
                </header>
        );
};

export default Header;