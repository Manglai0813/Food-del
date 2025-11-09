import React from 'react';
import type { Column } from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ColumnConfig } from '../../types/crud-config';

// カラムフィルターのプロパティ
interface ColumnFilterProps {
    column: Column<Record<string, unknown>>;
    config: ColumnConfig;
}

// カラムフィルターコンポーネント
export const ColumnFilter: React.FC<ColumnFilterProps> = ({ column, config }) => {
    const filterValue = column.getFilterValue() as string;

    if (!config.filterable) return null;

    switch (config.type) {
        case 'text':
        case 'email':
        case 'url':
            return (
                <Input
                    type="text"
                    value={filterValue || ''}
                    onChange={(e) => column.setFilterValue(e.target.value)}
                    placeholder={`${config.label}で検索...`}
                    className="h-8 text-xs"
                />
            );

        case 'number':
        case 'currency':
            return (
                <div className="flex space-x-1">
                    <Input
                        type="number"
                        placeholder="最小"
                        className="h-8 text-xs"
                        onChange={(e) => {
                            const value = e.target.value;
                            column.setFilterValue((old: [number, number]) => [
                                value ? parseInt(value, 10) : undefined,
                                old?.[1]
                            ]);
                        }}
                    />
                    <Input
                        type="number"
                        placeholder="最大"
                        className="h-8 text-xs"
                        onChange={(e) => {
                            const value = e.target.value;
                            column.setFilterValue((old: [number, number]) => [
                                old?.[0],
                                value ? parseInt(value, 10) : undefined
                            ]);
                        }}
                    />
                </div>
            );

        case 'select':
            return null;

        case 'boolean':
            return (
                <Select
                    value={filterValue || ''}
                    onValueChange={(value: string) => column.setFilterValue(value || undefined)}
                >
                    <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="すべて" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="">すべて</SelectItem>
                        <SelectItem value="true">はい</SelectItem>
                        <SelectItem value="false">いいえ</SelectItem>
                    </SelectContent>
                </Select>
            );

        default:
            return null;
    }
};