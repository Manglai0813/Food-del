import { apiClient } from './client';
import type {
    User,
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    RefreshTokenRequest,
    TokenRefreshData,
    UpdateProfileRequest,
    ChangePasswordRequest,
    ApiResponse,
} from '@/types';

export class AuthService {
    // ログイン
    async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/users/auth/login', credentials);

    if (response.success && response.data) {
    apiClient.setAuthToken(response.data.token);
    }

    return response;
    }

    // 登録
    async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await apiClient.post<AuthResponse>('/api/users/auth/register', userData);

                if (response.success && response.data) {
                        apiClient.setAuthToken(response.data.token);
                }

    return response;
    }

    // トークン更新
    async refreshToken(refreshData: RefreshTokenRequest): Promise<ApiResponse<TokenRefreshData>> {
    const response = await apiClient.post<TokenRefreshData>('/api/users/auth/refresh', refreshData);

                if (response.success && response.data) {
                        apiClient.setAuthToken(response.data.token);
                }

                return response;
        }

        // ログアウト
        async logout(): Promise<ApiResponse<void>> {
                const response = await apiClient.post<void>('/api/users/auth/logout');
                apiClient.setAuthToken(null);
                return response;
        }

        // パスワード変更
        async changePassword(passwordData: ChangePasswordRequest): Promise<ApiResponse<void>> {
                return apiClient.post<void>('/api/users/auth/change-password', passwordData);
        }

        // プロフィール取得
        async getProfile(): Promise<ApiResponse<User>> {
                return apiClient.get<User>('/api/users/profile');
        }

    // プロフィール更新
    async updateProfile(profileData: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return apiClient.put<User>('/api/users/profile', profileData);
    }

        // アクセストークン設定
        setAccessToken(token: string | null): void {
                apiClient.setAuthToken(token);
        }

        // 認証状態チェック
        async checkAuth(): Promise<ApiResponse<User>> {
                try {
                        return await this.getProfile();
                } catch (error) {
                        this.setAccessToken(null);
                        throw error;
                }
        }
};

// シングルトンインスタンス
export const authService = new AuthService();
