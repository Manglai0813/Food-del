import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { productEntityConfig } from '../../configs/products';
import { useFood, useDeleteFood } from '@/api';
import { createImageUrl } from '@/lib/apiConstants';

// 商品詳細ページ
const FoodDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // 削除確認ダイアログの状態を管理
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    // 商品詳細情報を取得
    const { data: product, isLoading: loading, error: queryError } = useFood(id || '');

    // 商品削除の変更関数
    const deleteMutation = useDeleteFood();

    // エラーメッセージを集約
    const error = (queryError as Error)?.message || (deleteMutation.error as Error)?.message || null;

    // 削除確認ダイアログ設定を取得
    const deleteConfirmation = productEntityConfig.table.actions
        .find((a) => a.key === 'delete')?.confirmation;

    // 商品を削除しtoast通知を表示
    const handleDelete = async () => {
        if (!product) return;

        try {
            await deleteMutation.mutateAsync(product.id);
            setDeleteDialogOpen(false);
            toast.success('商品を削除しました');
            navigate('/foods');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : '商品の削除に失敗しました';
            toast.error(errorMessage);
        }
    };

    // ローディング中の表示
    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    // エラー発生時の表示
    if (error) {
        return (
            <div className="p-6">
                <div className="text-center">
                    <div className="text-red-600 mb-4">{error}</div>
                    <Button onClick={() => navigate('/foods')}>
                        商品一覧に戻る
                    </Button>
                </div>
            </div>
        );
    }

    // 商品が見つからない場合の表示
    if (!product) {
        return (
            <div className="p-6">
                <div className="text-center">商品が見つかりません</div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => navigate('/foods')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        商品一覧に戻る
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold">{product.name}</h1>
                        <p className="text-muted-foreground">商品詳細情報</p>
                    </div>
                </div>

                <div className="flex space-x-2">
                    <Button
                        variant="outline"
                        onClick={() => navigate(`/foods/${id}/edit`)}
                    >
                        <Edit className="w-4 h-4 mr-2" />
                        編集
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        削除
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <CardContent className="pt-6">
                        {product.image_path ? (
                            <img
                                src={createImageUrl(product.image_path)}
                                alt={product.name}
                                className="w-full h-64 object-cover rounded-lg"
                                onError={e => {
                                    e.currentTarget.style.display = 'none';
                                    const nextEl = e.currentTarget.nextElementSibling as HTMLElement;
                                    if (nextEl) nextEl.style.display = 'flex';
                                }}
                            />
                        ) : null}
                        <div
                            className={`w-full h-64 bg-muted rounded-lg flex items-center justify-center text-muted-foreground ${product.image_path ? 'hidden' : 'flex'}`}
                        >
                            画像なし
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                        <CardDescription>商品の基本的な情報</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-muted-foreground">商品名</label>
                            <p className="text-lg font-medium">{product.name}</p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">価格</label>
                            <p className="text-2xl font-bold text-primary">
                                ¥{new Intl.NumberFormat('ja-JP').format(product.price)}
                            </p>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-muted-foreground">カテゴリ</label>
                            <Badge variant="outline" className="ml-2">{product.category.name}</Badge>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3">
                    <CardHeader>
                        <CardTitle>商品説明</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {product.description || '商品説明が登録されていません'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <Card className="w-96 shadow-lg">
                        <CardHeader className="pb-4">
                            <CardTitle>{deleteConfirmation?.title || '削除確認'}</CardTitle>
                            <CardDescription className="mt-2">
                                {deleteConfirmation?.message || 'この商品を削除しますか？'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-3 justify-end pt-0">
                            <Button
                                variant="outline"
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteConfirmation?.cancelText || 'キャンセル'}
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleteMutation.isPending}
                            >
                                {deleteMutation.isPending ? '削除中...' : (deleteConfirmation?.confirmText || '削除')}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default FoodDetailPage;