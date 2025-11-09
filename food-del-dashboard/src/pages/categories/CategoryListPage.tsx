import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useCategories, useDeleteCategory } from '@/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { RefreshCw, Plus, Edit, Trash2 } from 'lucide-react';

// カテゴリ一覧ページコンポーネント
const CategoryListPage = () => {
    const navigate = useNavigate();
    
    // 削除確認モーダルの状態を管理
    const [deleteConfirm, setDeleteConfirm] = useState<{ categoryId: number; name: string } | null>(null);

    // 商品数を含めてカテゴリ一覧を取得
    const { data: categories, isLoading, error, refetch } = useCategories({
        include_count: true,
    });

    // カテゴリ削除の変更関数
    const deleteMutation = useDeleteCategory();

    // 日時をフォーマット
    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // カテゴリ一覧を更新しtoast通知を表示
    const handleRefresh = () => {
        refetch();
        toast.success('カテゴリ一覧を更新しました');
    };

    // カテゴリを削除しtoast通知を表示
    const handleDelete = async () => {
        if (!deleteConfirm) return;

        try {
            await deleteMutation.mutateAsync(deleteConfirm.categoryId);
            setDeleteConfirm(null);
            toast.success('カテゴリを削除しました');
        } catch (error) {
            // サーバーからのエラーメッセージを優先して表示
            const errorMessage = error instanceof Error ? error.message : 'カテゴリの削除に失敗しました';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="space-y-4 md:space-y-6 p-4 md:p-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-xl md:text-3xl font-bold">カテゴリ管理</h1>
                    <p className="text-sm md:text-base text-muted-foreground">商品カテゴリの管理</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                    <Button
                        onClick={handleRefresh}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        更新
                    </Button>
                    <Button onClick={() => navigate('/categories/new')} size="sm" className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">新規作成</span>
                        <span className="sm:hidden">追加</span>
                    </Button>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>カテゴリ一覧</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">読み込み中...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-destructive font-medium">エラーが発生しました</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                {error instanceof Error ? error.message : '不明なエラー'}
                            </p>
                            <Button onClick={handleRefresh} variant="outline" className="mt-4">
                                再試行
                            </Button>
                        </div>
                    ) : !categories || categories.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-muted-foreground">カテゴリがありません</p>
                            <Button
                                onClick={() => navigate('/categories/new')}
                                variant="outline"
                                className="mt-4"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                最初のカテゴリを作成
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>ID</TableHead>
                                        <TableHead>カテゴリ名</TableHead>
                                        <TableHead>説明</TableHead>
                                        <TableHead>商品数</TableHead>
                                        <TableHead>ステータス</TableHead>
                                        <TableHead>作成日時</TableHead>
                                        <TableHead>更新日時</TableHead>
                                        <TableHead className="text-right">アクション</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {categories.map((category) => (
                                        <TableRow key={category.id}>
                                            <TableCell className="font-medium">#{category.id}</TableCell>
                                            <TableCell className="font-medium">{category.name}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {category.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {('_count' in category && category._count?.foods) ? `${category._count.foods}品` : '0品'}
                                            </TableCell>
                                            <TableCell>
                                                <span className={category.status ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                                                    {category.status ? '有効' : '無効'}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-sm">{formatDateTime(String(category.created_at))}</TableCell>
                                            <TableCell className="text-sm">{formatDateTime(String(category.updated_at))}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => navigate(`/categories/${category.id}/edit`)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-1" />
                                                        編集
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-destructive hover:text-destructive"
                                                        onClick={() => setDeleteConfirm({ categoryId: category.id, name: category.name })}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-1" />
                                                        削除
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-96 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle>カテゴリ削除確認</CardTitle>
                            <CardDescription className="mt-2">
                                「{deleteConfirm.name}」を削除しますか？この操作は取り消せません。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-3 justify-end pt-0">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleteMutation.isPending}
                            >
                                キャンセル
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? '削除中...' : '削除'}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default CategoryListPage;