/**
 * カテゴリ関連型定義
 * サーバー仕様書に基づく統一型定義
 */

// カテゴリデータ型（Server返却データ）
export interface Category {
	id: number;
	name: string;
	description?: string; // カテゴリ説明
	status: boolean; // カテゴリステータス
	created_at: Date | string; // 作成日時
	updated_at: Date | string; // 更新日時
}

// カテゴリ + 商品数型（Dashboard統計用）
export interface CategoryWithCount extends Category {
	_count?: {
		foods: number; // このカテゴリの商品数
	};
}

// カテゴリ作成リクエスト型
export interface CreateCategoryRequest {
	name: string;
	description?: string; // カテゴリ説明（オプション）
	status?: boolean; // カテゴリステータス（オプション、デフォルト: true）
}

// カテゴリ更新リクエスト型
export interface UpdateCategoryRequest {
	name?: string;
	description?: string; // カテゴリ説明（オプション）
	status?: boolean; // カテゴリステータス（オプション）
}

// カテゴリ検索クエリパラメータ型
export interface CategorySearchQuery {
	include_count?: boolean; // 商品数を含めるか（デフォルト: false）
}
