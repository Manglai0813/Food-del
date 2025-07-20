import type { Request } from 'express';
import type { User } from '@prisma/client';

// 認証済みユーザー情報を含むリクエスト型
export interface AuthRequest extends Request {
    user?: User; // Prismaで生成されたUser型を使用
}
// ファイルアップロード用のリクエスト型
export interface FileRequest extends Request {
  file?: {
    originalname: string;
    buffer: Buffer;
  };
  user?: User; // 管理者権限が必要な場合に使用
}

// API共通レスポンス型
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    pagination?: {
        page: number;
        pageSize: number;
        total: number;
        totalPages: number;
    };
}

// ページネーション用クエリパラメータ
export interface PaginationQuery {
    page?: number; // 現在のページ番号
    pageSize?: number; // 1ページあたりのアイテム数
}

// 食品フィルタリング用クエリパラメータ
export interface FoodFilterQuery extends PaginationQuery {
    category_id?: string; // カテゴリID
    search?: string; // 検索キーワード
    price_min?: string; // 最低価格
    price_max?: string; // 最高価格
}

// カート商品追加リクエスト
export interface AddToCartRequest {
    food_id: number; // 食品ID
    quantity: number; // 数量
}

// カート商品数量更新リクエスト
export interface UpdateCartItemRequest {
    quantity: number; // 更新後の数量
}

// 注文作成リクエスト
export interface CreateOrderRequest {
    delivery_address: string; // 配送先住所
    phone: string; // 電話番号
    notes?: string; // 注文に関する特記事項
}

// 注文ステータス更新リクエスト（管理者用）
export interface UpdateOrderStatusRequest {
    status: 'pending' | 'confirmed' | 'preparing' | 'delivery' | 'completed' | 'cancelled';
}

// JWTペイロード型
export interface JwtPayload {
    id: number; // ユーザーID
    iat?: number; // 発行日時
    exp?: number; // 有効期限
}