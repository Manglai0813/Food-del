import type { Request } from 'express';
import type { UserResponse } from './user';

// JWTペイロード情報
export interface JwtPayload {
    id: number;
    email: string;
    role: string;
    iat?: number; // 発行時間
    exp?: number; // 有効期限
}

// リフレッシュトークンペイロード情報
export interface RefreshTokenPayload {
    userId: number;
    type: 'refresh';
    iat?: number; // 発行時間
    exp?: number; // 有効期限
}

// JWT検証ヘルパー関数型
export function isJwtPayload(obj: unknown): obj is JwtPayload {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return (
        typeof record.id === 'number' &&
        typeof record.email === 'string' &&
        typeof record.role === 'string'
    );
}

export function isRefreshTokenPayload(obj: unknown): obj is RefreshTokenPayload {
    if (!obj || typeof obj !== 'object') {
        return false;
    }
    const record = obj as Record<string, unknown>;
    return (
        typeof record.userId === 'number' &&
        record.type === 'refresh'
    );
}

// 認証付きリクエスト型
export interface AuthRequest extends Request {
    user?: UserResponse; // パスワードを除いたユーザー情報
}

// ログインリクエスト型
export interface LoginRequest {
    email: string;
    password: string;
}

// 新規登録リクエスト型
export interface RegisterRequest {
    name: string;
    email: string;
    password: string;
    phone?: string;
}

// ログインデータ型
export interface LoginData {
    user: UserResponse; // パスワードを除外したユーザー情報
    token: string;
    refreshToken?: string;
}


// トークンリフレッシュリクエスト型
export interface TokenRefreshRequest {
    refreshToken: string;
}

// トークンリフレッシュデータ型
export interface TokenRefreshData {
    token: string;
    refreshToken: string;
    expiresIn: string;
    user: UserResponse;
}

// プロフィール更新リクエスト型
export interface UpdateProfileRequest {
    name?: string;
    phone?: string;
}

// パスワード変更リクエスト型
export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}