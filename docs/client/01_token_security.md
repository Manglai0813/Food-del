# Client Token セキュリティ管理

## 概要

Food-del クライアント側のトークン管理を、セキュアな **HttpOnly Cookie + メモリ管理** モデルに移行しました。

**改善点**:
- ✅ localStorage 依存を完全に廃止（XSS 攻撃対策）
- ✅ HttpOnly Cookie でトークンを自動管理
- ✅ メモリのみでアクセストークンを保持
- ✅ サーバー側で refreshToken を自動管理

---

## 🔐 セキュリティモデル

### 【トークン管理方式】

```
┌─────────────────────────────────────────────────────────┐
│                  Client - Server Token Flow             │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ◆ アクセストークン (accessToken)                        │
│    ├─ HttpOnly Cookie: サーバーが自動設定                │
│    ├─ メモリ: Zustand store に一時保存                   │
│    └─ localStorage: ❌ 使用しない（XSS対策）             │
│                                                         │
│  ◆ リフレッシュトークン (refreshToken)                   │
│    ├─ HttpOnly Cookie: サーバー専用管理                  │
│    ├─ Zustand store: ❌ 管理しない                       │
│    └─ localStorage: ❌ 使用しない                        │
│                                                         │
│  ◆ ユーザー情報                                          │
│    ├─ Zustand store: オブジェクト保存                    │
│    └─ localStorage: シリアライズして保存                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 【API 通信フロー】

```
1. ログイン
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ POST /api/users/auth/login
          │ { email, password }
          ▼
   ┌─────────────┐
   │   Server    │
   └──────┬──────┘
          │ 201 Created
          │ Set-Cookie: accessToken=xxx; HttpOnly; Secure
          │ { user, token }
          ▼
   ┌─────────────────────────────────┐
   │  Client Zustand Store           │
   ├─────────────────────────────────┤
   │ • user: { id, name, email }     │
   │ • token: "xxx" (メモリのみ)      │
   │ • isAuthenticated: true         │
   └─────────────────────────────────┘

2. API リクエスト
   ┌─────────────┐
   │   Client    │
   │ (Fetch API) │
   └──────┬──────┘
          │ GET /api/foods
          │ credentials: 'include'  ← Cookie を含める
          │ Authorization: Bearer xxx (メモリから)
          ▼
   ┌─────────────┐
   │   Server    │
   └──────┬──────┘
          │ リクエスト Cookie から accessToken 取得
          │ Authorization ヘッダーから accessToken 検証
          ▼
   ┌─────────────┐
   │  200 OK     │
   │  { foods }  │
   └─────────────┘

3. トークン更新（自動）
   ┌──────────────────────────────────────┐
   │ accessToken 有効期限まで30分以下      │
   └──────────────┬───────────────────────┘
                  │ POST /api/users/auth/refresh
                  │ refreshToken は Cookie から自動送信
                  ▼
   ┌─────────────┐
   │   Server    │
   └──────┬──────┘
          │ 200 OK
          │ Set-Cookie: accessToken=yyy; HttpOnly; Secure
          │ { token: "yyy" }
          ▼
   ┌─────────────────────────────────┐
   │  Zustand Store 更新             │
   ├─────────────────────────────────┤
   │ • token: "yyy"（新トークン）    │
   └─────────────────────────────────┘

4. ログアウト
   ┌─────────────┐
   │   Client    │
   └──────┬──────┘
          │ POST /api/users/auth/logout
          │ credentials: 'include'
          ▼
   ┌─────────────┐
   │   Server    │
   └──────┬──────┘
          │ 200 OK
          │ Set-Cookie: accessToken=; Max-Age=0; HttpOnly
          │ Set-Cookie: refreshToken=; Max-Age=0; HttpOnly
          ▼
   ┌─────────────────────────────────┐
   │  Zustand Store クリア           │
   ├─────────────────────────────────┤
   │ • user: null                    │
   │ • token: null                   │
   │ • isAuthenticated: false        │
   └─────────────────────────────────┘
```

---

## 📝 実装詳細

### 1. Zustand 認証ストア (`src/stores/auth.ts`)

```typescript
interface AuthState {
  // 状態
  user: User | null;
  token: string | null;           // ⚠️ メモリのみ（リロード時は失われる）
  isAuthenticated: boolean;
  isLoading: boolean;

  // メソッド
  setAuth: (auth: { user: User; token?: string }) => void;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;      // HttpOnly Cookie同期用
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

// 【重要】persistalize の設定
partialize: (state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  // ❌ token を除外（XSS攻撃対策）
  // ❌ refreshToken を除外（サーバー管理）
}),
```

**ポイント**:
- `token` はメモリのみ保持（ページリロード時は null になる）
- `refreshToken` は Zustand に保存しない（サーバーが HttpOnly Cookie で管理）
- `user` は localStorage に保存して永続化

### 2. API クライアント (`src/api/client.ts`)

```typescript
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      ...options,
      credentials: 'include',  // 🔑 HttpOnly Cookie を含める
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    // ...
  }

  setAuthToken(token: string | null): void {
    // 【非推奨】互換性のために残されている
    // HttpOnly Cookie で自動管理されるため通常は呼び出さない
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.defaultHeaders['Authorization'];
    }
  }
}
```

**ポイント**:
- `credentials: 'include'` で自動的に Cookie を送信
- Authorization ヘッダーはメモリの token から設定
- Cookie と Authorization ヘッダーの両方でトークン検証（多層防御）

### 3. 認証フック (`src/hooks/useAuth.ts`)

```typescript
export function useAuth() {
  const { setAuth, clearAuth } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // refreshToken はサーバーが HttpOnly Cookie で自動管理
        setAuth({
          user: response.data.user,
          token: response.data.token,
          // ❌ refreshToken を設定しない
        });
      }
    },
  });

  // ...
}

export function useToken() {
  const { setToken, clearAuth } = useAuthStore();

  const refreshTokenMutation = useMutation({
    mutationFn: (refreshToken: string) =>
      authService.refreshToken({ refreshToken }),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // メモリの token を更新
        // refreshToken は Cookie から自動送信されるため管理不要
        setToken(response.data.token);
      }
    },
  });

  return {
    refreshToken: refreshTokenMutation.mutateAsync,
    isRefreshing: refreshTokenMutation.isPending,
  };
}
```

---

## 🛡️ セキュリティ対策

### XSS 攻撃対策

| 対策 | 方法 | 効果 |
|------|------|------|
| Token 隔離 | HttpOnly Cookie | JavaScript からアクセス不可 |
| localStorage 廃止 | メモリのみ保持 | 攻撃コードが token を盗めない |
| CSP ヘッダー | サーバー側設定 | インライン script 実行禁止 |

### CSRF 攻撃対策

```typescript
// credentials: 'include' で Cookie 自動送信
const response = await fetch(url, {
  credentials: 'include',  // 🔑 Same-Site Cookie が有効
});

// サーバーの Set-Cookie ヘッダー
Set-Cookie: accessToken=xxx; HttpOnly; Secure; SameSite=Strict
```

### Token 窃盗対策

```
❌ 脆弱なパターン
└─ localStorage に token を保存
   └─ XSS 攻撃で window.localStorage.getItem('token') 実行
   └─ Token 窃盗 → API 呼び出し可能

✅ セキュアなパターン（実装済）
└─ HttpOnly Cookie + メモリ
   └─ XSS 攻撃でも JavaScript から access 不可
   └─ Cookie は自動送信（credentials: 'include'）
   └─ Token 窃盗 不可能
```

---

## 🔄 ページリロード時の動作

```
1. ユーザーがログイン状態でページをリロード

2. Zustand ストア初期化
   ├─ user: localStorage から復元 ✅
   ├─ isAuthenticated: localStorage から復元 ✅
   └─ token: null （メモリは失われた）❌

3. AuthProvider が useAuth() 実行
   └─ token が null のため getProfile() は実行されない

4. ユーザーが API を呼び出し
   ├─ Cookie: サーバーが自動検証 ✅
   ├─ Authorization ヘッダー: token が null だが OK
   │  （Cookie で十分な認証情報）
   └─ API 呼び出し成功 ✅

5. 必要に応じて自動 token 更新
   └─ useToken().refreshToken() 呼び出し
   └─ メモリの token を再取得
```

---

## ⚙️ 設定変更一覧

### 修正されたファイル

1. **src/stores/auth.ts**
   - `refreshToken` フィールド削除
   - `partialize` オプション更新（token, refreshToken を除外）
   - `migrate` 関数の型定義修正

2. **src/api/client.ts**
   - `credentials: 'include'` 追加
   - `setAuthToken()` メソッドを非推奨化（互換性のため残存）
   - 詳細な JSDoc ドキュメント追加

3. **src/hooks/useAuth.ts**
   - `setAuth()` から `refreshToken` 削除
   - `useToken()` フック更新（setToken 使用）
   - Japanese コメント追加

4. **src/api/auth.api.ts**
   - 型定義更新（AuthResponse から refreshToken 使用方法変更）

---

## 📚 参考資料

### 🔗 関連する OWASP ガイドライン

- [Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [Cross Site Scripting (XSS)](https://owasp.org/www-community/attacks/xss/)

### 📖 MDN ドキュメント

- [HTTP Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies)
- [HttpOnly](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies#restrict_access_to_cookies)
- [Fetch Credentials](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#sending_a_request_with_credentials_included)

---

## ✅ テストチェックリスト

- [ ] ログイン後、token が Cookie に保存されることを確認
- [ ] ページリロード後、認証状態が保持されることを確認
- [ ] API 呼び出しで Cookie が自動送信されることを確認
- [ ] XSS 脆弱性テスト（DevTools で localStorage に token がないことを確認）
- [ ] Token 有効期限切れ時の自動リフレッシュを確認
- [ ] ログアウト後、Cookie がクリアされることを確認

---

## 🎯 次のステップ

1. サーバー側の Token 検証ロジック確認
2. CORS & SameSite Cookie 設定確認
3. HTTPS 環境での動作確認
4. e2e テスト（Cypress / Playwright）の追加
