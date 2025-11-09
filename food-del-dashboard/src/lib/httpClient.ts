import axios, { type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig, type AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { handleHttpError, logError } from './errorHandler';
import { API_BASE_URL, HTTP_STATUS, API_ENDPOINTS } from './apiConstants';

// Axios HTTP クライアントで認証とエラーハンドリングを統合
class HttpClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
        });

        // JWT Token を自動的にリクエストヘッダーに追加
        this.client.interceptors.request.use(
            (config: InternalAxiosRequestConfig) => {
                // リクエストヘッダーオブジェクトが存在することを確保
                if (!config.headers) {
                    config.headers = {} as typeof config.headers;
                }

                const { token } = useAuthStore.getState();

                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }

                // FormData はヘッダーを削除して自動検出させる、JSON はデフォルト設定
                if (config.data instanceof FormData) {
                    delete config.headers['Content-Type'];
                } else {
                    config.headers['Content-Type'] = 'application/json';
                }

                return config;
            },
            (error: Error) => Promise.reject(error)
        );

        // 401 エラーはトークンをリフレッシュしてリトライ、その他のエラーは統一ハンドラで処理
        this.client.interceptors.response.use(
            (response: AxiosResponse) => response,
            async (error: AxiosError | Error) => {
                if (!('config' in error) || !('response' in error)) {
                    return Promise.reject(error);
                }
                const axiosError = error as AxiosError;
                const originalRequest = axiosError.config as InternalAxiosRequestConfig & { _retry?: boolean };

                // 401 エラーで未リトライの場合、トークンをリフレッシュしてリクエストを再実行
                if (axiosError.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const { token, setAuth } = useAuthStore.getState();

                        if (!token) {
                            throw new Error('No token available');
                        }

                        // トークンリフレッシュエンドポイントを呼び出す
                        const response = await axios.post(
                            `${API_BASE_URL}${API_ENDPOINTS.AUTH.REFRESH}`,
                            { token }
                        );

                        const { user, token: newAccessToken } = response.data;

                        // Zustand ストアに新しいトークンとユーザー情報を保存
                        setAuth({ user, token: newAccessToken });

                        // 元のリクエストにを新しいトークンで更新
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                        // リクエストを再実行
                        return this.client(originalRequest);

                    } catch (refreshError) {
                        // トークンリフレッシュ失敗時は認証情報をクリアしてログイン画面へリダイレクト
                        logError(refreshError, 'Token Refresh Failed');
                        useAuthStore.getState().clearAuth();
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                // その他のエラーは統一エラーハンドラで処理
                const apiError = handleHttpError(error);
                return Promise.reject(apiError);
            }
        );
    }

    // GET リクエストを実行
    async get<T>(url: string, config?: { params?: Record<string, unknown> } & Partial<InternalAxiosRequestConfig>): Promise<T> {
        const response = await this.client.get<T>(url, config);
        return response.data;
    }

    // POST リクエストを実行
    async post<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
        const response = await this.client.post<T>(url, data, config);
        return response.data;
    }

    // PUT リクエストを実行
    async put<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
        const response = await this.client.put<T>(url, data, config);
        return response.data;
    }

    // DELETE リクエストを実行
    async delete<T>(url: string, config?: InternalAxiosRequestConfig): Promise<T> {
        const response = await this.client.delete<T>(url, config);
        return response.data;
    }

    // PATCH リクエストを実行
    async patch<T>(url: string, data?: unknown, config?: InternalAxiosRequestConfig): Promise<T> {
        const response = await this.client.patch<T>(url, data, config);
        return response.data;
    }

    // Axios インスタンスに直接アクセス
    get axios() {
        return this.client;
    }
};

// HttpClient シングルトンインスタンス
export const httpClient = new HttpClient();
export default httpClient;