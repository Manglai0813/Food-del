/**
 * Dashboard用管理者認証型定義
 * 管理者のみアクセス可能なシステム用
 */

// ユーザー情報インターフェース
export interface User {
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'customer' | 'staff'; // サーバーの role 形式に合わせる
        phone?: string;
        created_at: Date;
        updated_at: Date;
};
// ログインリクエストインターフェース
export interface LoginRequest {
        email: string;
        password: string;
};

// ログインレスポンスインターフェース
export interface LoginResponse {
        token: string;
        user: User;
};

// APIレスポンス共通インターフェース
export interface ApiResponse<T = unknown> {
        success: boolean;
        message?: string;
        data?: T;
        error?: string;
};