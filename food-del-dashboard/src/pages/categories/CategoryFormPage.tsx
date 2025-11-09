import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCategory, useCreateCategory, useUpdateCategory } from '@/api';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

// カテゴリ作成・編集フォームページコンポーネント
const CategoryFormPage = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    // フォーム入力を管理
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState(true);

    // 編集モード時にカテゴリ詳細を取得
    const { data: category, isLoading: categoryLoading } = useCategory(id!);

    // カテゴリの作成を管理
    const createMutation = useCreateCategory();

    // カテゴリの更新を管理
    const updateMutation = useUpdateCategory();

    // 編集モード時にカテゴリデータをフォームに読み込み
    useEffect(() => {
        if (category) {
            setName(category.name);
            setDescription(category.description || '');
            setStatus(category.status);
        }
    }, [category]);

    // フォーム送信を処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({
                    categoryId: parseInt(id),
                    data: {
                        name,
                        description: description || undefined,
                        status,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    name,
                    description: description || undefined,
                    status,
                });
            }

            navigate('/categories');
        } catch (error) {
            console.error('カテゴリ保存エラー:', error);
        }
    };

    // カテゴリの作成と更新が進行中かどうかを管理
    const isPending = createMutation.isPending || updateMutation.isPending;

    // 編集モードでカテゴリが読み込み中の場合
    if (isEditMode && categoryLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">読み込み中...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate('/categories')}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">
                        {isEditMode ? 'カテゴリ編集' : 'カテゴリ新規作成'}
                    </h1>
                    <p className="text-muted-foreground">
                        {isEditMode ? 'カテゴリ情報を編集します' : '新しいカテゴリを作成します'}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                        <CardDescription>カテゴリの名称と説明を設定します</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">
                                カテゴリ名 <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                placeholder="例: Pizza"
                                required
                                disabled={isPending}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">説明</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                placeholder="カテゴリの説明を入力してください"
                                disabled={isPending}
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">ステータス</Label>
                            <select
                                id="status"
                                value={status ? 'enabled' : 'disabled'}
                                onChange={e => setStatus(e.target.value === 'enabled')}
                                disabled={isPending}
                                className="w-full px-3 py-2 border rounded-md bg-white"
                            >
                                <option value="enabled">有効</option>
                                <option value="disabled">無効</option>
                            </select>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <Button type="submit" disabled={isPending || !name.trim()}>
                                {isPending ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                        保存中...
                                    </>
                                ) : isEditMode ? (
                                    '更新'
                                ) : (
                                    '作成'
                                )}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate('/categories')}
                                disabled={isPending}
                            >
                                キャンセル
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </div>
    );
};

export default CategoryFormPage;