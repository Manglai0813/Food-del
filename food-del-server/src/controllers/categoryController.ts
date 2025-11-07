import type { Response } from 'express';
import { CategoryService } from '@/services/categoryService';
import type {
        AuthRequest,
        ApiResponse,
        CategoryData,
        PaginatedResponse,
        CreateCategoryRequest,
        UpdateCategoryRequest,
        CategorySearchQuery,
        QueryRequest,
        BodyRequest,
        ParamsRequest,
        IdParams,
        PublicFoodWithCategory
} from '@/types';
import { toPublicFoodArray } from '@/types';

/**
 * カテゴリコントローラー
 * カテゴリの検索、作成、更新、削除などのAPI処理を担当します
 */

// カテゴリリスト取得
export const getCategories = async (req: QueryRequest<CategorySearchQuery>, res: Response<ApiResponse<CategoryData[]> | ApiResponse<null>>): Promise<void> => {
        try {
                // クエリパラメータに基づいてカテゴリを取得
                const categories = await CategoryService.getCategories(req.query);

                res.status(200).json({
                        success: true,
                        message: "カテゴリリストを取得しました",
                        data: categories
                } as ApiResponse<CategoryData[]>);
        } catch (error) {
                console.error('カテゴリリスト取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリリストの取得に失敗しました"
                } as ApiResponse<null>);
        }
};

// カテゴリ詳細取得
export const getCategoryById = async (req: ParamsRequest<IdParams>, res: Response<ApiResponse<CategoryData> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリIDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDのバリデーション
                const id = parseInt(req.params.id);

                if (isNaN(id)) {
                        res.status(400).json({
                                success: false,
                                message: "無効なカテゴリIDです"
                        } as ApiResponse<null>);
                        return;
                }

                // IDに基づいてカテゴリを取得
                const category = await CategoryService.getCategoryById(id);

                if (!category) {
                        res.status(404).json({
                                success: false,
                                message: "カテゴリが見つかりません"
                        } as ApiResponse<null>);
                        return;
                }

                res.status(200).json({
                        success: true,
                        message: "カテゴリ詳細を取得しました",
                        data: category
                } as ApiResponse<CategoryData>);
        } catch (error) {
                console.error('カテゴリ詳細取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリ詳細の取得に失敗しました"
                } as ApiResponse<null>);
        }
};

// 有効カテゴリリスト取得
export const getActiveCategories = async (_req: AuthRequest, res: Response<ApiResponse<CategoryData[]> | ApiResponse<null>>): Promise<void> => {
        try {
                // 有効なカテゴリのみを取得
                const categories = await CategoryService.getActiveCategories();

                res.status(200).json({
                        success: true,
                        message: "有効カテゴリリストを取得しました",
                        data: categories
                } as ApiResponse<CategoryData[]>);
        } catch (error) {
                console.error('有効カテゴリリスト取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "有効カテゴリリストの取得に失敗しました"
                } as ApiResponse<null>);
        }
};

// カテゴリ下の商品取得
export const getCategoryFoods = async (req: ParamsRequest<IdParams> & QueryRequest<CategorySearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリIDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDのバリデーション
                const categoryId = parseInt(req.params.id);

                if (isNaN(categoryId)) {
                        res.status(400).json({
                                success: false,
                                message: "無効なカテゴリIDです"
                        } as ApiResponse<null>);
                        return;
                }

                // カテゴリIDに基づいて商品を取得（クエリパラメータでフィルタリング・ページネーション可能）
                const result = await CategoryService.getCategoryFoods(categoryId, req.query);

                // 公開用データに変換（敏感情報を除外）
                const publicData = toPublicFoodArray(result.data);

                res.status(200).json({
                        success: true,
                        message: "カテゴリ下の商品を取得しました",
                        data: publicData,
                        pagination: {
                                page: result.page,
                                limit: result.limit,
                                total: result.total,
                                totalPages: result.totalPages,
                                hasNext: result.hasNext,
                                hasPrev: result.hasPrev
                        }
                } as PaginatedResponse<PublicFoodWithCategory>);
        } catch (error) {
                console.error('カテゴリ下の商品取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリ下の商品の取得に失敗しました"
                } as ApiResponse<null>);
        }
};

// カテゴリ作成（管理者専用）
export const createCategory = async (req: BodyRequest<CreateCategoryRequest>, res: Response<ApiResponse<CategoryData> | ApiResponse<null>>): Promise<void> => {
        try {
                // リクエストボディからカテゴリ情報を取得
                const { name, description, status } = req.body;

                if (!name) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリ名が必要です",
                                errors: ["name が必須です"]
                        } as ApiResponse<null>);
                        return;
                }

                // 新しいカテゴリを作成
                const category = await CategoryService.createCategory({
                        name,
                        description,
                        status: status !== undefined ? Boolean(status) : true
                });

                res.status(201).json({
                        success: true,
                        message: "カテゴリを作成しました",
                        data: category
                } as ApiResponse<CategoryData>);
        } catch (error) {
                console.error('カテゴリ作成エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリの作成に失敗しました"
                } as ApiResponse<null>);
        }
};

// カテゴリ更新（管理者専用）
export const updateCategory = async (req: ParamsRequest<IdParams> & BodyRequest<UpdateCategoryRequest>, res: Response<ApiResponse<CategoryData> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリIDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDのバリデーション
                const id = parseInt(req.params.id);

                if (isNaN(id)) {
                        res.status(400).json({
                                success: false,
                                message: "無効なカテゴリIDです"
                        } as ApiResponse<null>);
                        return;
                }

                // リクエストボディから更新データを取得
                const updatedCategory = await CategoryService.updateCategory(id, req.body);

                if (!updatedCategory) {
                        res.status(404).json({
                                success: false,
                                message: "カテゴリが見つかりません"
                        } as ApiResponse<null>);
                        return;
                }

                res.status(200).json({
                        success: true,
                        message: "カテゴリを更新しました",
                        data: updatedCategory
                } as ApiResponse<CategoryData>);
        } catch (error) {
                console.error('カテゴリ更新エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリの更新に失敗しました"
                } as ApiResponse<null>);
        }
};

// カテゴリステータス更新（管理者専用）
export const updateCategoryStatus = async (req: ParamsRequest<IdParams> & BodyRequest<{ status: boolean }>, res: Response<ApiResponse<CategoryData> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリIDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDのバリデーション
                const id = parseInt(req.params.id);

                if (isNaN(id)) {
                        res.status(400).json({
                                success: false,
                                message: "無効なカテゴリIDです"
                        } as ApiResponse<null>);
                        return;
                }

                // リクエストボディからステータスを取得
                const { status } = req.body;

                if (typeof status !== 'boolean') {
                        res.status(400).json({
                                success: false,
                                message: "ステータスはboolean値である必要があります"
                        } as ApiResponse<null>);
                        return;
                }

                // カテゴリステータスを更新
                const updatedCategory = await CategoryService.updateCategoryStatus(id, status);

                if (!updatedCategory) {
                        res.status(404).json({
                                success: false,
                                message: "カテゴリが見つかりません"
                        } as ApiResponse<null>);
                        return;
                }

                res.status(200).json({
                        success: true,
                        message: `カテゴリステータスを${status ? '有効' : '無効'}に更新しました`,
                        data: updatedCategory
                } as ApiResponse<CategoryData>);
        } catch (error) {
                console.error('カテゴリステータス更新エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリステータスの更新に失敗しました"
                } as ApiResponse<null>);
        }
};

// カテゴリ削除（管理者専用）
export const deleteCategory = async (req: ParamsRequest<IdParams>, res: Response<ApiResponse<{ deleted: boolean }> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリIDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDのバリデーション
                const id = parseInt(req.params.id);

                if (isNaN(id)) {
                        res.status(400).json({
                                success: false,
                                message: "無効なカテゴリIDです"
                        } as ApiResponse<null>);
                        return;
                }

                // カテゴリを削除
                const deleted = await CategoryService.deleteCategory(id);

                if (!deleted) {
                        res.status(409).json({
                                success: false,
                                message: "商品が関連付けられているため削除できません",
                                data: { deleted: false }
                        } as ApiResponse<{ deleted: boolean }>);
                        return;
                }

                res.status(200).json({
                        success: true,
                        message: "カテゴリを削除しました",
                        data: { deleted: true }
                } as ApiResponse<{ deleted: boolean }>);
        } catch (error) {
                console.error('カテゴリ削除エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリの削除に失敗しました"
                } as ApiResponse<null>);
        }
};