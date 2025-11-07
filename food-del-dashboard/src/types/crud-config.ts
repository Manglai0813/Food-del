import { z } from 'zod';
import type { ReactNode } from 'react';

/**
 * 汎用CRUD設定型定義
 * データテーブルとフォームの統合設定システム
 */

// フィールドタイプの列挙型
export type FieldType =
        | 'text'
        | 'textarea'
        | 'number'
        | 'select'
        | 'multiselect'
        | 'date'          // 日付選択フィールド
        | 'datetime'      // 日時選択フィールド
        | 'boolean'       // チェックボックス（真偽値）
        | 'file'          // ファイルアップロードフィールド
        | 'image'         // 画像アップロードフィールド
        | 'currency'      // 通貨入力フィールド（円など）
        | 'email'         // メールアドレス入力フィールド
        | 'url';          // URL入力フィールド

// セレクトオプションインターフェース
export interface SelectOption {
        label: string;                    // 表示される選択肢のラベル
        value: string | number;           // 実際の値（文字列または数値）
        disabled?: boolean;               // この選択肢を無効化するかどうか
}

// カラム設定インターフェース
export interface ColumnConfig {
        key: string;                                   // データオブジェクトのキー名
        label: string;                                 // テーブルヘッダーに表示されるラベル
        type: FieldType;                              // データの型（表示形式を決定）
        sortable?: boolean;                           // このカラムでソート可能かどうか
        filterable?: boolean;                         // このカラムにフィルター機能を付けるかどうか
        searchable?: boolean;                         // グローバル検索の対象に含めるかどうか
        width?: number;                               // カラムの固定幅（ピクセル単位）
        minWidth?: number;                            // カラムの最小幅（レスポンシブ対応）
        hidden?: boolean;                             // このカラムを非表示にするかどうか
        render?: (value: unknown, row: Record<string, unknown>) => ReactNode;
        format?: (value: unknown) => string;
}

// フォームフィールド設定インターフェース
export interface FormFieldConfig {
        key: string;                   // フィールドの一意識別子（データのキー名と対応）
        label: string;                 // フィールドのラベル（ユーザーに表示される名前）
        type: FieldType;              // フィールドの入力タイプ
        required?: boolean;           // 必須入力かどうか（true=必須、未設定=任意）
        disabled?: boolean;           // フィールドを無効化するかどうか
        placeholder?: string;         // 入力フィールドのプレースホルダーテキスト
        description?: string;         // フィールドの説明文（ヘルプテキスト）
        validation?: z.ZodSchema;     // カスタムバリデーションルール（Zodスキーマ）
        options?: SelectOption[];     // セレクト系フィールドの選択肢リスト
        multiple?: boolean;           // 複数選択を許可するかどうか（select/file）
        accept?: string;              // アップロード可能なファイルタイプ（file/image用）
        maxSize?: number;             // アップロードファイルの最大サイズ（MB単位）
        defaultValue?: unknown;
        gridColumn?: number;          // グリッドレイアウト時のカラム数（1-12）
}

// アクション設定インターフェース
export interface ActionConfig {
        key: string;                  // アクションの一意識別子
        label: string;                // メニューに表示されるアクション名
        icon?: ReactNode;             // アクションアイコン（Lucideアイコンなど）
        variant?: 'primary' | 'secondary' | 'danger' | 'success'; // アクションの見た目スタイル
        confirmation?: {              // 実行前の確認ダイアログ設定
                title: string;        // 確認ダイアログのタイトル
                message: string;      // 確認メッセージ
                confirmText?: string; // 確認ボタンのテキスト（デフォルト: "確認"）
                cancelText?: string;  // キャンセルボタンのテキスト（デフォルト: "キャンセル"）
        };
        condition?: (row: Record<string, unknown>) => boolean;
        bulk?: boolean;               // 一括操作（複数行選択）に対応するかどうか
}

// テーブル機能設定インターフェース
export interface FeatureConfig {
        pagination?: {                        // ページネーション機能設定
                enabled: boolean;             // ページネーション機能を有効にするかどうか
                pageSize: number;             // 1ページあたりの表示件数
                pageSizeOptions?: number[];   // ユーザーが選択可能な表示件数オプション
        };
        sorting?: {                           // ソート機能設定
                enabled: boolean;             // ソート機能を有効にするかどうか
                multiple?: boolean;           // 複数カラムでの同時ソートを許可するかどうか
        };
        filtering?: {                         // フィルタリング機能設定
                enabled: boolean;             // フィルタリング機能を有効にするかどうか
                global?: boolean;             // 全体検索機能を有効にするかどうか
                advanced?: boolean;           // 高度なフィルター機能を有効にするかどうか
        };
        selection?: {                         // 行選択機能設定
                enabled: boolean;             // 行選択機能を有効にするかどうか
                multiple?: boolean;           // 複数行選択を許可するかどうか
        };
        export?: {                            // エクスポート機能設定
                enabled: boolean;             // エクスポート機能を有効にするかどうか
                formats?: ('csv' | 'excel' | 'pdf')[]; // 対応するエクスポート形式
        };
}

// エンティティ設定インターフェース
export interface EntityConfig {
        name: string;                 // エンティティ名（内部識別子、例: "products"）
        displayName: string;          // ユーザーに表示される名前（例: "商品管理"）
        description?: string;         // エンティティの説明文
        apiEndpoint: string;          // REST APIのベースエンドポイント（例: "/api/products"）

        // スキーマ定義
        schema: {
                list: z.ZodSchema;          // 一覧データの形式を定義するZodスキーマ
                detail: z.ZodSchema;        // 詳細データの形式を定義するZodスキーマ
                create: z.ZodSchema;        // 作成時のデータ形式を定義するZodスキーマ
                update: z.ZodSchema;        // 更新時のデータ形式を定義するZodスキーマ
        };

        // テーブル設定
        table: {
                columns: ColumnConfig[];                                            // 表示するカラムの設定配列
                actions: ActionConfig[];                                            // 行ごとのアクション設定配列
                features: FeatureConfig;                                            // テーブル機能の有効/無効設定
                defaultSort?: { column: string; direction: 'asc' | 'desc' };      // デフォルトのソート設定
        };

        // フォーム設定
        form: {
                create: FormFieldConfig[];  // 新規作成フォームのフィールド設定配列
                update: FormFieldConfig[];  // 更新フォームのフィールド設定配列
                layout?: 'grid' | 'stack';  // フォームレイアウト（グリッド配置 or 縦並び）
                sections?: FormSection[];   // フォームをセクション分けする場合の設定
        };

        // 権限設定
        permissions?: {
                create?: boolean;           // 作成権限を持つかどうか
                read?: boolean;             // 読み取り権限を持つかどうか
                update?: boolean;           // 更新権限を持つかどうか
                delete?: boolean;           // 削除権限を持つかどうか
                export?: boolean;           // エクスポート権限を持つかどうか
        };
}

// フォームセクション設定インターフェース
export interface FormSection {
        title: string;                // セクションのタイトル（例: "基本情報"）
        description?: string;         // セクションの説明文
        fields: string[];             // このセクションに含めるフィールドキーの配列
        collapsible?: boolean;        // セクションを折りたたみ可能にするかどうか
        defaultExpanded?: boolean;    // デフォルトでセクションを展開しておくかどうか
}