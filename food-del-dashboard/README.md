# Food-Del-Dashboard

> フードデリバリーサービス管理者向けダッシュボード

食品配達サービスの管理者向けWebアプリケーション。商品管理、注文管理、売上統計、カテゴリ管理などの機能を提供します。

## 📋 目次

- [特徴](#特徴)
- [技術スタック](#技術スタック)
- [プロジェクト構造](#プロジェクト構造)
- [セットアップ](#セットアップ)
- [開発ガイド](#開発ガイド)
- [ビルドとデプロイ](#ビルドとデプロイ)
- [API統合](#api統合)
- [権限管理](#権限管理)

## ✨ 特徴

### 主要機能

- 📊 **リアルタイムダッシュボード** - 売上統計、注文状況、商品ランキングなどを可視化
- 🍔 **商品管理** - 商品の作成、編集、削除、画像アップロード対応
- 📦 **注文管理** - 注文一覧、詳細表示、ステータス更新（管理者専用）
- 🏷️ **カテゴリ管理** - カテゴリの作成、編集、削除（管理者専用）
- 🔐 **認証システム** - JWT双方向トークン認証、自動更新対応
- 👥 **権限制御** - ロールベースアクセス制御（RBAC）

### 技術的特徴

- ⚡ **高速開発環境** - Vite 7.1.3による爆速ビルド
- 🎯 **型安全** - TypeScript 5.9.2完全対応
- 🔄 **スマートキャッシング** - TanStack Query v5による自動キャッシュ管理
- 📦 **Barrel Export** - モジュール統一エクスポートによる簡潔な import
- 🎨 **モダンUI** - shadcn/ui + Tailwind CSS
- ♻️ **設定駆動CRUD** - 再利用可能な DataTable と DynamicForm

## 🛠 技術スタック

### フロントエンド

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| フレームワーク | React | 19.1.1 |
| 言語 | TypeScript | 5.9.2 |
| ビルドツール | Vite | 7.1.3 |
| ルーティング | React Router | 7.1.3 |
| 状態管理 | Zustand + TanStack Query | 5.62.11 + 5.62.7 |
| UIコンポーネント | shadcn/ui + Radix UI | latest |
| スタイリング | Tailwind CSS | 3.4.17 |
| HTTPクライアント | Axios | 1.7.9 |
| フォーム管理 | React Hook Form | 7.54.2 |
| 日付処理 | date-fns | 4.1.0 |
| チャート | Recharts | 2.15.0 |

### 開発ツール

- **パッケージマネージャー**: Bun 1.1.38
- **リンター**: ESLint 9.17.0
- **コードフォーマッター**: Prettier（VSCode拡張推奨）

## 📁 プロジェクト構造

```
food-del-dashboard/
├── src/
│   ├── api/                    # API通信層（Barrel Export）
│   │   ├── index.ts            # 統一エクスポート
│   │   ├── authApi.ts          # 認証API
│   │   ├── foodsApi.ts         # 商品API
│   │   ├── categoriesApi.ts    # カテゴリAPI
│   │   ├── ordersApi.ts        # 注文API
│   │   └── dashboardApi.ts     # 統計API
│   │
│   ├── components/             # コンポーネント層
│   │   ├── common/             # 共通コンポーネント（Barrel Export）
│   │   ├── dashboard/          # ダッシュボード専用（Barrel Export）
│   │   ├── layout/             # レイアウト（Barrel Export）
│   │   └── ui/                 # shadcn/ui基礎コンポーネント
│   │
│   ├── pages/                  # ページコンポーネント
│   │   ├── auth/               # 認証ページ（Barrel Export）
│   │   ├── dashboard/          # ダッシュボード（Barrel Export）
│   │   ├── foods/              # 商品管理（Barrel Export）
│   │   ├── orders/             # 注文管理（Barrel Export）
│   │   └── categories/         # カテゴリ管理（Barrel Export）
│   │
│   ├── hooks/                  # カスタムフック（Barrel Export）
│   ├── stores/                 # Zustand状態管理
│   ├── types/                  # TypeScript型定義（Barrel Export）
│   ├── lib/                    # ユーティリティ
│   ├── configs/                # 設定ファイル
│   ├── App.tsx                 # ルーティング設定
│   └── main.tsx                # エントリーポイント
│
├── docs/                       # 設計ドキュメント（11ファイル）
├── public/                     # 静的ファイル
└── README.md                   # このファイル
```

### 主要ディレクトリ説明

- **api/** - TanStack Query統合、全APIエンドポイント定義
- **components/common/** - DataTable、DynamicForm、ProtectedRouteなど再利用可能コンポーネント
- **components/dashboard/** - StatsCard、各種チャートコンポーネント
- **lib/httpClient.ts** - Axios設定、JWT自動付与、トークン更新処理
- **types/** - 全型定義（Auth, Food, Category, Order, Dashboard）

## 🚀 セットアップ

### 前提条件

- **Bun**: 1.1.0以上（推奨：最新版）
- **Node.js**: 20.0.0以上（Bunを使用しない場合）
- **food-del-server**: バックエンドサーバーが起動していること

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd food-del-dashboard

# 依存関係をインストール
bun install

# または npm/yarn
npm install
```

### 環境変数設定

プロジェクトルートに `.env` ファイルを作成（オプション）：

```env
VITE_API_BASE_URL=http://localhost:5000
```

> デフォルトでは `http://localhost:5000` が使用されます（`src/lib/apiConstants.ts`）

### 開発サーバー起動

```bash
# Bunを使用
bun run dev

# または npm
npm run dev
```

ブラウザで `http://localhost:3000` を開く

### デフォルトログイン情報

```
管理者アカウント:
Email: admin@example.com
Password: admin123

一般ユーザー:
Email: user@example.com
Password: user123
```

## 💻 開発ガイド

### Barrel Exportパターン

プロジェクト全体でBarrel Exportパターンを採用しています：

```typescript
// ❌ 修正前
import { useFood } from '@/api/foodsApi';
import StatsCard from '@/components/dashboard/StatsCard';

// ✅ 修正後（Barrel Export）
import { useFood } from '@/api';
import { StatsCard } from '@/components/dashboard';
```

### 新規ページ追加手順

1. **ページコンポーネント作成**
```bash
# src/pages/example/ExamplePage.tsx
```

2. **index.ts に追加**
```typescript
// src/pages/example/index.ts
export { default as ExamplePage } from './ExamplePage';
```

3. **ルーティング追加**
```typescript
// src/App.tsx
import { ExamplePage } from '@/pages/example';

<Route path="example" element={<ExamplePage />} />
```

### API追加手順

1. **型定義作成**
```typescript
// src/types/example.ts
export interface Example {
  id: number;
  name: string;
}
```

2. **API関数作成**
```typescript
// src/api/exampleApi.ts
import { useQuery } from '@tanstack/react-query';

export const useExamples = () => {
  return useQuery({
    queryKey: ['examples'],
    queryFn: async () => {
      const response = await httpClient.get('/api/examples');
      return response.data;
    },
  });
};
```

3. **index.ts に追加**
```typescript
// src/api/index.ts
export * from './exampleApi';
```

### コンポーネント開発ガイドライン

- **命名規則**: PascalCase（例: `UserProfile.tsx`）
- **フック命名**: `use` プレフィックス（例: `useAuth.ts`）
- **型定義**: インターフェース優先、必要に応じてtype使用
- **コメント**:
  - コンポーネント/クラス: 複数行の日本語コメント
  - 関数/メソッド: 単一行の日本語コメント

## 🔨 ビルドとデプロイ

### 本番ビルド

```bash
# TypeScriptチェック + Viteビルド
bun run build

# 出力先: dist/
```

### ビルド成果物

```
dist/
├── index.html           # エントリーHTML
├── assets/
│   ├── index-[hash].js  # バンドルJS（約1MB）
│   └── index-[hash].css # バンドルCSS（約28KB）
└── food.svg             # ファビコン
```

### プレビュー

```bash
bun run preview

# http://localhost:4173 で起動
```

### デプロイ推奨プラットフォーム

- **Vercel** - 推奨（自動デプロイ）
- **Netlify** - 簡単設定
- **Cloudflare Pages** - 高速CDN
- **Nginx** - 自前サーバー

### Nginx設定例

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/food-del-dashboard/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔌 API統合

### エンドポイント構成

全てのAPIエンドポイントは `src/lib/apiConstants.ts` で管理：

```typescript
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
  },
  FOODS: {
    LIST: '/api/foods/list',
    DETAIL: (id) => `/api/foods/detail/${id}`,
    CREATE: '/api/foods/create',
    UPDATE: (id) => `/api/foods/update/${id}`,
    DELETE: (id) => `/api/foods/delete/${id}`,
  },
  // ... 他のエンドポイント
};
```

### HTTPクライアント設定

`src/lib/httpClient.ts` でAxiosインスタンスを設定：

- **リクエストインターセプター**: JWT Tokenを自動付与
- **レスポンスインターセプター**: 401エラー時に自動トークン更新
- **タイムアウト**: 10秒

### TanStack Query設定

- **staleTime**:
  - Dashboard統計: 5分
  - 商品データ: 5分
  - 注文データ: 1分
- **cacheTime**: 10分（デフォルト）
- **refetchOnWindowFocus**: 有効

## 🔐 権限管理

### ロールベースアクセス制御（RBAC）

```typescript
// 管理者専用ルート
<Route
  path="orders"
  element={
    <ProtectedRoute requiredRoles={['ADMIN']}>
      <OrderListPage />
    </ProtectedRoute>
  }
/>

// ログイン必須（全ユーザー）
<Route
  path="foods"
  element={
    <ProtectedRoute>
      <FoodListPage />
    </ProtectedRoute>
  }
/>
```

### 権限レベル

| ロール | アクセス可能機能 |
|-------|----------------|
| **ADMIN** | 全機能（商品CRUD、注文管理、カテゴリ管理、統計） |
| **USER** | 商品閲覧、ダッシュボード閲覧 |
| **未認証** | ログインページのみ |

### トークン管理

- **accessToken**: 15分有効、API呼び出しに使用
- **refreshToken**: 7日有効、accessToken更新に使用
- **保存先**: localStorage（authStore経由）
- **自動更新**: 401エラー時に自動的にrefreshTokenで更新

## 📊 パフォーマンス最適化

### 実装済み最適化

- ✅ **コード分割**: React.lazy + Suspense（未実装、推奨）
- ✅ **画像最適化**: WebP対応、遅延読み込み
- ✅ **キャッシュ戦略**: TanStack Queryによるスマートキャッシング
- ✅ **Tree Shaking**: Viteによる自動最適化
- ✅ **CSS最小化**: Tailwind CSS purge機能

### 推奨改善事項

```typescript
// 動的インポートでコード分割（推奨）
const DashboardPage = lazy(() => import('@/pages/dashboard'));
const OrderListPage = lazy(() => import('@/pages/orders'));
```

## 🧪 テスト

### テスト構成（今後実装予定）

```bash
# 単体テスト
bun test

# E2Eテスト
bun run test:e2e

# カバレッジ
bun run test:coverage
```

## 📝 ドキュメント

プロジェクト内の `docs/` ディレクトリに詳細設計書があります：

1. プロジェクト概要とセットアップ
2. 詳細なTODOリスト
3. 基礎アーキテクチャ設計書
4. 配置化CRUD系統設計書
5. 商品管理機能詳細設計書
6. JSON-Server-テスト環境構築
7. API統合アーキテクチャ設計書
8. Dashboard統計機能詳細設計書
9. 前端認証システム統合設計書
10. 認証システムMockテスト指南
11. サーバー統合仕様書

## 🤝 貢献

プルリクエストを歓迎します！以下の手順に従ってください：

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add some amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。

## 👨‍💻 開発者

Food-Del Dashboard Development Team

## 🔗 関連リポジトリ

- **food-del-server**: バックエンドAPI（Bun + Prisma + PostgreSQL）
- **food-del-client**: ユーザー向けフロントエンド（React + TypeScript）

---

**最終更新**: 2025-10-15  
**バージョン**: 1.0.0  
**ステータス**: ✅ 本番準備完了
