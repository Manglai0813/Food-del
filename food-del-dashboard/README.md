# Food Delivery Dashboard

フードデリバリーアプリケーション向けの管理ダッシュボード

## 概要

ReactとTypeScriptを使用した、モダンで直感的な管理ダッシュボード。TanStack Queryによる効率的なデータフェッチ、完全な型安全性、そしてレスポンシブデザインを実現した本番環境対応のWebアプリケーションです。

## 技術スタック

- **フレームワーク**: React 19
- **言語**: TypeScript
- **ビルドツール**: Vite
- **ランタイム**: Bun
- **状態管理**: Zustand
- **データフェッチ**: TanStack Query (React Query)
- **ルーティング**: React Router v7
- **UIライブラリ**: Radix UI
- **スタイリング**: Tailwind CSS
- **フォーム管理**: React Hook Form + Zod
- **チャート**: Recharts
- **HTTPクライアント**: Axios
- **通知**: Sonner

## プロジェクト構造

```
food-del-dashboard/
├── src/
│   ├── api/                        # API呼び出し層
│   │   ├── authApi.ts              # 認証API
│   │   ├── categoriesApi.ts        # カテゴリAPI
│   │   ├── dashboardApi.ts         # ダッシュボードAPI
│   │   ├── foodsApi.ts             # 商品API
│   │   ├── ordersApi.ts            # 注文API
│   │   └── index.ts                # APIエクスポート
│   ├── components/                 # コンポーネント層
│   │   ├── common/                 # 共通コンポーネント
│   │   │   ├── ActionMenu.tsx      # アクションメニュー
│   │   │   ├── ColumnFilter.tsx    # カラムフィルタ
│   │   │   ├── DataTable.tsx       # データテーブル
│   │   │   ├── DynamicForm.tsx     # 動的フォーム
│   │   │   ├── FormField.tsx       # フォームフィールド
│   │   │   ├── GlobalSearch.tsx    # グローバル検索
│   │   │   ├── ProtectedRoute.tsx  # 認証ガード
│   │   │   └── index.ts            # Barrel Export
│   │   ├── dashboard/              # ダッシュボード専用コンポーネント
│   │   │   ├── CategoryChart.tsx   # カテゴリ別売上チャート
│   │   │   ├── OrdersByHourChart.tsx # 時間帯別注文チャート
│   │   │   ├── OrderStatusChart.tsx # 注文ステータスチャート
│   │   │   ├── SalesChart.tsx      # 売上推移チャート
│   │   │   ├── StatsCard.tsx       # 統計カード
│   │   │   ├── TopProductsList.tsx # 人気商品リスト
│   │   │   └── index.ts            # Barrel Export
│   │   ├── layout/                 # レイアウトコンポーネント
│   │   │   ├── Header.tsx          # ヘッダー
│   │   │   ├── Layout.tsx          # メインレイアウト
│   │   │   ├── Sidebar.tsx         # サイドバー
│   │   │   └── index.ts            # Barrel Export
│   │   └── ui/                     # UIプリミティブコンポーネント
│   │       ├── avatar.tsx          # アバター
│   │       ├── badge.tsx           # バッジ
│   │       ├── button.tsx          # ボタン
│   │       ├── card.tsx            # カード
│   │       ├── checkbox.tsx        # チェックボックス
│   │       ├── dropdown-menu.tsx   # ドロップダウンメニュー
│   │       ├── input.tsx          # 入力フィールド
│   │       ├── label.tsx           # ラベル
│   │       ├── progress.tsx        # プログレスバー
│   │       ├── select.tsx          # セレクト
│   │       ├── table.tsx           # テーブル
│   │       └── textarea.tsx        # テキストエリア
│   ├── configs/                    # 設定ファイル
│   │   ├── dashboardConfig.ts      # ダッシュボード設定
│   │   └── products.tsx            # 商品フォーム設定
│   ├── hooks/                      # カスタムフック
│   │   ├── useAuth.ts              # 認証フック
│   │   ├── useDashboardAutoRefresh.ts # ダッシュボード自動更新
│   │   ├── useProducts.ts          # 商品管理フック
│   │   └── index.ts                # Barrel Export
│   ├── lib/                        # ライブラリ設定
│   │   ├── apiConstants.ts        # API定数
│   │   ├── errorHandler.ts         # エラーハンドラー
│   │   ├── httpClient.ts           # HTTPクライアント
│   │   ├── query-client-config.ts  # React Query設定
│   │   ├── queryClient.tsx         # React Queryプロバイダー
│   │   └── utils.ts                # ユーティリティ関数
│   ├── pages/                      # ページコンポーネント
│   │   ├── auth/                   # 認証ページ
│   │   │   ├── LoginPage.tsx       # ログインページ
│   │   │   └── index.ts            # Barrel Export
│   │   ├── categories/             # カテゴリ管理ページ
│   │   │   ├── CategoryFormPage.tsx # カテゴリフォーム
│   │   │   ├── CategoryListPage.tsx # カテゴリ一覧
│   │   │   └── index.ts            # Barrel Export
│   │   ├── dashboard/              # ダッシュボードページ
│   │   │   ├── DashboardPage.tsx   # メインダッシュボード
│   │   │   └── index.ts            # Barrel Export
│   │   ├── foods/                  # 商品管理ページ
│   │   │   ├── FoodDetailPage.tsx  # 商品詳細
│   │   │   ├── FoodFormPage.tsx    # 商品フォーム
│   │   │   ├── FoodListPage.tsx    # 商品一覧
│   │   │   └── index.ts            # Barrel Export
│   │   ├── orders/                 # 注文管理ページ
│   │   │   ├── OrderDetailPage.tsx # 注文詳細
│   │   │   ├── OrderListPage.tsx   # 注文一覧
│   │   │   └── index.ts            # Barrel Export
│   │   └── users/                  # ユーザー管理ページ
│   │       ├── UserManagementPlaceholder.tsx # ユーザー管理（プレースホルダー）
│   │       └── index.ts            # Barrel Export
│   ├── stores/                     # 状態管理
│   │   └── authStore.ts            # 認証ストア（Zustand）
│   ├── types/                      # 型定義
│   │   ├── auth.ts                 # 認証関連型
│   │   ├── category.ts            # カテゴリ関連型
│   │   ├── crud-config.ts         # CRUD設定型
│   │   ├── dashboard.ts            # ダッシュボード関連型
│   │   ├── food.ts                  # 商品関連型
│   │   ├── index.ts                # 型定義エクスポート
│   │   └── order.ts                # 注文関連型
│   ├── utils/                      # ユーティリティ関数
│   │   └── orderUtils.ts           # 注文ユーティリティ
│   ├── App.tsx                     # メインアプリケーションコンポーネント
│   ├── main.tsx                    # エントリーポイント
│   └── index.css                   # グローバルスタイル
├── public/                         # 静的ファイル
│   └── food.svg                    # デフォルト画像
├── dist/                           # ビルド出力
├── Dockerfile                      # Docker設定
├── nginx.conf                      # Nginx設定
├── index.html                      # HTMLテンプレート
├── package.json                    # プロジェクト設定
├── tsconfig.json                   # TypeScript設定
├── vite.config.ts                  # Vite設定
├── tailwind.config.js              # Tailwind CSS設定
└── README.md                       # プロジェクト説明
```

## 主要機能

### ダッシュボード
- 総売上、総注文数、商品数、平均注文額などの統計表示
- 売上推移チャート（過去7日間）
- カテゴリ別売上円グラフ
- 時間帯別注文数グラフ
- 注文ステータス分布
- 人気商品ランキング
- 自動更新機能

### 商品管理
- 商品一覧表示（検索・フィルタ・ソート対応）
- 商品詳細表示
- 商品作成・編集・削除
- 画像アップロード
- 在庫管理

### 注文管理（管理者専用）
- 注文一覧表示
- 注文詳細表示
- 注文ステータス更新
- 注文履歴確認

### カテゴリ管理（管理者専用）
- カテゴリ一覧表示
- カテゴリ作成・編集・削除
- カテゴリステータス管理

### 認証・認可
- JWTベースの認証システム
- ログイン・ログアウト
- トークン自動リフレッシュ
- 役割ベースアクセス制御（RBAC）
- 保護されたルート

## インストール

### 前提条件
- Bun 1.0以上
- Node.js 18以上（オプション）

### セットアップ手順

1. 依存関係のインストール
```bash
bun install
```

2. 環境変数の設定
`.env`ファイルを作成し、以下の変数を設定：

```env
VITE_API_BASE_URL=http://localhost:5000
```

**本番環境の場合：**
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

## 実行方法

### 開発環境
```bash
bun run dev
```

開発サーバーは `http://localhost:3001` で起動します。

### 本番ビルド
```bash
bun run build
```

ビルドされたファイルは `dist/` ディレクトリに出力されます。

### プレビュー
```bash
bun run preview
```

ビルド済みのアプリケーションをローカルでプレビューできます。

## Docker デプロイ

### ビルド
```bash
docker build --build-arg VITE_API_BASE_URL=http://your-api-url -t food-del-dashboard .
```

### 実行
```bash
docker run -p 80:80 food-del-dashboard
```

## アーキテクチャ

### 階層型アーキテクチャ
- **Pages Layer**: ページレベルの状態管理とコンポーネント組み合わせ
- **Components Layer**: UIコンポーネントとプレゼンテーションロジック
- **API Layer**: HTTPリクエストとデータフェッチ
- **State Layer**: グローバル状態管理（Zustand）
- **Types Layer**: TypeScript型定義

### データフェッチ戦略
- **TanStack Query**: サーバー状態の管理
- **自動キャッシング**: データの自動キャッシュと再検証
- **楽観的更新**: UIの即座な更新
- **エラーハンドリング**: 統一されたエラー処理

### 状態管理
- **Zustand**: 認証状態などのグローバル状態
- **React Query**: サーバー状態とキャッシング
- **React Hook Form**: フォーム状態管理

## ルーティング

### 公開ルート
- `/login` - ログインページ

### 保護されたルート
- `/` - ダッシュボード（認証必須）
- `/foods` - 商品一覧（認証必須）
- `/foods/new` - 商品作成（認証必須）
- `/foods/:id` - 商品詳細（認証必須）
- `/foods/:id/edit` - 商品編集（認証必須）
- `/orders` - 注文一覧（管理者専用）
- `/orders/:id` - 注文詳細（管理者専用）
- `/categories` - カテゴリ一覧（管理者専用）
- `/categories/new` - カテゴリ作成（管理者専用）
- `/categories/:id/edit` - カテゴリ編集（管理者専用）
- `/users` - ユーザー管理（管理者専用）

## セキュリティ

- JWT認証による安全なアクセス制御
- トークンの自動リフレッシュ
- 役割ベースアクセス制御（RBAC）
- 保護されたルートによる認証ガード
- Axiosインターセプターによる自動トークン付与
- 統一されたエラーハンドリング

## 開発ガイド

### コードスタイル
- TypeScriptの厳格モードを使用
- 単行日文コメントを使用
- ESLintによるコード品質チェック
- Tailwind CSSによるユーティリティファーストのスタイリング

### 型安全性
- すべてのAPIリクエストとレスポンスに型定義
- Zodスキーマによる実行時バリデーション
- React Hook FormとZodの統合

### コンポーネント設計
- **共通コンポーネント**: 再利用可能な汎用コンポーネント
- **ページコンポーネント**: ページレベルのコンポーネント
- **UIプリミティブ**: Radix UIベースの基本UIコンポーネント

### パフォーマンス最適化
- React Queryによる自動キャッシング
- コード分割によるバンドルサイズ最適化
- メモ化による再レンダリング最適化
- 画像の遅延読み込み

## 管理者ユーザーの設定

### PostgreSQLで管理者ユーザーを作成

ダッシュボードにアクセスするには、管理者権限を持つユーザーが必要です。PostgreSQLデータベースで直接管理者ユーザーを作成する方法：

1. PostgreSQLに接続
```bash
psql -U postgres -d food_delivery
```

2. 既存のユーザーを管理者に更新
```sql
-- 既存ユーザーのroleを'admin'に更新
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

3. 新しい管理者ユーザーを作成（パスワードはハッシュ化が必要）
```sql
-- 注意: パスワードはbcryptでハッシュ化する必要があります
-- 通常はアプリケーションの登録APIを使用するか、
-- サーバーのスクリプトを使用してユーザーを作成してください
```

**推奨方法**: サーバーのユーザー登録API (`POST /api/users/auth/register`) を使用してユーザーを作成し、その後PostgreSQLでroleを更新してください。

```sql
-- ユーザー作成後、PostgreSQLでroleを更新
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## トラブルシューティング

### API接続エラー
1. `VITE_API_BASE_URL` 環境変数が正しく設定されているか確認
2. バックエンドサーバーが起動しているか確認
3. CORS設定が正しいか確認

### ビルドエラー
1. 依存関係が正しくインストールされているか確認
2. TypeScriptの型エラーを確認
3. `bun run build` で詳細なエラーメッセージを確認

## ライセンス

Private

