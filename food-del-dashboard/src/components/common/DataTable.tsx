import React, { useMemo, useState } from 'react';
import {
        useReactTable,
        getCoreRowModel,
        getSortedRowModel,
        getFilteredRowModel,
        getPaginationRowModel,
        type ColumnDef,
        flexRender,
        type SortingState,
        type ColumnFiltersState,
        type VisibilityState,
        type RowSelectionState,
} from '@tanstack/react-table';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { ActionMenu } from './ActionMenu';
import type { EntityConfig } from '../../types/crud-config';

// DataTable コンポーネントのプロパティ型定義
interface DataTableProps<T> {
        config: EntityConfig;
        data: T[];
        loading?: boolean;
        onAction?: (action: string, row: T | T[]) => void;
        onSelectionChange?: (selectedRows: T[]) => void;
        pagination?: {
                current: number;
                pageSize: number;
                total: number;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
                onPageChange?: (page: number) => void;
                onPageSizeChange?: (size: number) => void;
        };
}

/**
 * 動的設定ベースのデータテーブルコンポーネント
 */
export function DataTable<T>({
        config,
        data,
        loading = false,
        onAction,
        onSelectionChange,
        pagination
}: DataTableProps<T>) {
        // テーブル状態管理
        const [sorting, setSorting] = useState<SortingState>([]);
        const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
        const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
        const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

        // onActionへの最新の参照をuseRefで保持し、useMemoの依存関係から除外
        const onActionRef = React.useRef(onAction);
        React.useEffect(() => {
                onActionRef.current = onAction;
        }, [onAction]);

        // カラム定義を動的生成
        const columns = useMemo<ColumnDef<T>[]>(() => {
                const cols: ColumnDef<T>[] = [];

                // 選択カラム（選択機能が有効な場合）
                if (config.table.features.selection?.enabled) {
                        cols.push({
                                id: 'select',
                                header: ({ table }) => (
                                        <Checkbox
                                                checked={table.getIsAllPageRowsSelected()}
                                                onCheckedChange={(checked: boolean) => table.toggleAllPageRowsSelected(!!checked)}
                                        />
                                ),
                                cell: ({ row }) => (
                                        <Checkbox
                                                checked={row.getIsSelected()}
                                                onCheckedChange={(checked: boolean) => row.toggleSelected(!!checked)}
                                        />
                                ),
                                enableSorting: false,
                                enableHiding: false,
                                size: 50,
                        });
                }

                // データカラム
                config.table.columns.forEach((colConfig) => {
                        if (colConfig.hidden) return;

                        cols.push({
                                accessorKey: colConfig.key,
                                header: ({ column }) => {
                                        if (!colConfig.sortable) return colConfig.label;

                                        return (
                                                <Button
                                                        variant="ghost"
                                                        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
                                                        className="flex items-center space-x-2 hover:text-foreground p-0 h-auto"
                                                >
                                                        <span>{colConfig.label}</span>
                                                        {column.getIsSorted() === 'asc' && <ChevronUp size={16} />}
                                                        {column.getIsSorted() === 'desc' && <ChevronDown size={16} />}
                                                </Button>
                                        );
                                },
                                cell: ({ getValue, row }) => {
                                        const value = getValue();

                                        if (colConfig.render) {
                                                return colConfig.render(value, row.original);
                                        }

                                        if (colConfig.format) {
                                                return colConfig.format(value);
                                        }

                                        // デフォルトフォーマット
                                        return formatCellValue(value, colConfig.type);
                                },
                                enableSorting: colConfig.sortable,
                                size: colConfig.width,
                                minSize: colConfig.minWidth,
                        });
                });

                // アクションカラム
                if (config.table.actions.length > 0) {
                        cols.push({
                                id: 'actions',
                                header: () => (
                                        <div className="text-center">アクション</div>
                                ),
                                cell: ({ row }) => (
                                        <div className="flex justify-center">
                                                <ActionMenu 
                                                        actions={config.table.actions}
                                                        row={row.original}
                                                        onAction={onActionRef.current} // ref経由で最新の関数を使用
                                                />
                                        </div>
                                ),
                                enableSorting: false,
                                enableHiding: false,
                        });
                }

                return cols;
        }, [config]); // 依存配列からonActionを削除

        // テーブルインスタンス作成
        const table = useReactTable({
                data,
                columns,
                state: {
                        sorting,
                        columnFilters,
                        columnVisibility,
                        rowSelection,
                },
                onSortingChange: setSorting,
                onColumnFiltersChange: setColumnFilters,
                onColumnVisibilityChange: setColumnVisibility,
                onRowSelectionChange: setRowSelection,
                getCoreRowModel: getCoreRowModel(),
                getSortedRowModel: getSortedRowModel(),
                getFilteredRowModel: getFilteredRowModel(),
                getPaginationRowModel: getPaginationRowModel(),
                initialState: {
                        pagination: {
                                pageSize: config.table.features.pagination?.pageSize || 10,
                        },
                },
        });

        // 選択変更の通知
        React.useEffect(() => {
                if (onSelectionChange) {
                        const selectedRows = table.getFilteredSelectedRowModel().rows.map(row => row.original);
                        onSelectionChange(selectedRows);
                }
        }, [rowSelection, onSelectionChange, table]);

        if (loading) {
                return <div className="text-center py-8">読み込み中...</div>;
        }

        return (
                <div className="space-y-4">
                        <div className="rounded-md border">
                                <Table>
                                        <TableHeader>
                                                {table.getHeaderGroups().map((headerGroup) => (
                                                        <TableRow key={headerGroup.id}>
                                                                {headerGroup.headers.map((header) => (
                                                                        <TableHead
                                                                                key={header.id}
                                                                                style={{ width: header.getSize() }}
                                                                                className="px-3 py-2"
                                                                        >
                                                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                                        </TableHead>
                                                                ))}
                                                        </TableRow>
                                                ))}
                                        </TableHeader>
                                        <TableBody>
                                                {table.getRowModel().rows?.length ? (
                                                        table.getRowModel().rows.map((row) => (
                                                                <TableRow key={row.id}>
                                                                        {row.getVisibleCells().map((cell) => (
                                                                                <TableCell 
                                                                                        key={cell.id}
                                                                                        className="px-3 py-3"
                                                                                >
                                                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                                                </TableCell>
                                                                        ))}
                                                                </TableRow>
                                                        ))
                                                ) : (
                                                        <TableRow>
                                                                <TableCell
                                                                        colSpan={columns.length}
                                                                        className="h-24 text-center text-muted-foreground"
                                                                >
                                                                        データが見つかりません
                                                                </TableCell>
                                                        </TableRow>
                                                )}
                                        </TableBody>
                                </Table>
                        </div>

                        {config.table.features.pagination?.enabled && (
                                <div className="flex items-center justify-end space-x-2 py-4">
                                        <div className="flex items-center space-x-2">
                                                {pagination ? (
                                                        <>
                                                                {/* サーバー側の分页情報を使用 */}
                                                                <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => pagination.onPageChange?.(pagination.current - 1)}
                                                                        disabled={!pagination.hasPrev}
                                                                >
                                                                        前へ
                                                                </Button>
                                                                <span className="text-sm">
                                                                        {pagination.current} / {pagination.totalPages}
                                                                </span>
                                                                <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => pagination.onPageChange?.(pagination.current + 1)}
                                                                        disabled={!pagination.hasNext}
                                                                >
                                                                        次へ
                                                                </Button>
                                                        </>
                                                ) : (
                                                        <>
                                                                {/* クライアント側の分页情報を使用（後方互換性） */}
                                                                <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => table.previousPage()}
                                                                        disabled={!table.getCanPreviousPage()}
                                                                >
                                                                        前へ
                                                                </Button>
                                                                <span className="text-sm">
                                                                        {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                                                                </span>
                                                                <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        onClick={() => table.nextPage()}
                                                                        disabled={!table.getCanNextPage()}
                                                                >
                                                                        次へ
                                                                </Button>
                                                        </>
                                                )}
                                        </div>
                                </div>
                        )}
                </div>
        );
}

// セル値のフォーマット関数
function formatCellValue(value: unknown, type: string): React.ReactNode {
        if (value === null || value === undefined) return '-';

        switch (type) {
                case 'currency':
                        return new Intl.NumberFormat('ja-JP', {
                                style: 'currency',
                                currency: 'JPY',
                        }).format(Number(value));

                case 'date':
                        return new Date(value).toLocaleDateString('ja-JP');

                case 'datetime':
                        return new Date(value).toLocaleString('ja-JP');

                case 'boolean':
                        return value ? '✓' : '✗';

                case 'image':
                        return value ? (
                                <img src={value} alt="" className="w-12 h-12 object-cover rounded" />
                        ) : '-';

                default:
                        return String(value);
        }
}