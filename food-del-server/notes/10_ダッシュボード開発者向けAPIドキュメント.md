# 10. ダッシュボード開発者向けAPIドキュメント

## 1. 快速上手 (Quick Start)

### a. API基地址 (Base URL)

`https://your-api-domain.com/api`

### b. 認証フロー

ダッシュボードAPIの大部分は管理者権限を必要とします。

1.  **トークンの取得**: 管理者アカウントで `POST /users/auth/login` を呼び出し、`token` (Access Token) を取得します。
2.  **APIへのリクエスト**: 保護されたAPIを呼び出す際は、HTTPヘッダーに `Authorization` を追加します。

    ```http
    Authorization: Bearer <ここに管理者のAccess Tokenを挿入>
    ```
3.  **トークンのリフレッシュ**: クライアント向けドキュメントの「トークンのリフレッシュ」セクションを参照してください。フローは同じです。

### c. 通用レスポンス形式

クライアント向けドキュメントの「通用レスポンス形式」セクションを参照してください。形式は同じです。

---

## 2. 核心用例フロー (Core Use Case Flows)

### a. 用例：新しい商品を登録する

1.  **カテゴリリストの取得**: 商品登録フォームの「カテゴリ選択」ドロップダウンを生成するために、APIを呼び出します。
    -   `GET /api/categories`
2.  **フォームの送信**: 管理者がフォームに商品情報を入力し、画像をアップロードして「保存」をクリックします。
    -   リクエストは `multipart/form-data` 形式で送信します。
    -   `POST /api/foods`
3.  **商品リストの更新**: 成功レスポンスを受け取ったら、ダッシュボードの商品リストを更新して新しい商品が表示されることを確認します。
    -   `GET /api/foods/dashboard/all`

### b. 用例：注文のステータスを「準備中」から「配送中」に更新する

1.  **注文詳細の取得**: 管理者が注文管理ページで特定の注文（例: ID `123`）をクリックします。
    -   `GET /api/orders/admin/123`
2.  **ステータスの更新**: 管理者が「配送中にする」ボタンをクリックします。
    -   `PUT /api/orders/admin/123/status`
    -   **Body**: `{ "status": "delivery", "note": "配送担当者Aが配達中です" }`
3.  **表示の更新**: 成功レスポンスを受け取ったら、UI上の注文ステータスを更新します。

---

## 3. APIエンドポイント詳解

*このセクションの全てのAPIは `[管理者要]` です。*

### 認証 (`/users`)
- `POST /auth/login`: 管理者アカウントでログインし、JWTを取得する。

### カテゴリ管理 (`/categories`)
- `GET /`: 全てのカテゴリのリストを取得する。
- `POST /`: 新しいカテゴリを作成する。
- `PUT /:id`: カテゴリ情報を更新する。
- `PATCH /:id/status`: カテゴリの有効状態を更新する。
- `DELETE /:id`: カテゴリを削除する。

### 商品管理 (`/foods`)
- `GET /dashboard/all`: 全ての商品リスト（非公開含む）を取得する。
- `POST /`: 新しい商品を画像付きで作成する。
- `PUT /:id`: 商品情報を更新する。
- `DELETE /:id`: 商品をソフトデリートする（ステータスを`false`に更新）。

### 注文管理 (`/orders`)
- `GET /admin/stats`: 注文の統計情報（総売上、注文件数など）を取得する。
- `GET /admin`: 全てのユーザーの注文リストをページネーションで取得する。
- `GET /admin/:id`: 任意の注文の詳細情報を取得する。
- `GET /admin/:id/history`: 任意の注文のステータス変更履歴を取得する。
- `PUT /admin/:id/status`: 注文のステータスを更新する。

---

## 4. 核心データモデル (Core Data Models)

ダッシュボードAPIから返される主要なデータオブジェクトの例です。

### Food (商品情報 - 完全版)
```json
{
  "id": 101,
  "name": "シーフードピザ",
  "description": "エビ、イカ、アサリをふんだんに使った海の幸のピザ。",
  "price": 2200,
  "image_path": "/files/public/seafood_pizza.png",
  "status": true,
  "stock": 50,         // 物理在庫
  "reserved": 5,       // 予約在庫
  "min_stock": 10,       // 最小在庫閾値
  "version": 3,          // 楽観的ロック用バージョン
  "created_at": "2025-10-06T10:00:00.000Z",
  "updated_at": "2025-10-06T11:00:00.000Z",
  "category": {
    "id": 1,
    "name": "ピザ"
  }
}
```

### AdminOrderPreview (管理者向け注文リストのアイテム)
```json
{
  "id": 201,
  "total_amount": 4400,
  "status": "preparing",
  "delivery_address": "東京都渋谷区...",
  "order_date": "2025-10-06T12:00:00.000Z",
  "items_preview": [
    { "food_name": "シーフードピザ", "quantity": 2, "image_path": "..." }
  ],
  "user": { // この注文を行ったユーザーの情報
    "id": 42,
    "name": "山田太郎",
    "email": "yamada@example.com",
    "phone": "090-1234-5678"
  }
}
```

### OrderStatsData (注文統計)
```json
{
  "total_orders": 1500,
  "total_revenue": 3450000,
  "status_breakdown": {
    "pending": 10,
    "confirmed": 25,
    "preparing": 30,
    "delivery": 15,
    "completed": 1400,
    "cancelled": 20
  },
  "recent_orders": [ ... ] // 直近の完全なOrderDataオブジェクトの配列
}
```
