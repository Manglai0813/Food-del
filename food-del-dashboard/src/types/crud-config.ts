import { z } from 'zod';
import type { ReactNode } from 'react';

// フィールドタイプの列挙型
export type FieldType =
    | 'text'
    | 'textarea'
    | 'number'
    | 'select'
    | 'multiselect'
    | 'date'
    | 'datetime'
    | 'boolean'
    | 'file'
    | 'image'
    | 'currency'
    | 'email'
    | 'url';

// セレクトオプションインターフェース
export interface SelectOption {
    label: string;
    value: string | number;
    disabled?: boolean;
}

// カラム設定インターフェース
export interface ColumnConfig {
    key: string;
    label: string;
    type: FieldType;
    sortable?: boolean;
    filterable?: boolean;
    searchable?: boolean;
    width?: number;
    minWidth?: number;
    hidden?: boolean;
    render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
    format?: (value: unknown) => string;
}

// フォームフィールド設定インターフェース
export interface FormFieldConfig {
    key: string;
    label: string;
    type: FieldType;
    required?: boolean;
    disabled?: boolean;
    placeholder?: string;
    description?: string;
    validation?: z.ZodSchema;
    options?: SelectOption[];
    multiple?: boolean;
    accept?: string;
    maxSize?: number;
    defaultValue?: unknown;
    gridColumn?: number;
}

// アクション設定インターフェース
export interface ActionConfig {
    key: string;
    label: string;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    confirmation?: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
    };
    condition?: (row: Record<string, unknown>) => boolean;
    bulk?: boolean;
}

// テーブル機能設定インターフェース
export interface FeatureConfig {
    pagination?: {
        enabled: boolean;
        pageSize: number;
        pageSizeOptions?: number[];
    };
    sorting?: {
        enabled: boolean;
        multiple?: boolean;
    };
    filtering?: {
        enabled: boolean;
        global?: boolean;
        advanced?: boolean;
    };
    selection?: {
        enabled: boolean;
        multiple?: boolean;
    };
    export?: {
        enabled: boolean;
        formats?: ('csv' | 'excel' | 'pdf')[];
    };
}

// エンティティ設定インターフェース
export interface EntityConfig {
    name: string;
    displayName: string;
    description?: string;
    apiEndpoint: string;

    // スキーマ定義
    schema: {
        list: z.ZodSchema;
        detail: z.ZodSchema;
        create: z.ZodSchema;
        update: z.ZodSchema;
    };

    // テーブル設定
    table: {
        columns: ColumnConfig[];
        actions: ActionConfig[];
        features: FeatureConfig;
        defaultSort?: { column: string; direction: 'asc' | 'desc' };
    };

    // フォーム設定
    form: {
        create: FormFieldConfig[];
        update: FormFieldConfig[];
        layout?: 'grid' | 'stack';
        sections?: FormSection[];
    };

    // 権限設定
    permissions?: {
        create?: boolean;
        read?: boolean;
        update?: boolean;
        delete?: boolean;
        export?: boolean;
    };
}

// フォームセクション設定インターフェース
export interface FormSection {
    title: string;
    description?: string;
    fields: string[];
    collapsible?: boolean;
    defaultExpanded?: boolean;
}