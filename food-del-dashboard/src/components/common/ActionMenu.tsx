import React, { useState } from 'react';
import { MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ActionConfig } from '../../types/crud-config';

// アクションメニューのプロパティ定義
interface ActionMenuProps {
    actions: ActionConfig[];
    row: Record<string, unknown>;
    onAction?: (action: string, row: Record<string, unknown>) => void;
}

// アクションメニューコンポーネント
export const ActionMenu: React.FC<ActionMenuProps> = ({ actions, row, onAction }) => {
    const [confirmDialog, setConfirmDialog] = useState<{ action: ActionConfig | null; open: boolean }>({
        action: null,
        open: false,
    });

    // 表示条件をチェックしてフィルタリング
    const visibleActions = actions.filter(action =>
        !action.condition || action.condition(row)
    );

    if (visibleActions.length === 0) return null;

    // アクションクリックハンドラー
    const handleActionClick = (action: ActionConfig) => {
        if (action.confirmation) {
            // 確認ダイアログが必要な場合
            setConfirmDialog({ action, open: true });
        } else {
            // 確認不要な場合は直接実行
            onAction?.(action.key, row);
        }
    };

    // 確認ダイアログの確認ボタンクリックハンドラー
    const handleConfirm = () => {
        if (confirmDialog.action) {
            onAction?.(confirmDialog.action.key, row);
            setConfirmDialog({ action: null, open: false });
        }
    };

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal size={16} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    {visibleActions.map((action) => (
                        <DropdownMenuItem
                            key={action.key}
                            onClick={() => handleActionClick(action)}
                            className={
                                action.variant === 'danger' ? 'text-destructive focus:text-destructive' : ''
                            }
                        >
                            {action.icon && <span className="mr-2">{action.icon}</span>}
                            {action.label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            {confirmDialog.open && confirmDialog.action?.confirmation && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-96 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle>{confirmDialog.action.confirmation.title || '確認'}</CardTitle>
                            <CardDescription className="mt-2">
                                {confirmDialog.action.confirmation.message}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-3 justify-end pt-0">
                            <Button
                                variant="outline"
                                onClick={() => setConfirmDialog({ action: null, open: false })}
                            >
                                {confirmDialog.action.confirmation.cancelText || 'キャンセル'}
                            </Button>
                            <Button
                                variant={confirmDialog.action.variant === 'danger' ? 'destructive' : 'default'}
                                onClick={handleConfirm}
                            >
                                {confirmDialog.action.confirmation.confirmText || '確認'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </>
    );
};