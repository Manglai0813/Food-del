# Food Delivery Client

> React + TypeScript + Vite で構築された現代的なフードデリバリープラットフォームのフロントエンドアプリケーション

## 技術スタック

- **フレームワーク**: React 19.1.1
- **言語**: TypeScript 5.8.3
- **ビルドツール**: Vite 7.1.7
- **UIコンポーネントライブラリ**: shadcn/ui + Radix UI
- **スタイリング**: Tailwind CSS 3.4.18
- **状態管理**: Zustand 5.0.2
- **データフェッチング**: TanStack Query (React Query) 5.62.8
- **ルーティング**: React Router 7.1.1
- **バリデーション**: Zod 3.24.1
- **HTTPクライアント**: Axios 1.7.9
- **日付処理**: date-fns 4.1.0
- **通知**: react-hot-toast 2.4.1

## プロジェクト機能

### ユーザー機能
- ✅ ユーザー登録/ログイン（JWT認証）
- ✅ 商品閲覧（カテゴリフィルター + ページネーション）
- ✅ カート管理（追加/更新/削除/クリア）
- ✅ 注文作成と支払い
- ✅ 注文履歴表示
- ✅ 注文キャンセル機能

### UI/UX機能
- ✅ モダンなカードデザイン
- ✅ レスポンシブレイアウト（モバイルファースト）
- ✅ ハンバーガーメニュー + サイドバーナビゲーション（モバイル）
- ✅ ブラー背景のダイアログ/モーダル
- ✅ 統一された角丸デザイン（0.75rem）
- ✅ Toastエラー/成功通知
- ✅ スケルトンローディング状態
- ✅ スムーズなページ遷移アニメーション

### 技術ハイライト
- ✅ 完全なTypeScript型システム
- ✅ 統一されたモジュールエクスポートパターン（index.ts）
- ✅ オプティミスティックアップデート
- ✅ React Queryキャッシュ戦略
- ✅ コード分割と遅延ロード
- ✅ カスタムフック抽象化
- ✅ Zustand永続化ストレージ

## プロジェクト構造

```
src/
├── api/                    # APIサービス層
│   ├── client.ts          # Axios封装（シングルトンパターン）
│   ├── auth.api.ts        # 認証API
│   ├── food.api.ts        # 食品API
│   ├── cart.api.ts        # カートAPI
│   ├── order.api.ts       # 注文API
│   ├── category.api.ts    # カテゴリAPI
│   └── index.ts           # 統一エクスポート
├── components/            # コンポーネント
│   ├── auth/             # 認証コンポーネント（ログインポップアップ）
│   ├── common/           # 共通コンポーネント（Toast、Loading、Pagination）
│   ├── food/             # 食品関連コンポーネント
│   ├── layout/           # レイアウトコンポーネント（Navbar、Footer、Banner）
│   └── ui/               # shadcn/uiコンポーネントライブラリ
├── hooks/                # カスタムフック
│   ├── useAuth.ts        # 認証フック
│   ├── useFood.ts        # 食品フック
│   ├── useCart.ts        # カートフック
│   ├── useOrder.ts       # 注文フック
│   ├── useCategory.ts    # カテゴリフック
│   └── index.ts          # 統一エクスポート
├── stores/               # Zustand状態管理
│   ├── auth.ts           # 認証状態
│   ├── cart.ts           # カート状態
│   ├── ui.ts             # UI状態
│   ├── preferences.ts    # ユーザー設定
│   └── index.ts          # 統一エクスポート
├── pages/                # ページコンポーネント
│   ├── food/             # ホーム関連
│   ├── cart/             # カートページ
│   ├── order/            # 注文関連ページ
│   └── index.ts          # 統一エクスポート
├── types/                # TypeScript型定義
│   ├── api.types.ts      # API共通型
│   ├── auth.types.ts     # 認証型
│   ├── food.types.ts     # 食品型
│   ├── cart.types.ts     # カート型
│   ├── order.types.ts    # 注文型
│   ├── category.types.ts # カテゴリ型
│   └── index.ts          # 統一エクスポート
├── lib/                  # ライブラリ
│   ├── constants.ts      # 定数定義
│   ├── queryClient.ts    # React Query設定
│   ├── toast.ts          # Toastユーティリティ関数
│   ├── utils.ts          # shadcn/uiユーティリティ関数
│   └── index.ts          # 統一エクスポート
├── utils/                # ビジネスユーティリティ関数
│   ├── format.ts         # フォーマット関数
│   ├── validation.ts     # バリデーション関数
│   ├── helpers.ts        # ヘルパー関数
│   ├── calculations.ts   # 計算関数
│   └── index.ts          # 統一エクスポート
├── providers/            # Context Providers
│   ├── AuthProvider.tsx  # 認証プロバイダー
│   └── index.ts          # 統一エクスポート
├── assets/               # 静的リソース
├── styles/               # グローバルスタイル
└── App.tsx               # アプリケーションエントリー
```

## セットアップ

### 必要環境

- Node.js >= 18.0.0
- npm >= 9.0.0

### 依存関係のインストール

```bash
npm install
```

### 環境変数の設定

`.env` ファイルを作成：

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_NAME=Food Delivery
```

### 開発モード

```bash
npm run dev
```

`http://localhost:3000` にアクセス

### プロダクションビルド

```bash
npm run build
```

### プロダクションプレビュー

```bash
npm run preview
```

### コードチェック

```bash
npm run lint
```

## Tailwind ブレークポイントシステム

プロジェクトは**反転ブレークポイントシステム**を使用：

```js
screens: {
  mobile: '750px',   // >= 750px で有効
  tablet: '1024px',  // >= 1024px で有効
  desktop: '1280px', // >= 1280px で有効
}
```

**使用例：**

```tsx
// デフォルトは小画面スタイル、大画面では mobile: スタイル適用
<div className="text-sm mobile:text-base desktop:text-lg">
  レスポンシブテキスト
</div>
```

## API統合

バックエンドAPIアドレスは `src/api/client.ts` で設定：

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
```

### APIエンドポイント

- `POST /api/auth/register` - ユーザー登録
- `POST /api/auth/login` - ユーザーログイン
- `GET /api/auth/profile` - ユーザー情報取得
- `GET /api/foods` - 商品リスト取得
- `GET /api/foods/:id` - 商品詳細取得
- `GET /api/categories` - カテゴリリスト取得
- `GET /api/cart` - カート取得
- `POST /api/cart/items` - カート商品追加
- `PUT /api/cart/items/:id` - カート商品更新
- `DELETE /api/cart/items/:id` - カート商品削除
- `DELETE /api/cart` - カートクリア
- `GET /api/orders` - 注文リスト取得
- `POST /api/orders` - 注文作成
- `PUT /api/orders/:id/cancel` - 注文キャンセル

## 状態管理

### Zustand ストア

```typescript
// 認証状態
const { user, login, logout } = useAuthStore();

// カート状態
const { cartData, addToCart, updateQuantity, removeItem } = useCartStore();

// UI状態
const { isLoading, showModal, hideModal } = useUIStore();
```

### React Query フック

```typescript
// 食品リスト取得
const { data, isLoading } = usePublicFoods({ category_id, page });

// 注文履歴取得
const { data: orders } = useOrders();

// カートに追加
const { mutate: addToCart } = useAddToCart();
```

## コーディング規約

### モジュールエクスポート規約

すべてのモジュールはディレクトリレベルの `index.ts` を通じて統一エクスポート：

```typescript
// ✅ 正しい
import { authService } from '@/api';
import { useAuth } from '@/hooks';
import { Button } from '@/components/layout';

// ❌ 間違い
import { authService } from '@/api/auth.api';
import { useAuth } from '@/hooks/useAuth';
```

### コンポーネント規約

```typescript
// 関数コンポーネント + TypeScript を使用
export const MyComponent: React.FC<Props> = ({ prop1, prop2 }) => {
  return <div>...</div>;
};
```

### フック規約

```typescript
// カスタムフックは use で始める必要があります
export const useMyCustomHook = () => {
  // フックロジック
  return { data, loading, error };
};
```

## パフォーマンス最適化

- ✅ React Query 自動キャッシュと再検証
- ✅ コンポーネント遅延ロード（React.lazy + Suspense）
- ✅ 画像遅延ロード
- ✅ 仮想スクロール（ページネーション）
- ✅ デバウンスとスロットル
- ✅ オプティミスティックアップデートで待ち時間削減

## ブラウザサポート

- Chrome >= 90
- Firefox >= 88
- Safari >= 14
- Edge >= 90

## 推奨開発ツール

- **VSCode拡張機能**:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)
  - Error Lens

## トラブルシューティング

### よくある問題

1. **ポートが使用中**
   ```bash
   # ポート変更
   vite --port 3001
   ```

2. **API接続失敗**
   - `.env` の `VITE_API_BASE_URL` を確認
   - バックエンドサービスが起動していることを確認

3. **型エラー**
   ```bash
   # 型を再生成
   npm run build
   ```

## ライセンス

MIT License

## 更新履歴

### v1.0.0 (2025-10-11)

#### 新機能
- ✅ 完全なユーザー認証システム
- ✅ 商品閲覧とカテゴリフィルター
- ✅ カート完全機能
- ✅ 注文作成と管理
- ✅ 注文キャンセル機能
- ✅ モバイルレスポンシブデザイン

#### UI改善
- ✅ カートページのリファクタリング（shadcn/ui Card デザイン）
- ✅ チェックアウトページのリファクタリング（モダンデザイン）
- ✅ 注文成功ページのリファクタリング
- ✅ マイオーダーページの作成
- ✅ モバイルハンバーガーメニューの追加
- ✅ ブラー背景効果の統一
- ✅ 角丸を0.75remに統一
- ✅ 小画面でのメニュー表示最適化

#### 技術改善
- ✅ モジュールエクスポートパターンの統一（すべてのindex.ts）
- ✅ formatPrice重複定義の修正
- ✅ Toastエラー通知の追加
- ✅ 画像サイズの最適化
- ✅ オプティミスティックアップデートの実装
- ✅ 注文データ表示問題の修正

---

**最終更新**: 2025年10月11日
