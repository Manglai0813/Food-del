import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { handleHttpError, logError } from './errorHandler';
import { API_BASE_URL, HTTP_STATUS } from './apiConstants';

/**
 * 認証統合HTTP Client
 * JWT Token自動附加と認証失敗時の自動処理を提供
 */
class HttpClient {
        private client: AxiosInstance;

        constructor() {
                this.client = axios.create({
                        baseURL: API_BASE_URL,
                        timeout: 10000,
                });

                // リクエストインターセプター: JWT Token自動附加とFormData処理
                this.client.interceptors.request.use(
                        (config: AxiosRequestConfig) => {
                                // headersオブジェクトが存在することを確保
                                if (!config.headers) {
                                        config.headers = {};
                                }

                                const { token } = useAuthStore.getState();

                                if (token) {
                                        config.headers.Authorization = `Bearer ${token}`;
                                }

                                // FormDataの場合、Content-Typeヘッダーを削除してAxiosに自動検出させる
                                // (multipart/form-data with boundaries)
                                if (config.data instanceof FormData) {
                                        delete config.headers['Content-Type'];
                                } else {
                                        // FormData以外の場合、デフォルトのContent-Typeを設定
                                        config.headers['Content-Type'] = 'application/json';
                                }

                                return config;
                        },
                        (error: Error) => Promise.reject(error)
                );

                // レスポンスインターセプター: エラー処理とトークン自動更新
                this.client.interceptors.response.use(
                        (response: AxiosResponse) => response,
                        async (error: AxiosResponse | Error) => {
                                if (!('config' in error)) {
                                        return Promise.reject(error);
                                }
                                const originalRequest = error.config as AxiosRequestConfig;

                                // 401エラー（認証失敗）かつ、まだリトライしていないリクエストの場合
                                if (error.response?.status === HTTP_STATUS.UNAUTHORIZED && !originalRequest._retry) {
                                        originalRequest._retry = true; // リトライフラグを立て、無限ループを防止

                                        try {
                                                const { refreshToken, login } = useAuthStore.getState();

                                                if (!refreshToken) {
                                                        throw new Error('No refresh token available');
                                                }

                                                // トークンリフレッシュAPIを呼び出す
                                                const response = await axios.post(
                                                        `${API_BASE_URL}/auth/refresh`,
                                                        { refreshToken }
                                                );

                                                const { accessToken: newAccessToken, user } = response.data;

                                                // ZustandストアとlocalStorageの情報を更新
                                                login(user, newAccessToken, refreshToken);

                                                // 元のリクエストのヘッダーを新しいトークンで更新
                                                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                                                // 元のリクエストを再実行
                                                return this.client(originalRequest);

                                        } catch (refreshError) {
                                                // リフレッシュトークンが無効な場合、認証情報をクリアしてログインページへ
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


        // GETリクエスト実行
        async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
                const response = await this.client.get<T>(url, config);
                return response.data;
        }

        // POSTリクエスト実行
        async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
                const response = await this.client.post<T>(url, data, config);
                return response.data;
        }

        // PUTリクエスト実行
        async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
                const response = await this.client.put<T>(url, data, config);
                return response.data;
        }

        // DELETEリクエスト実行
        async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
                const response = await this.client.delete<T>(url, config);
                return response.data;
        }

        // PATCHリクエスト実行
        async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
                const response = await this.client.patch<T>(url, data, config);
                return response.data;
        }

        // Axiosインスタンスへの直接アクセス
        get axios() {
                return this.client;
        }
};

// HttpClientインスタンス作成
export const httpClient = new HttpClient();
export default httpClient;