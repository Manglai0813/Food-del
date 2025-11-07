import { z } from 'zod';
import type { EntityConfig } from '../types/crud-config';
import { createImageUrl, API_ENDPOINTS } from '@/lib/apiConstants';

/**
 * 商品管理のEntityConfig設定
 * 文档3.1に基づく完全な設定駆動CRUD システム
 */
export const productEntityConfig: EntityConfig = {
        name: 'products',
        displayName: '商品管理',
        description: '食品・飲料商品の管理',
        apiEndpoint: API_ENDPOINTS.FOODS.LIST,

        // スキーマ定義
        schema: {
                list: z.object({
                        id: z.number(),
                        name: z.string(),
                        price: z.number(),
                        category: z.string().optional(),
                        image_path: z.string().optional(),
                        description: z.string().optional(),
                }),

                // 詳細表示時のスキーマ
                detail: z.object({
                        id: z.number(),
                        name: z.string(),
                        description: z.string(),
                        price: z.number(),
                        category: z.string(),
                        image_path: z.string().optional(),
                }),

                // 作成時は全フィールドが必須
                create: z.object({
                        name: z.string().min(1, '商品名は必須です'),
                        description: z.string().min(1, '商品説明は必須です'),
                        price: z.number().positive('価格は正の数値である必要があります'),
                        category: z.string().min(1, 'カテゴリを選択してください'),
                        image_path: z.string().optional(),
                }),

                // 更新時は部分的な更新を許可
                update: z.object({
                        name: z.string().min(1, '商品名は必須です').optional(),
                        description: z.string().min(1, '商品説明は必須です').optional(),
                        price: z.number().positive().optional(),
                        category: z.string().min(1).optional(),
                        image_path: z.string().optional(),
                }),
        },

        // テーブル設定
        table: {
                columns: [
                        {
                                key: 'image_path',
                                label: '画像',
                                type: 'image',
                                width: 80,
                                sortable: false,
                                filterable: false,
                                render: (value: string, row: Record<string, unknown>) => {
                                        const imageUrl = value ? createImageUrl(value) : '/food.svg';
                                        return (
                                                <div className="w-16 h-12 overflow-hidden rounded-lg flex-shrink-0">
                                                        <img
                                                                src={imageUrl}
                                                                alt={row.name || '商品画像'}
                                                                className="w-full h-full object-cover"
                                                                onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = '/food.svg';
                                                                }}
                                                        />
                                                </div>
                                        );
                                },
                        },
                        {
                                key: 'name',
                                label: '商品名',
                                type: 'text',
                                sortable: true,
                                filterable: true,
                                searchable: true,
                                minWidth: 200,
                        },
                        {
                                key: 'price',
                                label: '価格',
                                type: 'currency',
                                sortable: true,
                                filterable: true,
                                width: 120,
                                format: (value: number) => `¥${new Intl.NumberFormat('ja-JP').format(value)}`,
                        },
                        {
                                key: 'category',
                                label: 'カテゴリ',
                                type: 'text',
                                sortable: true,
                                filterable: true,
                                width: 150,
                                render: (_value: unknown, row: Record<string, unknown>) => {
                                        const category = row.category as Record<string, unknown> | undefined;
                                        return category?.name || '-';
                                },
                        },
                        {
                                key: 'description',
                                label: '説明',
                                type: 'text',
                                sortable: false,
                                filterable: false,
                                width: 300,
                                format: (value: string) => value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : '',
                        },
                ],

                // 行動作設定
                actions: [
                        {
                                key: 'view',
                                label: '詳細表示',
                                variant: 'secondary',
                        },
                        {
                                key: 'edit',
                                label: '編集',
                                variant: 'primary',
                        },
                        {
                                key: 'delete',
                                label: '削除',
                                variant: 'danger',
                                confirmation: {
                                        title: '商品削除確認',
                                        message: 'この商品を削除しますか？この操作は取り消せません。',
                                        confirmText: '削除',
                                        cancelText: 'キャンセル',
                                },
                        },
                ],

                // 追加のテーブル機能設定
                features: {
                        pagination: {
                                enabled: true,
                                pageSize: 10,
                                pageSizeOptions: [5, 10, 20, 50],
                        },
                        sorting: {
                                enabled: true,
                                multiple: true,
                        },
                        filtering: {
                                enabled: true,
                                global: true,
                                advanced: true,
                        },
                        selection: {
                                enabled: true,
                                multiple: true,
                        },
                        export: {
                                enabled: true,
                                formats: ['csv', 'excel'],
                        },
                },

                defaultSort: {
                        column: 'id',
                        direction: 'desc',
                },
        },

        // フォーム設定
        form: {
                create: [
                        {
                                key: 'name',
                                label: '商品名',
                                type: 'text',
                                required: true,
                                placeholder: '例: マルゲリータピザ',
                                gridColumn: 2,
                        },
                        {
                                key: 'category',
                                label: 'カテゴリ',
                                type: 'select',
                                required: true,
                                options: [
                                        { label: 'Pizza', value: 'Pizza' },
                                        { label: 'Curry', value: 'Curry' },
                                        { label: 'Burger', value: 'Burger' },
                                        { label: 'Salad', value: 'Salad' },
                                ],
                                gridColumn: 1,
                        },
                        {
                                key: 'price',
                                label: '価格 (円)',
                                type: 'currency',
                                required: true,
                                placeholder: '1000',
                                gridColumn: 1,
                        },
                        {
                                key: 'description',
                                label: '商品説明',
                                type: 'textarea',
                                required: true,
                                placeholder: 'この商品の特徴や魅力を説明してください',
                                gridColumn: 2,
                        },
                        {
                                key: 'image',
                                label: '商品画像',
                                type: 'file',
                                required: true,
                                placeholder: '画像ファイルを選択',
                                description: 'JPG、PNG、WebP（最大10MB）',
                                gridColumn: 1,
                                accept: 'image/*',
                        },
                ],

                update: [
                        {
                                key: 'name',
                                label: '商品名',
                                type: 'text',
                                required: true,
                                gridColumn: 2,
                        },
                        {
                                key: 'category',
                                label: 'カテゴリ',
                                type: 'select',
                                required: true,
                                options: [
                                        { label: 'Pizza', value: 'Pizza' },
                                        { label: 'Curry', value: 'Curry' },
                                        { label: 'Burger', value: 'Burger' },
                                        { label: 'Salad', value: 'Salad' },
                                ],
                                gridColumn: 1,
                        },
                        {
                                key: 'price',
                                label: '価格 (円)',
                                type: 'currency',
                                required: true,
                                gridColumn: 1,
                        },
                        {
                                key: 'description',
                                label: '商品説明',
                                type: 'textarea',
                                required: true,
                                gridColumn: 2,
                        },
                        {
                                key: 'image',
                                label: '商品画像',
                                type: 'file',
                                description: 'JPG、PNG、WebP（最大10MB）',
                                gridColumn: 1,
                                accept: 'image/*',
                        },
                ],

                layout: 'grid',

                sections: [
                        {
                                title: '基本情報',
                                description: '商品の基本的な情報',
                                fields: ['name', 'category', 'price'],
                                defaultExpanded: true,
                        },
                        {
                                title: '詳細情報',
                                description: '商品の詳細な説明と画像',
                                fields: ['description', 'image'],
                                defaultExpanded: true,
                        },
                ],
        },

        // 権限設定
        permissions: {
                create: true,
                read: true,
                update: true,
                delete: true,
                export: true,
        },
};

// デフォルトエクスポート
export default productEntityConfig;