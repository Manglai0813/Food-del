// 商品関連型定義：サーバー仕様書に基づく統一型定義
import type { Category } from './category';

// 商品基本情報型（Server返却データに完全一致）
export interface Food {
        id: number;
        name: string;
        description: string;
        price: number;
        category_id: number;
        image_path: string;
        status: boolean;
        stock: number; // 物理総在庫数
        reserved: number; // 予約済在庫数（カート内）
        min_stock: number; // 最小在庫閾値（アラート用）
        version: number; // 楽観的ロックバージョン
        created_at: string; // ISO 8601形式
        updated_at: string; // ISO 8601形式
        category: Category; // カテゴリ情報（結合データ）
}

// 商品作成リクエスト型
export interface CreateFoodRequest {
        name: string;
        description: string;
        price: number;
        category_id: number;
        image?: File; // 画像ファイル（multipart/form-data）
        status?: boolean;
}

// 商品更新リクエスト型
export interface UpdateFoodRequest {
        id: number;
        name?: string;
        description?: string;
        price?: number;
        category_id?: number;
        image?: File; // 新しい画像ファイル（オプション）
        status?: boolean;
}

// 商品検索クエリパラメータ型
export interface FoodSearchQuery {
        page?: number; // ページ番号（デフォルト: 1）
        limit?: number; // 1ページあたりの件数（デフォルト: 10）
        search?: string; // 商品名・説明文での検索
        category_id?: number; // カテゴリIDでフィルタ
        status?: boolean; // ステータスでフィルタ
        min_price?: number; // 最低価格でフィルタ
        max_price?: number; // 最高価格でフィルタ
        sort_by?: 'name' | 'price' | 'created_at' | 'stock'; // ソート項目
        sort_order?: 'asc' | 'desc'; // ソート順
}

// ページネーション付き商品リストレスポンス型
export interface PaginatedFoodResponse {
        success: boolean;
        message: string;
        data: Food[];
        pagination: {
                page: number;
                limit: number;
                total: number;
                totalPages: number;
                hasNext: boolean;
                hasPrev: boolean;
        };
}

// 在庫情報計算ヘルパー型
export interface StockInfo {
        total: number; // 物理総在庫
        reserved: number; // 予約済
        available: number; // 利用可能在庫（total - reserved）
        isLow: boolean; // 在庫少（available <= min_stock）
        isOut: boolean; // 在庫切れ（available === 0）
}

// 在庫情報を計算する関数
export const calculateStockInfo = (food: Food): StockInfo => {
        const available = food.stock - food.reserved;
        return {
                total: food.stock,
                reserved: food.reserved,
                available,
                isLow: available <= food.min_stock && available > 0,
                isOut: available <= 0,
        };
};