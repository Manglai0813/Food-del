// ユーザー基本情報
export interface User {
    id: number;                    // Prisma: Int
    name: string;                  // Prisma: String
    email: string;                 // Prisma: String @unique
    role: 'customer' | 'admin' | 'staff'; // Prisma: String @default("customer")
    phone: string | null;          // Prisma: String?
    created_at: Date | string;     // Prisma: DateTime @default(now())
    updated_at: Date | string;     // Prisma: DateTime @updatedAt
}

// ログインリクエスト
export interface LoginRequest {
    email: string;
    password: string;
}

// 登録リクエスト
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

// ログインレスポンスデータ
export interface LoginData {
    user: User;          // パスワードを除外したユーザー情報
    token: string;       // アクセストークン
    refreshToken?: string; // リフレッシュトークン
}

// 認証レスポンス
// サーバーのLoginDataと完全一致させるため、型エイリアスとして定義
export type AuthResponse = LoginData;

// トークン更新リクエスト
export interface RefreshTokenRequest {
    refreshToken: string;
}

// トークン更新レスポンスデータ
export interface TokenRefreshData {
    token: string;
    refreshToken: string;
    expiresIn: string;
    user: User;
}

// プロフィール更新リクエスト
export interface UpdateProfileRequest {
    name?: string;       // Server: name 
    phone?: string;
}

// パスワード変更リクエスト
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// パスワードリセットリクエスト
export interface ResetPasswordRequest {
    email: string;
}

// メール認証リクエスト
export interface VerifyEmailRequest {
    token: string;
}

// JWTペイロード情報
export interface JwtPayload {
    id: number;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}