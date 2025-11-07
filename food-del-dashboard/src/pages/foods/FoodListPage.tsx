import React from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { DataTable } from '@/components/common';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { productEntityConfig } from '../../configs/products';
import { useProducts } from '@/hooks';

/**
 * 商品一覧ページコンポーネント
 * DataTableを使用した設定駆動の一覧表示
 */
const FoodListPage = () => {
        const navigate = useNavigate();
        const [globalFilter, setGlobalFilter] = React.useState('');
        const [page, setPage] = React.useState(1);
        const [pageSize, setPageSize] = React.useState(10);

        // ページネーションと検索条件をuseMemoでメモ化
        const query = React.useMemo(() => ({
                page,
                limit: pageSize,
                search: globalFilter || undefined,
        }), [page, pageSize, globalFilter]);

        const { products, pagination: paginationData, loading, error, deleteProduct } = useProducts(query);

        // ページネーションデータをデフォルト値で安全にアクセス
        const pagination = paginationData || {
                page: 1,
                limit: 10,
                total: 0,
                totalPages: 0,
                hasNext: false,
                hasPrev: false,
        };

        // テーブル行のアクション処理
        const handleAction = async (action: string, row: Record<string, unknown>) => {
                switch (action) {
                        case 'view':
                                navigate(`/foods/${row.id}`);
                                break;
                        case 'edit':
                                navigate(`/foods/${row.id}/edit`);
                                break;
                        case 'delete':
                                // ActionMenuコンポーネントで削除確認ダイアログを処理
                                try {
                                        await deleteProduct(row.id);
                                        toast.success('商品を削除しました');
                                } catch (error) {
                                        const errorMessage = error instanceof Error ? error.message : '商品の削除に失敗しました';
                                        toast.error(errorMessage);
                                }
                                break;
                        default:
                                break;
                }
        };

        // エラーが発生した場合にエラー画面を表示
        if (error) {
                return (
                        <div className="p-6">
                                <div className="text-center text-red-600">
                                        <p className="mb-4">エラー: {error}</p>
                                        <Button onClick={() => window.location.reload()}>
                                                ページを再読み込み
                                        </Button>
                                </div>
                        </div>
                );
        }

        return (
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                        {/* ヘッダーセクションはモバイル時縦配置 */}
                        <div className="flex flex-col gap-4 md:gap-6 md:flex-row md:justify-between md:items-center">
                                <div>
                                        <h1 className="text-xl md:text-2xl font-bold">{productEntityConfig.displayName}</h1>
                                        <p className="text-sm md:text-base text-muted-foreground">{productEntityConfig.description}</p>
                                </div>
                                {/* アクション領域はモバイル時縦配置 */}
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                                        <div className="relative order-2 sm:order-1">
                                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                                                <Input
                                                        placeholder="検索..."
                                                        value={globalFilter}
                                                        onChange={(e) => setGlobalFilter(e.target.value)}
                                                        className="pl-9 w-full sm:w-48 md:w-64"
                                                />
                                        </div>
                                        <Button onClick={() => navigate('/foods/new')} className="order-1 sm:order-2 w-full sm:w-auto">
                                                <Plus className="mr-2 h-4 w-4" />
                                                <span className="hidden sm:inline">新規作成</span>
                                                <span className="sm:hidden">追加</span>
                                        </Button>
                                </div>
                        </div>

                        {/* DataTableコンポーネントで商品一覧を表示 */}
                        <DataTable
                                config={productEntityConfig}
                                data={products}
                                loading={loading}
                                pagination={{
                                        current: pagination.page,
                                        pageSize: pagination.limit,
                                        total: pagination.total,
                                        totalPages: pagination.totalPages,
                                        hasNext: pagination.hasNext,
                                        hasPrev: pagination.hasPrev,
                                        onPageChange: (newPage: number) => setPage(newPage),
                                        onPageSizeChange: (newSize: number) => {
                                                setPageSize(newSize);
                                                setPage(1);
                                        },
                                }}
                                onAction={handleAction}
                                onSelectionChange={() => {
                                        // TODO: 複数行選択時の処理
                                }}
                        />

                </div>
        );
};

export default FoodListPage;