# 04-API統合仕様

> Food-Del-Dashboard と food-del-server 間のAPI通信仕様書

## 📋 目次

1. [API概要](#api概要)
2. [認証システム](#認証システム)
3. [エンドポイント一覧](#エンドポイント一覧)
4. [リクエスト・レスポンス形式](#リクエストレスポンス形式)
5. [エラーハンドリング](#エラーハンドリング)
6. [ファイルアップロード](#ファイルアップロード)
7. [ページネーション](#ページネーション)
8. [データ変換層](#データ変換層)

---

## 1. API概要

### 1.1 基本情報

```typescript
/**
 * APIベースURL設定
 * src/lib/apiConstants.ts
 */

// 開発環境
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// 本番環境（環境変数で設定）
// VITE_API_BASE_URL=https://api.food-del.com
```

### 1.2 HTTP Client設定

```typescript
/**
 * Axiosインスタンス設定
 * src/lib/httpClient.ts
 */

import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { API_BASE_URL, API_ENDPOINTS } from './apiConstants';

export const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,  // 10秒
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター: JWT Token自動付与
httpClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// レスポンスインターセプター: トークン自動更新
httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401エラー: トークン期限切れ
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();
        
        // リフレッシュトークンでアクセストークンを更新
        const response = await axios.post(
          `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        const { accessToken: newAccessToken, user } = response.data;
        
        // 新しいトークンを保存
        useAuthStore.getState().login(user, newAccessToken, refreshToken);

        // 元のリクエストを再試行
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return httpClient(originalRequest);
      } catch (refreshError) {
        // リフレッシュ失敗: ログアウト
        useAuthStore.getState().logout();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

---

## 2. 認証システム

### 2.1 認証フロー

```
┌─────────────┐
│ ユーザー     │
└──────┬──────┘
       │ 1. メール・パスワード入力
       ↓
┌──────────────────────┐
│ POST /api/auth/login  │
└──────┬───────────────┘
       │ 2. 認証情報を検証
       ↓
┌────────────────────────────┐
│ 成功レスポンス                │
│ {                            │
│   accessToken: "eyJhbG...",  │ ← 15分有効
│   refreshToken: "eyJhbG...", │ ← 7日有効
│   user: { id, name, role }  │
│ }                            │
└──────┬─────────────────────┘
       │ 3. トークンをlocalStorageに保存
       ↓
┌──────────────────────┐
│ Zustand authStore    │
└──────┬───────────────┘
       │ 4. 以降の全リクエストにAccessTokenを付与
       ↓
┌──────────────────────────┐
│ GET /api/foods/list       │
│ Headers:                  │
│   Authorization: Bearer eyJhbG... │
└───────────────────────────┘
```

### 2.2 トークン更新フロー

```
┌────────────────────────┐
│ API Request            │
│ (AccessToken期限切れ)   │
└──────┬─────────────────┘
       │
       ↓ 401 Unauthorized
┌──────────────────────────┐
│ Response Interceptor     │
└──────┬───────────────────┘
       │ 自動的にトークン更新を試行
       ↓
┌────────────────────────────┐
│ POST /api/auth/refresh     │
│ Body: { refreshToken }     │
└──────┬─────────────────────┘
       │
       ├─→ ✅ 成功: 新しいAccessToken取得
       │          │
       │          ↓ 元のリクエストを再実行
       │   ┌──────────────────────┐
       │   │ Retry Original Request│
       │   └──────────────────────┘
       │
       └─→ ❌ 失敗: RefreshToken無効
                  │
                  ↓ ログアウト処理
           ┌──────────────────┐
           │ Redirect to /login│
           └──────────────────┘
```

### 2.3 認証API

#### POST /api/auth/login
```typescript
// リクエスト
interface LoginRequest {
  email: string;
  password: string;
}

// レスポンス
interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
  };
}

// 使用例
import { useLogin } from '@/api';

function LoginPage() {
  const loginMutation = useLogin();

  const handleSubmit = async (data: LoginRequest) => {
    try {
      const response = await loginMutation.mutateAsync(data);
      console.log('Login successful:', response.user);
      // authStore.login() が自動的に呼ばれる
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

#### POST /api/auth/refresh
```typescript
// リクエスト
interface RefreshRequest {
  refreshToken: string;
}

// レスポンス
interface RefreshResponse {
  accessToken: string;
  refreshToken: string;  // 新しいRefreshTokenも返される
  user: User;
}

// 自動処理: httpClient.tsのインターセプターで自動実行
```

#### POST /api/auth/logout
```typescript
// リクエスト: Body不要（HeaderのAccessTokenから判定）

// レスポンス
interface LogoutResponse {
  success: boolean;
  message: string;
}

// 使用例
import { useLogout } from '@/api';

function Header() {
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    // authStore.logout() が自動的に呼ばれる
    // /login にリダイレクト
  };

  return <button onClick={handleLogout}>ログアウト</button>;
}
```

---

## 3. エンドポイント一覧

### 3.1 商品管理 (Foods)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|-----|
| GET | `/api/foods/list` | 商品一覧取得 | 全員 |
| GET | `/api/foods/detail/:id` | 商品詳細取得 | 全員 |
| POST | `/api/foods/create` | 商品作成 | ADMIN |
| PATCH | `/api/foods/update/:id` | 商品更新 | ADMIN |
| DELETE | `/api/foods/delete/:id` | 商品削除 | ADMIN |

#### GET /api/foods/list
```typescript
// クエリパラメータ
interface FoodListQuery {
  page?: number;           // デフォルト: 1
  limit?: number;          // デフォルト: 10
  search?: string;         // 商品名検索
  category_id?: number;    // カテゴリフィルタ
  status?: boolean;        // 公開状態フィルタ
}

// レスポンス
interface FoodListResponse {
  success: boolean;
  foods: Food[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

// 使用例
import { useFoods } from '@/api';

function FoodListPage() {
  const { data, isLoading } = useFoods({
    page: 1,
    limit: 20,
    search: 'ピザ',
    category_id: 3,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.foods.map(food => <FoodCard key={food.id} food={food} />)}
    </div>
  );
}
```

#### POST /api/foods/create
```typescript
// リクエスト (multipart/form-data)
interface CreateFoodRequest {
  name: string;
  description: string;
  price: number;
  category_id: number;
  status: boolean;
  image: File;  // 画像ファイル
}

// レスポンス
interface CreateFoodResponse {
  success: boolean;
  food: Food;
  message: string;
}

// 使用例
import { useCreateFood } from '@/api';

function FoodFormPage() {
  const createMutation = useCreateFood();

  const handleSubmit = async (data: CreateFoodRequest) => {
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', data.price.toString());
    formData.append('category_id', data.category_id.toString());
    formData.append('status', data.status.toString());
    formData.append('image', data.image);

    await createMutation.mutateAsync(formData);
  };

  return <DynamicForm config={foodFormConfig} onSubmit={handleSubmit} />;
}
```

### 3.2 注文管理 (Orders)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|-----|
| GET | `/api/orders/admin/list` | 注文一覧取得 | ADMIN |
| GET | `/api/orders/admin/detail/:id` | 注文詳細取得 | ADMIN |
| PATCH | `/api/orders/update-status/:id` | 注文ステータス更新 | ADMIN |
| GET | `/api/orders/admin/stats` | 注文統計取得 | ADMIN |

#### GET /api/orders/admin/list
```typescript
// クエリパラメータ
interface OrderListQuery {
  page?: number;
  limit?: number;
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';
  start_date?: string;  // ISO 8601形式
  end_date?: string;
}

// レスポンス
interface OrderListResponse {
  success: boolean;
  orders: Order[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
}

// Order型定義
interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  status: OrderStatus;
  deliveryAddress: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  items: OrderItem[];
}

interface OrderItem {
  id: number;
  foodId: number;
  quantity: number;
  price: number;
  food: {
    id: number;
    name: string;
    image: string;
  };
}
```

#### PATCH /api/orders/update-status/:id
```typescript
// リクエスト
interface UpdateOrderStatusRequest {
  status: OrderStatus;
  note?: string;  // 管理者メモ
}

// レスポンス
interface UpdateOrderStatusResponse {
  success: boolean;
  order: Order;
  message: string;
}

// 使用例
import { useUpdateOrderStatus } from '@/api';

function OrderDetailPage() {
  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    await updateStatusMutation.mutateAsync({
      id: orderId,
      status: newStatus,
      note: '配達準備完了',
    });
  };

  return <button onClick={() => handleStatusChange(123, 'PROCESSING')}>処理中にする</button>;
}
```

### 3.3 カテゴリ管理 (Categories)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|-----|
| GET | `/api/categories/list` | カテゴリ一覧取得 | 全員 |
| GET | `/api/categories/detail/:id` | カテゴリ詳細取得 | 全員 |
| POST | `/api/categories/create` | カテゴリ作成 | ADMIN |
| PATCH | `/api/categories/update/:id` | カテゴリ更新 | ADMIN |
| DELETE | `/api/categories/delete/:id` | カテゴリ削除 | ADMIN |

#### GET /api/categories/list
```typescript
// クエリパラメータ
interface CategoryListQuery {
  include_count?: boolean;  // 商品数を含めるか
}

// レスポンス
interface CategoryListResponse {
  success: boolean;
  categories: Category[];
}

interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    foods: number;  // include_count=trueの場合のみ
  };
}

// 使用例
import { useCategories } from '@/api';

function CategoryListPage() {
  const { data } = useCategories({ include_count: true });

  return (
    <div>
      {data?.categories.map(category => (
        <div key={category.id}>
          {category.name} ({category._count?.foods || 0}件)
        </div>
      ))}
    </div>
  );
}
```

### 3.4 ダッシュボード統計 (Dashboard)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|--------------|------|-----|
| GET | `/api/orders/admin/stats` | 注文統計 | ADMIN |
| GET | `/api/categories/list?include_count=true` | カテゴリ別商品数 | ADMIN |
| GET | `/api/foods/list?status=true` | 公開中商品数 | ADMIN |

#### GET /api/orders/admin/stats
```typescript
// レスポンス
interface OrderStatsResponse {
  success: boolean;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: {
      status: OrderStatus;
      count: number;
      percentage: number;
    }[];
    recentOrders: Order[];
    topProducts: {
      foodId: number;
      foodName: string;
      totalQuantity: number;
      totalRevenue: number;
    }[];
  };
}

// 使用例
import { useOrderStats } from '@/api';

function DashboardPage() {
  const { data } = useOrderStats();

  return (
    <div>
      <StatsCard
        title="総売上"
        value={`¥${data?.stats.totalRevenue.toLocaleString()}`}
      />
      <StatsCard
        title="注文数"
        value={data?.stats.totalOrders.toString()}
      />
    </div>
  );
}
```

---

## 4. リクエスト・レスポンス形式

### 4.1 共通ヘッダー

```typescript
// リクエストヘッダー
{
  "Content-Type": "application/json",           // JSON送信時
  "Content-Type": "multipart/form-data",        // ファイルアップロード時
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."  // 認証必須エンドポイント
}

// レスポンスヘッダー
{
  "Content-Type": "application/json; charset=utf-8",
  "X-Total-Count": "150",  // ページネーション時の総件数
  "X-Page": "1",           // 現在のページ
  "X-Per-Page": "10"       // 1ページあたりの件数
}
```

### 4.2 成功レスポンス

```typescript
// 標準的な成功レスポンス
interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

// 例: 商品取得成功
{
  "success": true,
  "food": {
    "id": 1,
    "name": "マルゲリータピザ",
    "price": 1200,
    "category": {
      "id": 3,
      "name": "ピザ"
    }
  },
  "message": "商品を取得しました"
}
```

### 4.3 エラーレスポンス

```typescript
// 標準的なエラーレスポンス
interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  details?: Record<string, string[]>;  // バリデーションエラー時
}

// 例1: 認証エラー (401)
{
  "success": false,
  "message": "認証トークンが無効です",
  "error": "Unauthorized"
}

// 例2: バリデーションエラー (400)
{
  "success": false,
  "message": "入力値が正しくありません",
  "error": "ValidationError",
  "details": {
    "name": ["商品名は必須です", "商品名は3文字以上必要です"],
    "price": ["価格は0より大きい必要があります"]
  }
}

// 例3: 権限エラー (403)
{
  "success": false,
  "message": "この操作を実行する権限がありません",
  "error": "Forbidden"
}

// 例4: Not Found (404)
{
  "success": false,
  "message": "指定された商品が見つかりません",
  "error": "NotFound"
}

// 例5: サーバーエラー (500)
{
  "success": false,
  "message": "サーバーエラーが発生しました",
  "error": "InternalServerError"
}
```

---

## 5. エラーハンドリング

### 5.1 HTTPステータスコード

| コード | 意味 | 処理 |
|-------|------|------|
| 200 | OK | 成功 |
| 201 | Created | リソース作成成功 |
| 400 | Bad Request | リクエストパラメータエラー → バリデーションメッセージ表示 |
| 401 | Unauthorized | 認証エラー → トークン更新試行 → 失敗ならログインページへ |
| 403 | Forbidden | 権限エラー → アクセス拒否メッセージ表示 |
| 404 | Not Found | リソース未検出 → 404ページ表示 |
| 422 | Unprocessable Entity | バリデーションエラー → フィールドエラー表示 |
| 500 | Internal Server Error | サーバーエラー → エラーページ表示 |

### 5.2 エラーハンドリング実装

```typescript
/**
 * src/lib/errorHandler.ts
 * 
 * API エラーハンドリングユーティリティ
 */

import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';

// エラーメッセージを抽出
export function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse;
    
    // サーバーからのエラーメッセージ
    if (data?.message) {
      return data.message;
    }
    
    // HTTPステータスベースのメッセージ
    switch (error.response?.status) {
      case 400:
        return '入力内容を確認してください';
      case 401:
        return '認証に失敗しました。再度ログインしてください';
      case 403:
        return 'この操作を実行する権限がありません';
      case 404:
        return '要求されたリソースが見つかりません';
      case 500:
        return 'サーバーエラーが発生しました。しばらくしてから再度お試しください';
      default:
        return 'エラーが発生しました';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return '不明なエラーが発生しました';
}

// バリデーションエラーを抽出
export function getValidationErrors(error: unknown): Record<string, string[]> | null {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ErrorResponse;
    return data?.details || null;
  }
  return null;
}

// 使用例: コンポーネント内
import { useMutation } from '@tanstack/react-query';
import { getErrorMessage, getValidationErrors } from '@/lib/errorHandler';

function FoodFormPage() {
  const createMutation = useCreateFood();

  const handleSubmit = async (data: CreateFoodRequest) => {
    try {
      await createMutation.mutateAsync(data);
      toast.success('商品を作成しました');
    } catch (error) {
      const message = getErrorMessage(error);
      const validationErrors = getValidationErrors(error);
      
      toast.error(message);
      
      if (validationErrors) {
        // フォームフィールドにエラー表示
        Object.entries(validationErrors).forEach(([field, errors]) => {
          form.setError(field, { message: errors.join(', ') });
        });
      }
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 6. ファイルアップロード

### 6.1 画像アップロード (商品画像)

```typescript
// POST /api/foods/create
// Content-Type: multipart/form-data

// フロントエンド実装
async function uploadFood(data: CreateFoodRequest) {
  const formData = new FormData();
  
  // テキストフィールド
  formData.append('name', data.name);
  formData.append('description', data.description);
  formData.append('price', data.price.toString());
  formData.append('category_id', data.category_id.toString());
  formData.append('status', data.status.toString());
  
  // 画像ファイル
  if (data.image) {
    formData.append('image', data.image);
  }
  
  // axios送信時はContent-Typeを自動設定（multipart/form-data）
  const response = await httpClient.post('/api/foods/create', formData);
  return response.data;
}

// React Hook Form との統合
import { useForm } from 'react-hook-form';

function FoodFormPage() {
  const { register, handleSubmit } = useForm<CreateFoodRequest>();
  const createMutation = useCreateFood();

  const onSubmit = async (data: CreateFoodRequest) => {
    const formData = new FormData();
    
    // ... フォームデータを構築
    
    // 画像ファイルはFileList[0]から取得
    const imageFile = data.image[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    await createMutation.mutateAsync(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input type="text" {...register('name')} />
      <input type="file" {...register('image')} accept="image/*" />
      <button type="submit">作成</button>
    </form>
  );
}
```

### 6.2 画像URL生成

```typescript
// サーバーから返される画像パス
{
  "image": "/uploads/food_1.png"
}

// フロントエンドでの画像URL生成
function getImageUrl(imagePath: string): string {
  if (imagePath.startsWith('http')) {
    return imagePath;  // 絶対URLの場合そのまま
  }
  return `${API_BASE_URL}${imagePath}`;  // 相対パスの場合ベースURL追加
}

// 使用例
<img src={getImageUrl(food.image)} alt={food.name} />
// → <img src="http://localhost:5000/uploads/food_1.png" alt="..." />
```

---

## 7. ページネーション

### 7.1 ページネーション形式

```typescript
// クエリパラメータ
interface PaginationQuery {
  page: number;      // 1始まり
  limit: number;     // 1ページあたりの件数（デフォルト: 10）
}

// レスポンス
interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    currentPage: number;      // 現在のページ
    totalPages: number;       // 総ページ数
    totalItems: number;       // 総アイテム数
    itemsPerPage: number;     // 1ページあたりの件数
    hasNextPage: boolean;     // 次ページ有無
    hasPrevPage: boolean;     // 前ページ有無
  };
}

// 使用例
const { data } = useFoods({ page: 1, limit: 20 });

// ページネーションコンポーネント
<Pagination
  currentPage={data?.pagination.currentPage}
  totalPages={data?.pagination.totalPages}
  onPageChange={(page) => setPage(page)}
/>
```

### 7.2 無限スクロール（将来実装）

```typescript
// TanStack Query の useInfiniteQuery を使用
import { useInfiniteQuery } from '@tanstack/react-query';

export const useInfiniteFoods = () => {
  return useInfiniteQuery({
    queryKey: ['foods', 'infinite'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await httpClient.get('/api/foods/list', {
        params: { page: pageParam, limit: 20 },
      });
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasNextPage) {
        return lastPage.pagination.currentPage + 1;
      }
      return undefined;
    },
  });
};

// 使用例
function InfiniteFoodList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteFoods();

  return (
    <div>
      {data?.pages.map((page) =>
        page.foods.map((food) => <FoodCard key={food.id} food={food} />)
      )}
      {hasNextPage && (
        <button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? '読み込み中...' : 'もっと見る'}
        </button>
      )}
    </div>
  );
}
```

---

## 8. データ変換層

### 8.1 APIレスポンス → UI型変換

```typescript
/**
 * ダッシュボード統計データの変換例
 * src/api/dashboardApi.ts
 */

// バックエンドレスポンス型
interface BackendOrderStats {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: {
    status: string;
    count: number;
    percentage: number;
  }[];
}

// フロントエンド表示用型
interface DashboardStats {
  totalOrders: string;          // "150件"
  totalRevenue: string;         // "¥1,500,000"
  averageOrderValue: string;    // "¥10,000"
  growthRate: string;           // "+12.5%"
}

// 変換関数
function transformToOverviewStats(backendData: BackendOrderStats): DashboardStats {
  return {
    totalOrders: `${backendData.totalOrders}件`,
    totalRevenue: `¥${backendData.totalRevenue.toLocaleString()}`,
    averageOrderValue: `¥${Math.round(backendData.averageOrderValue).toLocaleString()}`,
    growthRate: '+12.5%',  // TODO: 実際の成長率計算
  };
}

// TanStack Queryフック内で変換
export const useDashboardOverview = () => {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: async () => {
      const response = await httpClient.get<BackendOrderStats>(
        API_ENDPOINTS.ORDERS.ADMIN_STATS
      );
      
      // バックエンドデータをUI表示用に変換
      return transformToOverviewStats(response.data);
    },
    staleTime: 5 * 60 * 1000,
  });
};
```

### 8.2 日付フォーマット変換

```typescript
import { format, formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';

// ISO 8601形式 → ユーザー向け表示
function formatDate(isoString: string): string {
  return format(new Date(isoString), 'yyyy年MM月dd日 HH:mm', { locale: ja });
}

// 相対時間表示
function formatRelativeTime(isoString: string): string {
  return formatDistanceToNow(new Date(isoString), { addSuffix: true, locale: ja });
}

// 使用例
<p>作成日時: {formatDate(order.createdAt)}</p>
// → 作成日時: 2025年10月15日 14:30

<p>{formatRelativeTime(order.createdAt)}</p>
// → 約2時間前
```

### 8.3 価格フォーマット

```typescript
// 数値 → 通貨表示
function formatPrice(price: number): string {
  return `¥${price.toLocaleString('ja-JP')}`;
}

// 使用例
<p>{formatPrice(food.price)}</p>
// → ¥1,200
```

---

## 📚 参考資料

- [Axios公式ドキュメント](https://axios-http.com/)
- [TanStack Query公式ドキュメント](https://tanstack.com/query/latest)
- [MDN Web API Reference](https://developer.mozilla.org/ja/docs/Web/API)
- [REST API Design Best Practices](https://restfulapi.net/)

---

**最終更新**: 2025-10-15  
**バージョン**: 1.0.0
