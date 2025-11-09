// ユーザー情報インターフェース
export interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'customer' | 'staff';
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