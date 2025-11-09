# Food Delivery Client

フードデリバリーアプリケーション向けのユーザー向けフロントエンドアプリケーション

## 概要

ReactとTypeScriptを使用した、モダンで直感的なユーザー向けWebアプリケーション。TanStack Queryによる効率的なデータフェッチ、完全な型安全性、そしてレスポンシブデザインを実現した本番環境対応のアプリケーションです。

## 技術スタック

- **フレームワーク**: React 19
- **言語**: TypeScript
- **ビルドツール**: Vite
- **ランタイム**: Bun
- **状態管理**: Zustand
- **データフェッチ**: TanStack Query (React Query)
- **ルーティング**: React Router v7
- **UIライブラリ**: Radix UI + shadcn/ui
- **スタイリング**: Tailwind CSS
- **フォーム管理**: React Hook Form + Zod
- **HTTPクライアント**: Fetch API
- **通知**: react-hot-toast
- **日付処理**: date-fns

## プロジェクト構造

```
food-del-client/
├── src/
│   ├── api/                        # API呼び出し層
│   │   ├── client.ts              # APIクライアント（Fetch API）
│   │   ├── auth.api.ts            # 認証API
│   │   ├── cart.api.ts            # カートAPI
│   │   ├── category.api.ts        # カテゴリAPI
│   │   ├── food.api.ts            # 商品API
│   │   ├── order.api.ts           # 注文API
│   │   └── index.ts               # APIエクスポート
│   ├── components/                 # コンポーネント層
│   │   ├── auth/                  # 認証関連コンポーネント
│   │   │   ├── LoginPopup.tsx     # ログインポップアップ
│   │   │   └── index.ts           # Barrel Export
│   │   ├── common/                # 共通コンポーネント
│   │   │   ├── Loading.tsx        # ローディングコンポーネント
│   │   │   ├── Pagination.tsx     # ページネーション
│   │   │   ├── Toast.tsx          # トースト通知
│   │   │   └── index.ts           # Barrel Export
│   │   ├── food/                  # 商品関連コンポーネント
│   │   │   ├── ExploreMenu.tsx    # メニュー探索
│   │   │   ├── FoodDisplay.tsx    # 商品表示
│   │   │   ├── FoodItem.tsx       # 商品アイテム
│   │   │   └── index.ts           # Barrel Export
│   │   ├── layout/                # レイアウトコンポーネント
│   │   │   ├── Navbar.tsx         # ナビゲーションバー
│   │   │   ├── FooterNew.tsx      # フッター
│   │   │   ├── HeroBanner.tsx     # ヒーローバナー
│   │   │   ├── MobileMenu.tsx     # モバイルメニュー
│   │   │   └── index.ts           # Barrel Export
│   │   └── ui/                    # UIプリミティブコンポーネント
│   │       ├── alert-dialog.tsx   # アラートダイアログ
│   │       ├── badge.tsx           # バッジ
│   │       ├── button.tsx          # ボタン
│   │       ├── card.tsx            # カード
│   │       ├── checkbox.tsx        # チェックボックス
│   │       ├── dialog.tsx          # ダイアログ
│   │       ├── dropdown-menu.tsx   # ドロップダウンメニュー
│   │       ├── input.tsx           # 入力フィールド
│   │       ├── label.tsx           # ラベル
│   │       ├── navigation-menu.tsx # ナビゲーションメニュー
│   │       ├── progress.tsx        # プログレスバー
│   │       ├── separator.tsx       # セパレーター
│   │       ├── sheet.tsx           # シート
│   │       └── tooltip.tsx         # ツールチップ
│   ├── hooks/                      # カスタムフック
│   │   ├── useAuth.ts              # 認証フック
│   │   ├── useCart.ts              # カートフック
│   │   ├── useCategory.ts          # カテゴリフック
│   │   ├── useFood.ts              # 商品フック
│   │   ├── useOrder.ts             # 注文フック
│   │   └── index.ts                # Barrel Export
│   ├── lib/                        # ライブラリ設定
│   │   ├── constants.ts           # 定数定義
│   │   ├── queryClient.ts         # React Query設定
│   │   ├── toast.ts               # トーストユーティリティ
│   │   ├── utils.ts               # UIユーティリティ
│   │   └── index.ts               # Barrel Export
│   ├── pages/                      # ページコンポーネント
│   │   ├── cart/                   # カートページ
│   │   │   ├── CartPage.tsx       # カートページ
│   │   │   └── CartPage.old.tsx   # 旧カートページ
│   │   ├── food/                   # 商品ページ
│   │   │   ├── HomePage.tsx       # ホームページ
│   │   │   └── HomePageContainer.tsx # ホームページコンテナ
│   │   ├── order/                  # 注文ページ
│   │   │   ├── MyOrdersPage.tsx   # 注文履歴ページ
│   │   │   ├── OrderSuccessPage.tsx # 注文成功ページ
│   │   │   └── PlaceOrderPage.tsx  # 注文作成ページ
│   │   └── index.ts                # Barrel Export
│   ├── providers/                  # Context Providers
│   │   ├── AuthProvider.tsx        # 認証プロバイダー
│   │   └── index.ts                # Barrel Export
│   ├── stores/                     # 状態管理
│   │   ├── auth.ts                 # 認証ストア（Zustand）
│   │   ├── cart.ts                 # カートストア（Zustand）
│   │   ├── preferences.ts          # ユーザー設定ストア
│   │   ├── ui.ts                   # UI状態ストア
│   │   └── index.ts                # Barrel Export
│   ├── types/                      # 型定義
│   │   ├── api.types.ts           # API関連型
│   │   ├── auth.types.ts          # 認証関連型
│   │   ├── cart.types.ts          # カート関連型
│   │   ├── category.types.ts      # カテゴリ関連型
│   │   ├── food.types.ts           # 商品関連型
│   │   ├── order.types.ts          # 注文関連型
│   │   └── index.ts                # 型定義エクスポート
│   ├── utils/                      # ユーティリティ関数
│   │   ├── calculations.ts         # 計算ユーティリティ
│   │   ├── format.ts               # フォーマットユーティリティ
│   │   ├── helpers.ts              # ヘルパー関数
│   │   ├── validation.ts           # バリデーション
│   │   └── index.ts                # Barrel Export
│   ├── assets/                     # 静的リソース
│   │   ├── images/                 # 画像ファイル
│   │   └── index.ts                # Barrel Export
│   ├── styles/                     # グローバルスタイル
│   │   ├── globals.css             # グローバルCSS
│   │   ├── utils.ts                # スタイルユーティリティ
│   │   └── index.ts                # Barrel Export
│   ├── App.tsx                     # メインアプリケーションコンポーネント
│   ├── App.css                     # アプリケーションCSS
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

### ユーザー機能
- ユーザー認証（JWT）と登録
- 商品一覧表示と検索
- カテゴリフィルター機能
- ショッピングカート管理
- 注文作成と支払い処理
- 注文履歴表示と注文キャンセル

### UI/UX
- モバイルレスポンシブデザイン
- ハンバーガーメニューとサイドバーナビゲーション
- モーダルダイアログ
- リアルタイムトースト通知
- ページ遷移時のローディング状態
- コード分割による遅延ローディング

### パフォーマンス
- React Queryによる自動キャッシング
- コード分割によるバンドルサイズ最適化
- 画像の遅延読み込み
- 楽観的更新による即座なUI更新

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
VITE_API_URL=http://localhost:5000
```

**本番環境の場合：**
```env
VITE_API_URL=https://api.yourdomain.com
```

## 実行方法

### 開発環境
```bash
bun run dev
```

開発サーバーは `http://localhost:3000` で起動します。

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
docker build --build-arg VITE_API_URL=http://your-api-url -t food-del-client .
```

### 実行
```bash
docker run -p 80:80 food-del-client
```

## アーキテクチャ

### 階層型アーキテクチャ
- **Pages Layer**: ページレベルの状態管理とコンポーネント組み合わせ
- **Components Layer**: UIコンポーネントとプレゼンテーションロジック
- **API Layer**: HTTPリクエストとデータフェッチ（Fetch API）
- **State Layer**: グローバル状態管理（Zustand）
- **Types Layer**: TypeScript型定義

### データフェッチ戦略
- **TanStack Query**: サーバー状態の管理
- **自動キャッシング**: データの自動キャッシュと再検証
- **楽観的更新**: UIの即座な更新
- **エラーハンドリング**: 統一されたエラー処理

### 状態管理
- **Zustand**: 認証状態、カート状態、UI状態などのグローバル状態
- **React Query**: サーバー状態とキャッシング
- **React Hook Form**: フォーム状態管理

## ルーティング

### 公開ルート
- `/` - ホームページ（商品一覧）
- `/cart` - ショッピングカート
- `/checkout` - 注文作成ページ
- `/orders` - 注文履歴（認証必須）
- `/orders/success` - 注文成功ページ

## セキュリティ

- JWT認証による安全なアクセス制御
- HttpOnly CookieによるXSS対策
- Fetch APIによるセキュアな通信
- 統一されたエラーハンドリング
- 入力バリデーション（Zod）

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
- any型の完全排除

### コンポーネント設計
- **共通コンポーネント**: 再利用可能な汎用コンポーネント
- **ページコンポーネント**: ページレベルのコンポーネント
- **UIプリミティブ**: Radix UI + shadcn/uiベースの基本UIコンポーネント

### パフォーマンス最適化
- React Queryによる自動キャッシング
- コード分割（React.lazy）によるバンドルサイズ最適化
- メモ化による再レンダリング最適化
- 画像の遅延読み込み

## トラブルシューティング

### API接続エラー
1. `VITE_API_URL` 環境変数が正しく設定されているか確認
2. バックエンドサーバーが起動しているか確認
3. CORS設定が正しいか確認

### ビルドエラー
1. 依存関係が正しくインストールされているか確認
2. TypeScriptの型エラーを確認
3. `bun run build` で詳細なエラーメッセージを確認

### 認証エラー
1. トークンが正しく保存されているか確認
2. バックエンドの認証エンドポイントが正しく動作しているか確認
3. Cookie設定が正しいか確認
