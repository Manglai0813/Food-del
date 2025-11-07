# 09. クライアント開発者向けAPIドキュメント

## 1. 快速上手 (Quick Start)

### a. API基地址 (Base URL)

すべてのAPIリクエストのベースURLは以下の通りです。

`https://your-api-domain.com/api`

### b. 認証フロー

当APIはJWT（JSON Web Token）を使用した認証方式を採用しています。

1.  **トークンの取得**: `POST /users/auth/login` または `POST /users/auth/register` を呼び出し、成功レスポンスから `token` (Access Token) と `refreshToken` を取得します。
2.  **APIへのリクエスト**: 保護されたAPI（例: `GET /profile`）を呼び出す際は、HTTPヘッダーに `Authorization` を追加します。

    ```http
    Authorization: Bearer <ここにAccess Tokenを挿入>
    ```

3.  **トークンのリフレッシュ**: Access Tokenの有効期限が切れると、APIは `401 Unauthorized` ステータスと `code: "TOKEN_EXPIRED"` を返します。このエラーを受け取ったら、以下のリクエストを自動的に送信してください。
    -   **リクエスト**: `POST /users/auth/refresh`
    -   **リクエストボディ**: `{ "refreshToken": "<ここにRefresh Tokenを挿入>" }`
    -   成功すると、レスポンスとして新しい `token` と `refreshToken` が返されます。これらをローカルに保存し、元のAPIリクエストを再試行してください。

### c. 通用レスポンス形式

すべてのAPIレスポンスは、以下の標準的なJSON形式に従います。

```json
{
  "success": true, // または false
  "message": "処理結果のメッセージ",
  "data": { ... }, // 成功時に返されるデータオブジェクト
  "errors": ["エラーの詳細"], // 失敗時に返されるエラー配列
  "pagination": { ... } // リスト取得時に返されるページネーション情報
}
```

---

## 2. 核心用例フロー (Core Use Case Flows)

### a. 用例：ユーザーが商品をカートに追加し、注文を完了する

1.  **商品をカートに追加**: ユーザーが商品詳細ページで「カートに追加」をクリックします。
    -   `POST /api/carts/add`
    -   **Body**: `{ "food_id": 123, "quantity": 2 }`
2.  **カートページを表示**: ユーザーがカートページに移動します。
    -   `GET /api/carts`
    -   レスポンスの `data` を使用して、カート内の商品リスト、合計金額などを表示します。
3.  **注文を確定**: ユーザーが配送先住所などを入力し、「注文確定」をクリックします。
    -   `POST /api/orders`
    -   **Body**: `{ "delivery_address": "東京都渋谷区...", "phone": "090-1234-5678" }`
4.  **注文完了ページへ**: サーバーから成功レスポンス（HTTP 201）と新しく作成された注文データが返されます。
    -   レスポンス内の `data.id` （注文ID）を取得し、ユーザーを注文詳細ページ（例: `/orders/456`）にリダイレクトします。

---

## 3. APIエンドポイント詳解

*`[認証要]` が付いているエンドポイントは、有効なAccess Tokenが必要です。*

### 認証 (`/users`)
- `POST /auth/register`: ユーザーを新規登録する。
- `POST /auth/login`: ログインし、JWTを取得する。
- `POST /auth/refresh`: 新しいアクセストークンを取得する。

### ユーザー個人情報 (`/users`)
- `GET /profile`: `[認証要]` 自身のプロフィール情報を取得する。
- `PUT /profile`: `[認証要]` 自身のプロフィール情報を更新する。
- `POST /auth/change-password`: `[認証要]` パスワードを変更する。

### 商品とカテゴリの閲覧 (`/categories`, `/foods`)
- `GET /categories`: 全てのカテゴリのリストを取得する。
- `GET /categories/:id/foods`: 指定したカテゴリに属する商品リストを取得する。
- `GET /foods`: 商品のリストをページネーションで取得する。
- `GET /foods/:id`: 指定したIDの商品詳細を取得する。
- `GET /foods/featured`: 注目の商品リストを取得する。

### カート (`/carts`)
- `GET /`: `[認証要]` 現在のカート情報を取得する。
- `POST /add`: `[認証要]` カートに商品を追加する。
- `PUT /items/:id`: `[認証要]` カート内の商品の数量を更新する。
- `DELETE /items/:id`: `[認証要]` カートから商品を削除する。
- `DELETE /clear`: `[認証要]` カートを空にする。

### 注文 (`/orders`)
- `POST /`: `[認証要]` カート内容から注文を作成する。
- `GET /`: `[認証要]` 自身の注文履歴リストを取得する。
- `GET /:id`: `[認証要]` 自身の特定の注文詳細を取得する。
- `PUT /:id/cancel`: `[認証要]` 自身の注文をキャンセルする。

---

## 4. 核心データモデル (Core Data Models)

APIから返される主要なデータオブジェクトの例です。

### PublicFoodWithCategory (商品情報)
```json
{
  "id": 101,
  "name": "シーフードピザ",
  "description": "エビ、イカ、アサリをふんだんに使った海の幸のピザ。",
  "price": 2200,
  "image_path": "/files/public/seafood_pizza.png",
  "status": true,
  "category": {
    "id": 1,
    "name": "ピザ",
    "description": "本格的なイタリアンピザ。"
  }
}
```
*注意: 在庫数などの内部情報は含まれません。*

### CartData (カート情報)
```json
{
  "id": 1,
  "user_id": 42,
  "cart_items": [
    {
      "id": 1,
      "cart_id": 1,
      "food_id": 101,
      "quantity": 2,
      "food": { ... } // 上記の PublicFoodWithCategory オブジェクト
    }
  ],
  "summary": {
    "totalItems": 2,       // 商品の総数量
    "totalAmount": 4400,   // 合計金額
    "itemCount": 1         // カート内の商品の種類数
  }
}
```

### OrderData (注文情報)
```json
{
  "id": 201,
  "user_id": 42,
  "total_amount": 4400,
  "status": "pending", // pending, confirmed, preparing, delivery, completed, cancelled
  "delivery_address": "東京都渋谷区...",
  "phone": "090-1234-5678",
  "order_date": "2025-10-06T12:00:00.000Z",
  "items": [
    {
      "id": 301,
      "order_id": 201,
      "food_id": 101,
      "quantity": 2,
      "price": 2200, // 注文時点での価格（スナップショット）
      "food": { ... } // PublicFoodWithCategory オブジェクト
    }
  ]
}
```
