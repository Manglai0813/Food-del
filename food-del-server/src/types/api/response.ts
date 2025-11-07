import type { ApiResponse, PaginatedResponse } from '../common';
import type { PublicFoodWithCategory } from '../public';

// 認証成功応答型（重要なAPIなので詳細型を保持）
export interface AuthSuccessResponse extends ApiResponse {
        success: true;
        data: {
                user: {
                        id: number;
                        name: string;
                        email: string;
                        role: string;
                        phone?: string;
                        created_at: Date;
                        updated_at: Date;
                };
                token: string;
                refreshToken?: string;
                expiresIn?: string;
        };
}

import type { TokenRefreshData } from '../auth';

// トークンリフレッシュ応答型（重要なAPIなので詳細型を保持）
export interface TokenRefreshResponse extends ApiResponse {
        success: true;
        data: TokenRefreshData;
}

// ユーザープロファイル応答型
export interface UserProfileResponse extends ApiResponse {
        success: true;
        data: {
                id: number;
                name: string;
                email: string;
                role: string;
                phone?: string;
                created_at: Date;
                updated_at: Date;
        };
}

// 商品応答型（公開用・库存情報を除外）
export interface FoodItemResponse extends ApiResponse {
        success: true;
        data: PublicFoodWithCategory;
}

// 商品リスト応答型
export interface FoodListResponse extends PaginatedResponse<FoodItemResponse['data']> {
        // ページネーション情報は親クラスから継承
}

// カテゴリー応答型
export interface CategoryResponse extends ApiResponse {
        data: {
                id: number;
                name: string;
                description?: string;
                status: boolean;
                created_at: Date;
                updated_at: Date;
                _count?: {
                        foods: number;
                };
        };
}

// カテゴリーリスト応答型
export interface CategoryListResponse extends ApiResponse<CategoryResponse['data'][]> {
        // 配列データは親クラスから継承
}


// 注文応答型
export interface OrderResponse extends ApiResponse {
        success: true;
        data: {
                id: number;
                user_id: number;
                total_amount: number;
                status: string;
                delivery_address: string;
                phone: string;
                notes?: string;
                order_date: Date;
                updated_at: Date;
                order_items: Array<{
                        id: number;
                        order_id: number;
                        food_id: number;
                        quantity: number;
                        price: number; // 注文時の価格スナップショット
                        food: {
                                id: number;
                                name: string;
                                image_path: string;
                                category: {
                                        name: string;
                                };
                        };
                        // subtotal: quantity * price は実行時計算
                }>;
                user: {
                        id: number;
                        name: string;
                        email: string;
                        phone?: string;
                };
                summary: {
                        itemCount: number;
                        totalQuantity: number;
                        totalAmount: number;
                };
        };
}

// 注文リスト応答型
export interface OrderListResponse extends PaginatedResponse<OrderResponse['data']> {
        // ページネーション情報は親クラスから継承
}

// 注文統計応答型
export interface OrderStatsResponse extends ApiResponse {
        success: true;
        data: {
                totalOrders: number;
                totalRevenue: number;
                statusBreakdown: Record<string, number>;
                recentOrders: OrderResponse['data'][];
                revenueTrend?: Array<{
                        date: string;
                        revenue: number;
                        orderCount: number;
                }>;
        };
}

// ファイルアップロード応答型
export interface FileUploadResponse extends ApiResponse {
        success: true;
        data: import('../file').FileUploadResult;
}