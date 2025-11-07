/**
 * API通信クライアント設定
 * 基本的なHTTP通信とエラーハンドリング
 */

import type { ApiResponse, ApiError } from '@/types';

// API基本設定
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 10000; // 10秒

// 共通ヘッダー
const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
};

// APIクライアントクラス
class ApiClient {
        private baseURL: string;
        private defaultHeaders: Record<string, string>;

        constructor(baseURL: string = API_BASE_URL) {
                this.baseURL = baseURL.replace(/\/$/, ''); // 末尾のスラッシュを除去
                this.defaultHeaders = { ...defaultHeaders };
        }

        // 認証トークン設定
        setAuthToken(token: string | null) {
                if (token) {
                        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
                } else {
                        delete this.defaultHeaders['Authorization'];
                }
        }

        // 基本リクエストメソッド
        private async request<T = any>(
                endpoint: string,
                options: RequestInit = {}
        ): Promise<ApiResponse<T>> {
                const url = `${this.baseURL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

                const config: RequestInit = {
                        ...options,
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
                                data = JSON.parse(responseText);
                        } catch {
                                // JSON パースに失敗した場合のフォールバック
                                throw new Error(`Invalid JSON response: ${responseText}`);
                        }

                        // HTTPステータスエラーチェック
                        if (!response.ok) {
                                const error: ApiError = {
                                        success: false,
                                        message: data.message || `HTTP ${response.status}: ${response.statusText}`,
                                        errors: data.errors,
                                        code: (data as any).code,
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

        // HTTP メソッド
        async get<T = any>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
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

        async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, {
                        method: 'POST',
                        body: data ? JSON.stringify(data) : undefined,
                });
        }

        async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, {
                        method: 'PUT',
                        body: data ? JSON.stringify(data) : undefined,
                });
        }

        async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, {
                        method: 'PATCH',
                        body: data ? JSON.stringify(data) : undefined,
                });
        }

        async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
                return this.request<T>(endpoint, { method: 'DELETE' });
        }

        // ファイルアップロード専用メソッド
        async uploadFile<T = any>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
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

// 型安全なAPIエンドポイント呼び出しヘルパー
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestConfig {
        method: ApiMethod;
        endpoint: string;
        data?: any;
        params?: Record<string, any>;
}

export async function apiCall<T = any>(config: ApiRequestConfig): Promise<ApiResponse<T>> {
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
};