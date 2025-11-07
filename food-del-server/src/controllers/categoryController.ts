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

/**
 * カテゴリリスト取得
 *
 * すべてのカテゴリをクエリパラメータに基づいて取得する。
 * フィルタリング、ソート対応。
 *
 * @param req - クエリパラメータを含むリクエスト
 *   - query.search?: string - カテゴリ名で検索
 *   - query.status?: boolean - ステータスで絞込（有効/無効）
 *   - query.sortBy?: 'name' | 'created_at' - ソート対象
 *   - query.sortOrder?: 'asc' | 'desc' - ソート順
 * @param res - カテゴリリスト
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. クエリパラメータを取得
 * 2. Service層でカテゴリリストを取得
 * 3. フィルタリング、ソートを適用
 * 4. カテゴリリストをレスポンス
 *
 * @example
 * GET /api/categories?status=true&sortBy=name
 */
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

/**
 * カテゴリ詳細取得
 *
 * 指定されたIDのカテゴリ詳細情報を取得する。
 *
 * @param req - URLパラメータ（カテゴリID）を含むリクエスト
 *   - params.id: string - カテゴリID（URLパラメータ）（必須）
 * @param res - カテゴリの詳細情報
 * @returns void
 *
 * @throws 400 - カテゴリIDが不足 または 無効なID形式
 * @throws 404 - カテゴリが見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータからカテゴリIDを抽出
 * 2. カテゴリIDの有効性確認（数値型へ変換）
 * 3. Service層でカテゴリ詳細を取得
 * 4. カテゴリが存在するか確認
 * 5. カテゴリ詳細情報をレスポンス
 *
 * @example
 * GET /api/categories/3
 */
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

/**
 * 有効カテゴリリスト取得
 *
 * 有効（status = true）なカテゴリのみを取得する。
 * ユーザーフロントエンドやAPI利用者向け。
 *
 * @param _req - 認証済みリクエスト（パラメータなし）
 * @param res - 有効なカテゴリのリスト
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. Service層で有効なカテゴリのみを取得
 * 2. ステータス = trueのカテゴリをフィルタリング
 * 3. カテゴリリストをレスポンス
 *
 * @example
 * GET /api/categories/active
 */
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

/**
 * カテゴリ別商品リスト取得
 *
 * 指定されたカテゴリに属する商品をページネーション付きで取得する。
 * クライアント向けエンドポイント。
 *
 * @param req - URLパラメータ（カテゴリID）とクエリパラメータを含むリクエスト
 *   - params.id: string - カテゴリID（URLパラメータ）（必須）
 *   - query.page?: number - ページ番号（デフォルト: 1）
 *   - query.limit?: number - 1ページあたりの件数（デフォルト: 20）
 *   - query.search?: string - 商品名で検索
 *   - query.sortBy?: 'name' | 'price' | 'created_at' - ソート対象
 *   - query.sortOrder?: 'asc' | 'desc' - ソート順
 * @param res - ページネーション付き商品リスト（敏感情報を除外）
 * @returns void
 *
 * @throws 400 - カテゴリIDが不足 または 無効なID形式
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータからカテゴリIDを抽出
 * 2. カテゴリIDの有効性確認
 * 3. クエリパラメータを取得
 * 4. Service層でカテゴリ下の商品を取得
 * 5. 公開用データに変換（敏感情報を除外）
 * 6. ページネーション情報を含めてレスポンス
 *
 * @example
 * GET /api/categories/2/foods?page=1&limit=12
 */
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

/**
 * カテゴリ作成（管理者専用）
 *
 * 新しいカテゴリを作成する。
 * カテゴリ名は必須。
 *
 * @param req - リクエストボディ
 *   - body.name: string - カテゴリ名（必須）
 *   - body.description?: string - カテゴリの説明
 *   - body.status?: boolean - 公開状態（デフォルト: true）
 * @param res - 作成されたカテゴリ情報
 * @returns void
 *
 * @throws 400 - カテゴリ名が不足
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. リクエストボディからカテゴリ情報を取得
 * 2. 必須フィールド（name）を検証
 * 3. Service層で新しいカテゴリを作成
 * 4. 作成されたカテゴリ情報をレスポンス
 *
 * @example
 * POST /api/categories
 * Content-Type: application/json
 * {
 *   "name": "ラーメン",
 *   "description": "全てのラーメン商品",
 *   "status": true
 * }
 */
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

/**
 * カテゴリ更新（管理者専用）
 *
 * 既存のカテゴリ情報を更新する。
 *
 * @param req - URLパラメータとリクエストボディ
 *   - params.id: string - カテゴリID（URLパラメータ）（必須）
 *   - body.name?: string - 新しいカテゴリ名
 *   - body.description?: string - 新しい説明
 *   - body.status?: boolean - 新しい公開状態
 * @param res - 更新されたカテゴリ情報
 * @returns void
 *
 * @throws 400 - カテゴリIDが不足 または 無効なID形式
 * @throws 404 - カテゴリが見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータからカテゴリIDを抽出
 * 2. カテゴリIDの有効性確認
 * 3. リクエストボディから更新データを取得
 * 4. Service層でカテゴリを更新
 * 5. カテゴリが存在するか確認
 * 6. 更新されたカテゴリ情報をレスポンス
 *
 * @example
 * PUT /api/categories/3
 * Content-Type: application/json
 * {
 *   "name": "ラーメン・麺類",
 *   "description": "全ての麺類商品"
 * }
 */
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

/**
 * カテゴリステータス更新（管理者専用）
 *
 * カテゴリの公開/非公開状態を切り替える。
 * statusフィールドのみを更新する特化型エンドポイント。
 *
 * @param req - URLパラメータとリクエストボディ
 *   - params.id: string - カテゴリID（URLパラメータ）（必須）
 *   - body.status: boolean - 新しいステータス（必須、boolean型のみ）
 * @param res - 更新されたカテゴリ情報
 * @returns void
 *
 * @throws 400 - カテゴリIDが不足 または 無効なID形式 または statusが無効
 * @throws 404 - カテゴリが見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータからカテゴリIDを抽出
 * 2. カテゴリIDの有効性確認
 * 3. リクエストボディからステータスを取得
 * 4. ステータスがboolean値か検証
 * 5. Service層でカテゴリステータスを更新
 * 6. 更新されたカテゴリ情報をレスポンス
 *
 * @example
 * PATCH /api/categories/3/status
 * Content-Type: application/json
 * {
 *   "status": false
 * }
 */
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

/**
 * カテゴリ削除（管理者専用）
 *
 * カテゴリを削除する。
 * 関連商品がある場合は削除できない（データ整合性保護）。
 *
 * @param req - URLパラメータ（カテゴリID）を含むリクエスト
 *   - params.id: string - カテゴリID（URLパラメータ）（必須）
 * @param res - 削除結果（deleted: boolean）
 * @returns void
 *
 * @throws 400 - カテゴリIDが不足 または 無効なID形式
 * @throws 409 - 関連商品が存在するため削除不可
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータからカテゴリIDを抽出
 * 2. カテゴリIDの有効性確認
 * 3. Service層でカテゴリを削除
 * 4. 関連商品の有無を確認
 * 5. 削除可能な場合は削除、不可の場合は409エラーを返す
 * 6. 削除結果をレスポンス
 *
 * @example
 * DELETE /api/categories/3
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "message": "カテゴリを削除しました",
 *   "data": { "deleted": true }
 * }
 */
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