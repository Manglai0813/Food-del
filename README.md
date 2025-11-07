# Food-Del: フルスタック食品配送プラットフォーム

## プロジェクト概要

Food-Delは、モダンなウェブ技術を使用して構築された包括的な食品配送プラットフォームです。顧客向けのフロントエンド、管理者用のダッシュボード、そして高性能なバックエンドAPIの3つの主要コンポーネントで構成されています。

## プロジェクト構成

```
Food-del/
├── food-del-client/          # 顧客向けReactアプリケーション
├── food-del-dashboard/       # 管理者用Next.jsダッシュボード
├── food-del-server/          # Bun TypeScriptバックエンドAPI
└── docker-compose.yml        # Dockerコンテナオーケストレーション
```

## 技術スタック

### フロントエンド（food-del-client）

- **React 18** - ユーザーインターフェース構築
- **Vite** - 高速開発ビルドツール
- **React Router v7** - クライアントサイドルーティング
- **Axios** - HTTP通信ライブラリ
- **React Context** - グローバル状態管理

### 管理者ダッシュボード（food-del-dashboard）

- **Next.js 15** - React フレームワーク（Turbopack対応）
- **React 19** - 最新版React
- **Tailwind CSS** - ユーティリティファーストCSS
- **Shadcn/UI** - 高品質UIコンポーネント
- **React Hook Form** - フォーム管理
- **Zod** - スキーマバリデーション

### バックエンド（food-del-server）

- **Bun** - 高速JavaScriptランタイム
- **Express.js** - ウェブアプリケーションフレームワーク
- **TypeScript** - 型安全性を提供
- **Prisma ORM** - データベースORM
- **PostgreSQL** - リレーショナルデータベース
- **JWT** - 認証トークン
- **bcrypt** - パスワードハッシュ化
- **Multer** - ファイルアップロード処理

## 主要機能

### 🎯 顧客向け機能

- **ユーザー認証**: 登録・ログイン・ログアウト
- **商品閲覧**: カテゴリ別商品表示
- **ショッピングカート**: 商品追加・削除・数量変更
- **注文機能**: 配送先入力・注文確定
- **レスポンシブデザイン**: モバイル・デスクトップ対応

### 🛠 管理者向け機能

- **管理者認証**: ロールベースアクセス制御
- **商品管理**: CRUD操作（作成・読込・更新・削除）
- **画像アップロード**: 商品画像の管理
- **注文管理**: 注文状況の確認・更新
- **ダッシュボード**: 統計情報の表示

### 🔧 バックエンド機能

- **RESTful API**: 標準的なHTTPメソッド
- **JWT認証**: セキュアなトークンベース認証
- **ファイル管理**: 画像アップロード・配信
- **データベース管理**: Prismaによる型安全なデータ操作
- **エラーハンドリング**: 包括的なエラー処理

## API エンドポイント

### 認証関連

```
POST /api/user/auth/register   # ユーザー登録
POST /api/user/auth/login      # ユーザーログイン  
POST /api/user/auth/logout     # ユーザーログアウト
```

### 商品管理（管理者限定）

```
POST   /api/food              # 商品追加
PUT    /api/food/:id          # 商品更新
DELETE /api/food/:id          # 商品削除
```

### 公開API

```
GET /api/food                 # 全商品取得
GET /api/food/:id             # 特定商品取得
```

## データベーススキーマ

### 主要テーブル

- **users**: ユーザー情報（顧客・管理者）
- **categories**: 商品カテゴリ
- **foods**: 商品情報
- **carts**: ショッピングカート
- **cart_items**: カート内商品
- **orders**: 注文情報
- **order_items**: 注文詳細

## セットアップ・起動方法

### 前提条件

- Docker & Docker Compose
- Node.js 18以上（ローカル開発時）
- PostgreSQL（ローカル開発時）

### Dockerを使用した起動

1. **プロジェクトのクローン**
   
   ```bash
   git clone <repository-url>
   cd Food-del
   ```

2. **環境変数の設定**
   各サービスの`.env`ファイルを設定：
   
   ```bash
   # food-del-server/.env
   DATABASE_URL="postgresql://user:password@localhost:5432/fooddb"
   JWT_SECRET="your-secret-key"
   PORT=5000
   ```

# food-del-client/.env

VITE_API_URL="http://localhost:5000"

# food-del-dashboard/.env

NEXT_PUBLIC_API_URL="http://localhost:5000"

```
3. **アプリケーションの起動**
```bash
docker-compose up --build
```

### アクセスURL

- **顧客アプリ**: http://localhost:5173
- **管理ダッシュボード**: http://localhost:3001  
- **バックエンドAPI**: http://localhost:5000

## 管理者アカウントの作成

1. **通常ユーザーとして登録**
   
   - 顧客アプリまたは管理ダッシュボードで新規登録

2. **データベースに接続**
   
   ```bash
   docker-compose exec -u postgres postgres psql -d fooddb
   ```

3. **ユーザーを管理者に昇格**
   
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```

## 開発・運用

### ローカル開発

```bash
# バックエンド
cd food-del-server
bun install
bun dev

# フロントエンド
cd food-del-client  
npm install
npm run dev

# ダッシュボード
cd food-del-dashboard
npm install
npm run dev
```

### プロダクションビルド

```bash
# フロントエンド
npm run build

# ダッシュボード  
npm run build

# バックエンド
bun run start
```

## セキュリティ機能

- **パスワードハッシュ化**: bcryptによる安全なハッシュ化
- **JWT認証**: セキュアなトークンベース認証
- **ロールベースアクセス**: 管理者権限の制御
- **入力バリデーション**: フロント・バックエンド両方での検証
- **CORS設定**: クロスオリジンリクエストの制御

## ライセンス

このプロジェクトはプライベートプロジェクトです。

## 貢献

プロジェクトへの貢献を歓迎します。プルリクエストを送信する前に、以下を確認してください：

1. コードスタイルの一貫性
2. テストの追加・更新
3. ドキュメントの更新
4. セキュリティベストプラクティスの遵守

---

**Food-Del** - モダンな技術スタックで構築された、スケーラブルで安全な食品配送プラットフォーム