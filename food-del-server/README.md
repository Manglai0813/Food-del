# Food Delivery Server

フードデリバリーアプリケーション向けの高性能バックエンドAPIサーバー

## 概要

TypeScriptとBunランタイムを使用した、モダンで堅牢なRESTful APIサーバー。階層型アーキテクチャと完全な型安全性を実現し、本番環境での運用を想定した設計となっています。

## 技術スタック

- **ランタイム**: Bun
- **フレームワーク**: Express.js
- **言語**: TypeScript
- **ORM**: Prisma
- **データベース**: PostgreSQL
- **バリデーション**: Zod
- **認証**: JWT
- **セキュリティ**: Helmet, CORS, Rate Limiting

## プロジェクト構造

```
food-del-server/
├── src/
│   ├── controllers/              # HTTPリクエストハンドラー
│   │   ├── cartController.ts     # カート操作コントローラー
│   │   ├── categoryController.ts # カテゴリ管理コントローラー
│   │   ├── foodController.ts     # 商品管理コントローラー
│   │   ├── orderController.ts    # 注文管理コントローラー
│   │   └── userController.ts    # ユーザー管理コントローラー
│   ├── services/                 # ビジネスロジック層
│   │   ├── authService.ts       # 認証サービス
│   │   ├── cartService.ts        # カートサービス
│   │   ├── categoryService.ts   # カテゴリサービス
│   │   ├── fileService.ts        # ファイル管理サービス
│   │   ├── foodService.ts        # 商品サービス
│   │   ├── inventoryService.ts  # 在庫管理サービス
│   │   ├── orderService.ts      # 注文サービス
│   │   └── userService.ts       # ユーザーサービス
│   ├── routes/                    # ルーティング定義
│   │   ├── cartRouter.ts         # カートルーター
│   │   ├── categoryRouter.ts     # カテゴリルーター
│   │   ├── foodRouter.ts         # 商品ルーター
│   │   ├── orderRouter.ts        # 注文ルーター
│   │   └── userRouter.ts        # ユーザールーター
│   ├── middleware/                # ミドルウェア
│   │   ├── authMiddleware.ts     # 認証ミドルウェア
│   │   ├── errorHandler.ts       # エラーハンドラー
│   │   ├── fileAccess.ts         # ファイルアクセス制御
│   │   ├── fileUpload.ts         # ファイルアップロード
│   │   ├── rateLimiting.ts       # レート制限
│   │   ├── requestControl.ts     # リクエスト制御
│   │   ├── securityHeaders.ts    # セキュリティヘッダー
│   │   └── validation.ts         # バリデーションミドルウェア
│   ├── types/                     # 型定義
│   │   ├── api/                  # API関連型
│   │   │   ├── query.ts          # クエリパラメータ型
│   │   │   ├── request.ts        # リクエスト型
│   │   │   └── response.ts      # レスポンス型
│   │   ├── utils/                # ユーティリティ型
│   │   │   ├── pagination.ts     # ページネーション型
│   │   │   └── validation.ts # バリデーションスキーマ
│   │   ├── auth.ts               # 認証関連型
│   │   ├── cart.ts               # カート関連型
│   │   ├── category.ts           # カテゴリ関連型
│   │   ├── common.ts             # 共通型
│   │   ├── file.ts               # ファイル関連型
│   │   ├── food.ts               # 商品関連型
│   │   ├── index.ts              # 型定義エクスポート
│   │   ├── inventory.ts          # 在庫関連型
│   │   ├── order.ts              # 注文関連型
│   │   ├── public.ts             # 公開API型
│   │   └── user.ts               # ユーザー関連型
│   ├── lib/                       # ライブラリ設定
│   │   ├── env.ts                # 環境変数管理
│   │   └── prisma.ts             # Prismaクライアント
│   ├── utils/                     # ユーティリティ関数
│   │   ├── fileValidator.ts      # ファイルバリデーター
│   │   └── simpleCache.ts       # シンプルキャッシュ
│   └── errors/                    # カスタムエラー
│       └── stockError.ts         # 在庫エラー
├── prisma/                        # データベーススキーマ
│   ├── schema.prisma             # Prismaスキーマ定義
│   └── seed.sql                  # シードデータ
├── storage/                       # ファイルストレージ
│   ├── private/                   # プライベートファイル
│   ├── public/                    # 公開ファイル
│   │   └── foods/                # 商品画像
│   └── temp/                      # 一時ファイル
├── scripts/                       # スクリプト
│   └── createTestUsers.ts       # テストユーザー作成
├── public/                        # 静的ファイル
│   └── food.svg                  # デフォルト画像
├── dist/                          # コンパイル済みファイル
├── Dockerfile                     # Docker設定
├── index.ts                         # エントリーポイント
├── package.json                   # プロジェクト設定
├── tsconfig.json                  # TypeScript設定
└── README.md                      # プロジェクト説明
```

## 主要機能

### 認証・認可
- JWTベースの認証システム
- アクセストークンとリフレッシュトークン
- 役割ベースアクセス制御
- パスワードハッシュ化

### 商品管理
- 商品のCRUD操作
- 在庫管理システム
- 楽観的ロックと悲観的ロック
- カテゴリ管理
- 画像アップロード

### ショッピングカート
- 永続的なカート機能
- 在庫予約システム
- カートサマリー計算

### 注文管理
- 注文作成と管理
- トランザクション処理
- 注文ステータス追跡
- 注文履歴管理

### セキュリティ機能
- レート制限
- リクエストサイズ制限
- セキュリティヘッダー
- CORS設定
- 入力バリデーション

## APIエンドポイント

### 認証
- `POST /api/users/auth/register` - ユーザー登録
- `POST /api/users/auth/login` - ログイン
- `POST /api/users/auth/logout` - ログアウト
- `POST /api/users/auth/refresh` - トークン更新
- `GET /api/users/profile` - プロフィール取得
- `PUT /api/users/profile` - プロフィール更新
- `POST /api/users/auth/change-password` - パスワード変更

### 商品
- `GET /api/foods` - 商品一覧取得
- `GET /api/foods/public` - 公開商品一覧
- `GET /api/foods/featured` - 注目商品取得
- `GET /api/foods/:id` - 商品詳細取得
- `GET /api/foods/category/:id` - カテゴリ別商品取得
- `POST /api/foods` - 商品作成（管理者）
- `PUT /api/foods/:id` - 商品更新（管理者）
- `DELETE /api/foods/:id` - 商品削除（管理者）

### カテゴリ
- `GET /api/categories` - カテゴリ一覧取得
- `GET /api/categories/active` - アクティブカテゴリ取得
- `GET /api/categories/:id` - カテゴリ詳細取得
- `GET /api/categories/:id/foods` - カテゴリ別商品取得
- `POST /api/categories` - カテゴリ作成（管理者）
- `PUT /api/categories/:id` - カテゴリ更新（管理者）
- `DELETE /api/categories/:id` - カテゴリ削除（管理者）

### カート
- `GET /api/carts` - カート取得
- `POST /api/carts/add` - 商品追加
- `PUT /api/carts/items/:id` - カートアイテム更新
- `DELETE /api/carts/items/:id` - カートアイテム削除
- `DELETE /api/carts/clear` - カートクリア
- `POST /api/carts/checkout` - チェックアウト

### 注文
- `GET /api/orders` - 注文一覧取得
- `GET /api/orders/:id` - 注文詳細取得
- `GET /api/orders/:id/history` - 注文履歴取得
- `PUT /api/orders/:id/cancel` - 注文キャンセル
- `GET /api/orders/admin` - 全注文取得（管理者）
- `GET /api/orders/admin/stats` - 注文統計（管理者）
- `PUT /api/orders/admin/:id/status` - 注文ステータス更新（管理者）

## インストール

### 前提条件
- Bun 1.0以上
- PostgreSQL 14以上
- Node.js 18以上（オプション）

### セットアップ手順

1. 依存関係のインストール
```bash
bun install
```

2. 環境変数の設定
`.env`ファイルを作成し、以下の変数を設定：

```env
DATABASE_URL="postgresql://user:password@localhost:5432/food_delivery"
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
PORT=5000
NODE_ENV=development
CORS_ALLOWED_ORIGINS="http://localhost:3000"
CORS_ALLOW_CREDENTIALS=true
```

3. データベースマイグレーション
```bash
bunx prisma migrate dev
```

4. シードデータの投入（オプション）
```bash
bunx prisma db seed
```

## 実行方法

### 開発環境
```bash
bun run dev
```

### 本番環境
```bash
bun run build
bun run start:prod
```

## アーキテクチャ

### 階層型アーキテクチャ
- **Routes**: ルーティング定義とミドルウェア適用
- **Controllers**: HTTPリクエストの処理とレスポンス返却
- **Services**: ビジネスロジックの実装
- **Models**: データベースアクセス（Prisma）

### 並行処理制御
- **楽観的ロック**: 在庫の手動更新など、競合が少ない操作
- **悲観的ロック**: 注文作成など、競合が頻発する操作

### トランザクション管理
複数テーブルにまたがる操作はPrismaのトランザクション機能で保護されています。

## セキュリティ

- JWT認証による安全なアクセス制御
- bcryptによるパスワードハッシュ化
- Zodによる入力バリデーション
- レート制限によるDoS攻撃対策
- セキュリティヘッダーによるXSS対策
- CORS設定によるクロスオリジンリクエスト制御

## テスト

### テストユーザー
- 管理者: `admin2025@example.com` / `admin@2025`
- 一般ユーザー: `jhon2025@example.com` / `jhon@2025`

### テストユーザー作成
```bash
bun run scripts/createTestUsers.ts
```

## 開発ガイド

### コードスタイル
- TypeScriptの厳格モードを使用
- 単行日文コメントを使用
- ESLintとPrettierによるコードフォーマット

### 型安全性
- すべてのAPIリクエストとレスポンスに型定義
- Zodスキーマによる実行時バリデーション
- Prismaによるデータベースアクセスの型安全性
