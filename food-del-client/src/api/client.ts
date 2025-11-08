/**
 * API通信クライアント設定
 *
 * Express/Node.js との REST API 通信を管理する。
 * HttpOnly Cookie によるトークン自動管理に対応。
 *
 * 【トークン管理】
 * - サーバーは HttpOnly Cookie でトークンを自動送信
 * - credentials: 'include' で Cookie を含める
 * - クライアント側で token を明示的に管理しない
 *
 * 【エラーハンドリング】
 * - タイムアウト（10秒）
 * - HTTP エラーの統一フォーマット化
 * - JSON パースエラーの処理
 *
 * 【型安全性】
 * - すべてのAPI呼び出しは型パラメータで応答型を指定
 * - リクエストボディも型付けされるべき（Tはレスポンス型）
 */

import type { ApiResponse, ApiError } from '@/types';

// API基本設定
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 10000; // 10秒

// 共通ヘッダー
const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
};

/**
 * APIクライアント クラス
 *
 * REST API 呼び出しを提供します。
 * HttpOnly Cookie による自動トークン管理に対応し、
 * フロントエンドで token 情報を保持する必要がありません。
 */
class ApiClient {
        private baseURL: string;
        private defaultHeaders: Record<string, string>;

        /**
         * コンストラクタ
         *
         * @param baseURL - API基本URL（デフォルト: VITE_API_URLまたはlocalhost:5000）
         */
        constructor(baseURL: string = API_BASE_URL) {
                this.baseURL = baseURL.replace(/\/$/, ''); // 末尾のスラッシュを除去
                this.defaultHeaders = { ...defaultHeaders };
        }

        /**
         * 認証トークン設定
         *
         * 【非推奨】HttpOnly Cookie で自動管理されるため、通常は呼び出す必要ありません。
         * 互換性のため残されています。
         *
         * @param token - アクセストークン、またはnull
         */
        setAuthToken(token: string | null): void {
                if (token) {
                        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
                } else {
                        delete this.defaultHeaders['Authorization'];
                }
        }

        /**
         * 基本リクエストメソッド
         *
         * すべての HTTP リクエストの基盤となります。
         * タイムアウト制御、エラーハンドリング、JSON パースを行います。
         *
         * @param endpoint - API エンドポイント（例: '/api/foods'）
         * @param options - RequestInit 設定（メソッド、ボディなど）
         * @returns API応答（型パラメータTで指定した型）
         */
        private async request<T>(
                endpoint: string,
                options: RequestInit = {}
        ): Promise<ApiResponse<T>> {
                const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

                const config: RequestInit = {
                        ...options,
                        credentials: 'include', // HttpOnly Cookie を含める
                        headers: {
                                ...this.defaultHeaders,
                                ...options.headers,
                        },
                };

                // タイムアウト制御
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);
                config.signal = controller.signal;

                try {
                        const response = await fetch(url, config);
                        clearTimeout(timeoutId);

                        // レスポンステキストを取得
                        const responseText = await response.text();

                        // JSONパース試行
                        let data: ApiResponse<T>;
                        try {
                                data = JSON.parse(responseText) as ApiResponse<T>;
                        } catch {
                                // JSON パースに失敗した場合のフォールバック
                                throw new Error(`Invalid JSON response: ${responseText}`);
                        }

                        // HTTPステータスエラーチェック
                        if (!response.ok) {
                                const dataRecord = data as unknown as Record<string, unknown>;
                                const error: ApiError = {
                                        success: false,
                                        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
                                        errors: data.errors,
                                        code: dataRecord.code as string | undefined,
                                        statusCode: response.status,
                                };
                                throw error;
                        }

                        return data;
                } catch (error) {
                        clearTimeout(timeoutId);

                        if (error instanceof Error) {
                                if (error.name === 'AbortError') {
                                        throw new Error('リクエストがタイムアウトしました');
                                }
                                throw error;
                        }

                        throw new Error('不明なエラーが発生しました');
                }
        }

        /**
         * GET リクエスト
         *
         * @param endpoint - API エンドポイント
         * @param params - クエリパラメータ
         * @returns 型Tのレスポンスデータ
         */
        async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<ApiResponse<T>> {
                let url = endpoint;
                if (params) {
                        const searchParams = new URLSearchParams();
                        Object.entries(params).forEach(([key, value]) => {
                                if (value !== null && value !== undefined) {
                                        searchParams.append(key, String(value));
                                }
                        });
                        url += `?${searchParams.toString()}`;
                }

                return this.request<T>(url, { method: 'GET' });
        }

        /**
         * POST リクエスト
         *
         * @param endpoint - API エンドポイント
         * @param data - リクエストボディ
         * @returns 型Tのレスポンスデータ
         */
        async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, {
                        method: 'POST',
                        body: data ? JSON.stringify(data) : undefined,
                });
        }

        /**
         * PUT リクエスト
         *
         * @param endpoint - API エンドポイント
         * @param data - リクエストボディ
         * @returns 型Tのレスポンスデータ
         */
        async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, {
                        method: 'PUT',
                        body: data ? JSON.stringify(data) : undefined,
                });
        }

        /**
         * PATCH リクエスト
         *
         * @param endpoint - API エンドポイント
         * @param data - リクエストボディ
         * @returns 型Tのレスポンスデータ
         */
        async patch<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, {
                        method: 'PATCH',
                        body: data ? JSON.stringify(data) : undefined,
                });
        }

        /**
         * DELETE リクエスト
         *
         * @param endpoint - API エンドポイント
         * @returns 型Tのレスポンスデータ
         */
        async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, { method: 'DELETE' });
        }

        /**
         * ファイルアップロード専用メソッド
         *
         * FormData を送信します。Content-Type は自動設定されます。
         *
         * @param endpoint - API エンドポイント
         * @param formData - アップロードするFormData
         * @returns 型Tのレスポンスデータ
         */
        async uploadFile<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
                const headers = { ...this.defaultHeaders };
                delete headers['Content-Type']; // FormDataの場合、Content-Typeを自動設定させる

                return this.request<T>(endpoint, {
                        method: 'POST',
                        body: formData,
                        headers,
                });
        }
}

// シングルトンインスタンス
export const apiClient = new ApiClient();

/**
 * API HTTPメソッド型
 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * APIリクエスト設定インターフェース
 *
 * 【使用例】
 * ```typescript
 * const config: ApiRequestConfig = {
 *   method: 'POST',
 *   endpoint: '/api/foods',
 *   data: { name: '寿司', price: 1500 }
 * };
 * const response = await apiCall<FoodWithCategory>(config);
 * ```
 */
export interface ApiRequestConfig {
        // HTTPメソッド
        method: ApiMethod;
        // APIエンドポイント
        endpoint: string;
        // リクエストボディ（POST/PUT/PATCHで使用）
        data?: unknown;
        // クエリパラメータ（GETで使用）
        params?: Record<string, unknown>;
}

/**
 * 型安全なAPIエンドポイント呼び出しヘルパー
 *
 * APIリクエスト設定に基づいて、適切なHTTPメソッドでリクエストを実行します。
 *
 * @param config - APIリクエスト設定
 * @returns 型Tのレスポンスデータ
 *
 * @example
 * ```typescript
 * const response = await apiCall<User>({
 *   method: 'POST',
 *   endpoint: '/api/users/auth/login',
 *   data: { email: 'user@example.com', password: 'password' }
 * });
 * ```
 */
export async function apiCall<T>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
        const { method, endpoint, data, params } = config;

        switch (method) {
                case 'GET':
                        return apiClient.get<T>(endpoint, params);
                case 'POST':
                        return apiClient.post<T>(endpoint, data);
                case 'PUT':
                        return apiClient.put<T>(endpoint, data);
                case 'PATCH':
                        return apiClient.patch<T>(endpoint, data);
                case 'DELETE':
                        return apiClient.delete<T>(endpoint);
                default:
                        throw new Error(`Unsupported HTTP method: ${method}`);
        }
}