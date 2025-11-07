/**
 * ユーザー認証関連型定義
 * バックエンドのauth.tsとuser.tsに完全対応
 */

// ユーザー基本情報（Prisma User モデルに対応、パスワード除外）
export interface User {
        id: number;                    // Prisma: Int
        name: string;                  // Prisma: String（単一フィールド）
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

// 登録リクエスト（Server RegisterRequestに対応）
export interface RegisterRequest {
        name: string;        // Server: name (単一フィールド)
        email: string;
        password: string;
        phone?: string;
}

// ログインレスポンスデータ（Server LoginDataに対応）
export interface LoginData {
        user: User;          // パスワードを除外したユーザー情報
        token: string;       // アクセストークン
        refreshToken?: string; // リフレッシュトークン
}

// 認証レスポンス（APIレスポンスのdata部分）
// サーバーのLoginDataと完全一致させるため、型エイリアスとして定義
export type AuthResponse = LoginData;

// トークン更新リクエスト（Server TokenRefreshRequestに対応）
export interface RefreshTokenRequest {
        refreshToken: string;
}

// トークン更新レスポンスデータ（Server TokenRefreshDataに対応）
export interface TokenRefreshData {
        token: string;
        refreshToken: string;
        expiresIn: string;
        user: User;
}

// プロフィール更新リクエスト（Server UpdateProfileRequestに対応）
export interface UpdateProfileRequest {
        name?: string;       // Server: name (単一フィールド)
        phone?: string;
}

// パスワード変更リクエスト（Server ChangePasswordRequestに対応）
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

// JWTペイロード情報（デコード用）
export interface JwtPayload {
        id: number;
        email: string;
        role: string;
        iat?: number;
        exp?: number;
}
