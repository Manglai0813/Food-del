# バックエンドAPI対応

## 概要
本ドキュメントは、フロントエンドとバックエンドAPI間の型定義対応関係と、通信仕様について説明します。

## API エンドポイント対応表

### 認証関連API
| エンドポイント | メソッド | フロントエンド型 | バックエンド型 |
|--------------|---------|----------------|---------------|
| `/api/auth/login` | POST | `LoginRequest` → `AuthResponse` | `LoginDto` → `AuthResult` |
| `/api/auth/register` | POST | `RegisterRequest` → `AuthResponse` | `RegisterDto` → `AuthResult` |
| `/api/auth/refresh` | POST | `RefreshTokenRequest` → Token | `RefreshDto` → `TokenResult` |
| `/api/auth/profile` | GET | - → `User` | - → `UserProfile` |
| `/api/auth/profile` | PUT | `UpdateProfileRequest` → `User` | `UpdateProfileDto` → `UserProfile` |

### 食品関連API
| エンドポイント | メソッド | フロントエンド型 | バックエンド型 |
|--------------|---------|----------------|---------------|
| `/api/foods` | GET | Query params → `PaginatedResponse<Food>` | `FoodQueryDto` → `PaginatedResult<Food>` |
| `/api/foods/:id` | GET | - → `ApiResponse<Food>` | - → `ApiResult<Food>` |
| `/api/foods` | POST | `CreateFoodRequest` → `ApiResponse<Food>` | `CreateFoodDto` → `ApiResult<Food>` |
| `/api/foods/:id` | PUT | `UpdateFoodRequest` → `ApiResponse<Food>` | `UpdateFoodDto` → `ApiResult<Food>` |
| `/api/foods/:id/inventory` | PUT | `UpdateInventoryRequest` → `ApiResponse<Food>` | `UpdateInventoryDto` → `ApiResult<Food>` |

### カート関連API
| エンドポイント | メソッド | フロントエンド型 | バックエンド型 |
|--------------|---------|----------------|---------------|
| `/api/cart` | GET | - → `ApiResponse<CartSummary>` | - → `ApiResult<CartData>` |
| `/api/cart/items` | POST | `AddToCartRequest` → `ApiResponse<CartItem>` | `AddCartItemDto` → `ApiResult<CartItem>` |
| `/api/cart/items/:id` | PUT | `UpdateCartItemRequest` → `ApiResponse<CartItem>` | `UpdateCartItemDto` → `ApiResult<CartItem>` |
| `/api/cart/items/:id` | DELETE | - → `ApiResponse<void>` | - → `ApiResult<void>` |
| `/api/cart/check` | POST | - → `ApiResponse<CartAvailabilityCheck>` | - → `ApiResult<AvailabilityResult>` |

### 注文関連API
| エンドポイント | メソッド | フロントエンド型 | バックエンド型 |
|--------------|---------|----------------|---------------|
| `/api/orders` | GET | Query params → `PaginatedResponse<Order>` | `OrderQueryDto` → `PaginatedResult<Order>` |
| `/api/orders/:id` | GET | - → `ApiResponse<Order>` | - → `ApiResult<Order>` |
| `/api/orders` | POST | `CreateOrderRequest` → `ApiResponse<Order>` | `CreateOrderDto` → `ApiResult<Order>` |
| `/api/orders/:id` | PUT | `UpdateOrderRequest` → `ApiResponse<Order>` | `UpdateOrderDto` → `ApiResult<Order>` |

### カテゴリ関連API
| エンドポイント | メソッド | フロントエンド型 | バックエンド型 |
|--------------|---------|----------------|---------------|
| `/api/categories` | GET | - → `ApiResponse<Category[]>` | - → `ApiResult<Category[]>` |
| `/api/categories/:id` | GET | - → `ApiResponse<Category>` | - → `ApiResult<Category>` |
| `/api/categories` | POST | `CreateCategoryRequest` → `ApiResponse<Category>` | `CreateCategoryDto` → `ApiResult<Category>` |

## レスポンス形式対応

### バックエンド `common.ts` → フロントエンド `api.ts`
```typescript
// バックエンド
export interface ApiResult<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

// フロントエンド (対応)
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}
```

### ページネーション対応
```typescript
// バックエンド
export interface PaginatedResult<T> extends ApiResult<T[]> {
  pagination: PaginationMeta;
}

// フロントエンド (対応)
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

## 型同期チェックリスト

### 認証システム
- [x] User基本情報の同期
- [x] 認証トークン形式の対応
- [x] ロール・権限システムの整合性
- [x] プロフィール更新フィールドの対応

### 食品管理システム
- [x] 食品基本情報の同期
- [x] カテゴリ関係の対応
- [x] 在庫管理フィールドの同期
- [x] オプティミスティックロック対応
- [x] 栄養情報・アレルギー情報の同期

### カート機能
- [x] カートアイテム構造の対応
- [x] 計算ロジック（税金・配送料）の同期
- [x] 在庫チェック機能の対応
- [x] 特別指示フィールドの同期

### 注文システム
- [x] 注文ステータスの同期
- [x] 配送情報フィールドの対応
- [x] 支払い方法の同期
- [x] 注文履歴・状態遷移の対応

## HTTP通信設定

### 基本設定
```typescript
// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// 共通ヘッダー
const defaultHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};
```

### 認証ヘッダー
```typescript
// JWT Bearer Token
const authHeaders = {
  'Authorization': `Bearer ${accessToken}`,
};
```

### エラーハンドリング対応
```typescript
// バックエンドエラー形式
interface BackendError {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
  statusCode?: number;
}

// フロントエンドエラー型
export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  code?: string;
  statusCode?: number;
}
```

## データ検証

### リクエストデータ検証
```typescript
// Zodスキーマでバックエンド要求仕様に対応
export const createFoodSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  price: z.number().positive(),
  categoryId: z.string().uuid(),
  tags: z.array(z.string()).max(10),
  allergens: z.array(z.string()).max(20),
});
```

### レスポンスデータ検証
```typescript
// APIレスポンスの型ガード
function isApiResponse<T>(data: unknown): data is ApiResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'message' in data &&
    typeof (data as any).success === 'boolean' &&
    typeof (data as any).message === 'string'
  );
}
```

## 開発時の同期確認手順

### 1. 型定義の更新確認
```bash
# バックエンド型定義の最新確認
cd ../food-del-server
git log --oneline src/types/

# フロントエンド型定義の更新
cd food-del-client-v2
# 手動で型定義を同期
```

### 2. API仕様の確認
```bash
# バックエンドのAPIルート確認
cd ../food-del-server
grep -r "router\." src/routes/

# Swaggerドキュメントの確認（もしあれば）
bun run docs
```

### 3. 統合テスト
```typescript
// API通信テスト例
describe('Food API Integration', () => {
  it('should match backend response format', async () => {
    const response = await foodService.getAll();
    expect(response).toMatchObject({
      success: true,
      message: expect.any(String),
      data: expect.any(Array),
    });
  });
});
```

## 今後の維持管理

### 1. 定期同期チェック
- 週次でのバックエンド型定義確認
- 新機能追加時の型定義同期
- APIエンドポイントの変更追跡

### 2. 自動化の検討
- 型定義の自動生成ツール導入
- APIスキーマの自動検証
- 統合テストの自動実行

### 3. ドキュメント更新
- API変更履歴の記録
- 型定義変更ログの管理
- 開発者向けガイドの更新