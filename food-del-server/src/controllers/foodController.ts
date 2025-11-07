import type { Response } from 'express';
import { FoodService } from '@/services/foodService';
import { FileService } from '@/services/fileService';
import type {
        AuthRequest,
        ApiResponse,
        FoodData,
        PaginatedResponse,
        CreateFoodRequest,
        UpdateFoodRequest,
        FoodSearchQuery,
        QueryRequest,
        BodyRequest,
        FileRequest,
        ParamsRequest,
        IdParams,
        PublicFoodWithCategory
} from '@/types';
import { toPublicFoodWithCategory, toPublicFoodArray } from '@/types';

/**
 * 商品コントローラー
 * 商品の検索、作成、更新、削除などのAPI処理を担当します
 */

/**
 * 商品リスト取得（公開API）
 *
 * 公開商品のみを返すエンドポイント。検索、フィルタリング、ページネーション対応。
 *
 * @param req - クエリパラメータ（カテゴリID、検索キーワード、ページ、制限数など）
 * @param res - ページネーション付き商品リスト
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * クエリパラメータ:
 * - categoryId?: number - カテゴリIDで絞込
 * - search?: string - 商品名で検索
 * - page?: number - ページ番号（デフォルト: 1）
 * - limit?: number - 1ページあたりの件数（デフォルト: 20）
 * - sortBy?: 'name' | 'price' | 'created_at' - ソート対象
 * - sortOrder?: 'asc' | 'desc' - ソート順
 *
 * 注記: statusは常にtrueで固定（公開商品のみ）
 */
export const getFoods = async (req: QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
        try {
                // 公開商品のみに強制
                const query: FoodSearchQuery = {
                        ...req.query,
                        status: true
                };

                // クエリパラメータに基づいて商品を取得
                const result = await FoodService.getFoods(query);

                // 公開用データに変換（敏感情報を除外）
                const publicData = toPublicFoodArray(result.data);

                res.status(200).json({
                        success: true,
                        message: "商品リストを取得しました",
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
                console.error('商品リスト取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "商品リストの取得に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * Dashboard商品リスト取得（管理者用）
 *
 * 管理者用エンドポイント。公開・非公開を問わずすべての商品を返す。
 * 在庫情報を含む完全なデータを返す。
 *
 * @param req - クエリパラメータ（カテゴリID、検索キーワード、ページ、制限数など）
 * @param res - ページネーション付き商品リスト（在庫情報を含む）
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * クエリパラメータ:
 * - categoryId?: number - カテゴリIDで絞込
 * - search?: string - 商品名で検索
 * - page?: number - ページ番号（デフォルト: 1）
 * - limit?: number - 1ページあたりの件数（デフォルト: 20）
 * - sortBy?: 'name' | 'price' | 'created_at' - ソート対象
 * - sortOrder?: 'asc' | 'desc' - ソート順
 *
 * 注記: statusフィルタなし。すべての商品（公開・非公開）を返す
 */
export const getDashboardFoods = async (req: QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
        try {
                // 管理者は全商品を取得可能（statusフィルタなし）
                const result = await FoodService.getFoods(req.query);

                // Dashboard用：完全なデータを返す（在庫情報を含む）
                res.status(200).json({
                        success: true,
                        message: "商品リストを取得しました",
                        data: result.data,
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
                console.error('商品リスト取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "商品リストの取得に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * 公開商品リスト取得（クライアント用）
 *
 * クライアント用エンドポイント。公開商品のみを返す。
 * デフォルトで1ページあたり50件を返す。
 *
 * @param req - クエリパラメータ（カテゴリID、検索キーワード、ページ、制限数など）
 * @param res - ページネーション付き商品リスト（敏感情報を除外）
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * クエリパラメータ:
 * - categoryId?: number - カテゴリIDで絞込
 * - search?: string - 商品名で検索
 * - page?: number - ページ番号（デフォルト: 1）
 * - limit?: number - 1ページあたりの件数（デフォルト: 50）
 * - sortBy?: 'name' | 'price' | 'created_at' - ソート対象
 * - sortOrder?: 'asc' | 'desc' - ソート順
 *
 * 注記: 在庫や価格変更などの敏感情報は返されません。
 * statusは常にtrueで固定（公開商品のみ）
 */
export const getPublicFoods = async (req: QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
        try {
                // Zodバリデーション済みのクエリを使用（PublicFoodSearchSchemaで検証済み）
                const query: FoodSearchQuery = {
                        ...req.query,
                        status: true // 公開商品のみに強制
                };

                // クエリパラメータに基づいて商品を取得
                const result = await FoodService.getFoods(query);

                // 公開用データに変換（敏感情報を除外）
                const publicData = toPublicFoodArray(result.data);

                res.status(200).json({
                        success: true,
                        message: "商品リストを取得しました",
                        data: result.data,
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
                console.error('商品リスト取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "商品リストの取得に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * 商品詳細取得
 *
 * 商品IDを指定して、個別の商品詳細情報を取得する。
 * 公開・非公開の区別なく、存在する商品であれば返す。
 *
 * @param req - URLパラメータ（商品ID）
 * @param res - 商品詳細情報（敏感情報を除外）
 * @returns void
 *
 * @throws 404 - 商品が見つからない場合
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータから商品IDを抽出
 * 2. 商品IDはZodバリデーション済み
 * 3. 商品情報をデータベースから取得
 * 4. 存在確認
 * 5. 公開用データに変換（敏感情報を除外）
 * 6. レスポンス返却
 *
 * @example
 * GET /api/foods/123
 */
export const getFoodById = async (req: ParamsRequest<IdParams>, res: Response<ApiResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
        try {
                // IDはZodバリデーションにより既に検証済みで安全
                const id = req.params.id as unknown as number;

                // 商品を取得
                const food = await FoodService.getFoodById(id);

                if (!food) {
                        res.status(404).json({
                                success: false,
                                message: "商品が見つかりません"
                        } as ApiResponse<null>);
                        return;
                }

                // 公開用データに変換（敏感情報を除外）
                const publicFood = toPublicFoodWithCategory(food);

                res.status(200).json({
                        success: true,
                        message: "商品詳細を取得しました",
                        data: publicFood
                } as ApiResponse<PublicFoodWithCategory>);
        } catch (error) {
                console.error('商品詳細取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "商品詳細の取得に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * 推奨商品取得
 *
 * ホームページなどに表示する、おすすめの商品リストを取得する。
 * デフォルトで5件を返す。
 *
 * @param req - 認証済みリクエスト（limitクエリパラメータを含む）
 * @param res - 推奨商品リスト（敏感情報を除外）
 * @returns void
 *
 * @throws 500 - サーバーエラー
 *
 * クエリパラメータ:
 * - limit?: number - 返す商品数（デフォルト: 5）
 *
 * 処理フロー:
 * 1. クエリパラメータからlimitを取得
 * 2. デフォルト値5を使用
 * 3. Service層で推奨商品を取得
 * 4. 公開用データに変換
 * 5. 配列でレスポンス返却
 *
 * @example
 * GET /api/foods/featured?limit=10
 */
export const getFeaturedFoods = async (req: AuthRequest, res: Response<ApiResponse<PublicFoodWithCategory[]> | ApiResponse<null>>): Promise<void> => {
        try {
                // クエリパラメータからlimitを取得、デフォルトは5
                const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

                // limitが有効な数値であることを確認
                const foods = await FoodService.getFeaturedFoods(limit);

                // 公開用データに変換（敏感情報を除外）
                const publicData = toPublicFoodArray(foods);

                res.status(200).json({
                        success: true,
                        message: "推奨商品を取得しました",
                        data: publicData
                } as ApiResponse<PublicFoodWithCategory[]>);
        } catch (error) {
                console.error('推奨商品取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "推奨商品の取得に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * カテゴリ別商品取得
 *
 * 指定されたカテゴリIDに属する商品を取得する。
 * ページネーション対応。
 *
 * @param req - URLパラメータ（カテゴリID）とクエリパラメータを含むリクエスト
 *   - id: string - カテゴリID（URLパラメータ）（必須）
 *   - search?: string - 商品名で検索
 *   - page?: number - ページ番号（デフォルト: 1）
 *   - limit?: number - 1ページあたりの件数（デフォルト: 20）
 *   - sortBy?: 'name' | 'price' | 'created_at' - ソート対象
 *   - sortOrder?: 'asc' | 'desc' - ソート順
 * @param res - ページネーション付き商品リスト（敏感情報を除外）
 * @returns void
 *
 * @throws 400 - カテゴリIDが不足 または 無効なID形式
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータからカテゴリIDを抽出
 * 2. IDの有効性確認（数値型へ変換）
 * 3. Service層でカテゴリ別商品を取得
 * 4. 公開用データに変換（敏感情報を除外）
 * 5. ページネーション情報を含めてレスポンス
 *
 * @example
 * GET /api/foods/category/1?page=1&limit=20
 */
export const getFoodsByCategory = async (req: ParamsRequest<IdParams> & QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "カテゴリIDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDを数値に変換
                const categoryId = parseInt(req.params.id);

                if (isNaN(categoryId)) {
                        res.status(400).json({
                                success: false,
                                message: "無効なカテゴリIDです"
                        } as ApiResponse<null>);
                        return;
                }

                // クエリパラメータに基づいてカテゴリ別商品を取得
                const result = await FoodService.getFoodsByCategory(categoryId, req.query);

                // 公開用データに変換（敏感情報を除外）
                const publicData = toPublicFoodArray(result.data);

                res.status(200).json({
                        success: true,
                        message: "カテゴリ別商品を取得しました",
                        data: result.data,
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
                console.error('カテゴリ別商品取得エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "カテゴリ別商品の取得に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * 商品作成（管理者専用）
 *
 * 新しい商品を作成する。画像ファイルのアップロードが必須。
 * FormDataで送信されるため、数値型への変換が必要。
 *
 * @param req - ファイルと商品データを含むリクエスト
 *   - name: string - 商品名（必須）
 *   - description: string - 説明（必須）
 *   - price: string - 価格（FormDataで文字列）（必須）
 *   - category_id: string - カテゴリID（FormDataで文字列）（必須）
 *   - status?: boolean - 公開状態（デフォルト: true）
 *   - file: Express.Multer.File - 商品画像（必須）
 * @param res - 作成された商品情報
 * @returns void
 *
 * @throws 400 - 必須フィールドが不足 または 画像が未定義
 * @throws 409 - 商品名が既に存在
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. 商品画像ファイルの存在確認
 * 2. FormDataからデータを取得
 * 3. 文字列を数値型に変換
 * 4. 画像ファイルをサーバーに保存
 * 5. 商品情報をデータベースに保存
 * 6. 作成された商品情報をレスポンス
 *
 * @example
 * POST /api/foods
 * Content-Type: multipart/form-data
 * {
 *   "name": "ラーメン",
 *   "description": "豚骨ラーメン",
 *   "price": "900",
 *   "category_id": "1",
 *   "status": "true",
 *   "file": <binary>
 * }
 */
export const createFood = async (req: FileRequest & BodyRequest<CreateFoodRequest>, res: Response<ApiResponse<FoodData> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.file) {
                        res.status(400).json({
                                success: false,
                                message: "商品画像が必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // FormData から文字列で送信されたデータを数値に変換
                const { name, description, price, category_id, status } = req.body;

                // 数値型への変換（FormData は全て文字列として送信されるため）
                const numPrice = typeof price === 'string' ? parseFloat(price) : price;
                const numCategoryId = typeof category_id === 'string' ? parseInt(category_id, 10) : category_id;
                const numStatus = status === undefined ? undefined : (typeof status === 'string' ? status === 'true' : Boolean(status));

                // ファイルを保存
                const fileResult = await FileService.saveProductImage(req.file);

                // 商品を作成（数値型に変換されたデータを使用）
                const food = await FoodService.createFood({
                        name,
                        description,
                        price: numPrice,
                        category_id: numCategoryId,
                        status: numStatus !== undefined ? numStatus : true
                }, fileResult.fileUrl);

                res.status(201).json({
                        success: true,
                        message: "商品を作成しました",
                        data: food
                } as ApiResponse<FoodData>);
        } catch (error) {
                console.error('商品作成エラー:', error);

                if (error instanceof Error && error.message === 'Invalid file format or size') {
                        res.status(400).json({
                                success: false,
                                message: "無効なファイル形式またはサイズです"
                        } as ApiResponse<null>);
                        return;
                }

                res.status(500).json({
                        success: false,
                        message: "商品の作成に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * 商品更新（管理者専用）
 *
 * 既存の商品情報を更新する。オプションで画像の再アップロードが可能。
 * 画像がアップロードされた場合、古い画像は自動削除される。
 *
 * @param req - URLパラメータ、ファイル、商品更新データを含むリクエスト
 *   - id: string - 商品ID（URLパラメータ）（必須）
 *   - name?: string - 商品名
 *   - description?: string - 説明
 *   - price?: string - 価格（FormDataで文字列）
 *   - category_id?: string - カテゴリID（FormDataで文字列）
 *   - status?: boolean - 公開状態
 *   - file?: Express.Multer.File - 新しい商品画像（オプション）
 * @param res - 更新された商品情報
 * @returns void
 *
 * @throws 400 - 必須フィールドが不足 または 無効なID形式
 * @throws 404 - 商品が見つからない
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータから商品IDを抽出
 * 2. IDの有効性確認
 * 3. 既存商品の存在確認
 * 4. 新しい画像がある場合：
 *    a. 古い画像をファイルシステムから削除
 *    b. 新しい画像を保存
 * 5. FormDataから文字列値を数値型に変換
 * 6. 商品情報をデータベースで更新
 * 7. 更新された商品情報をレスポンス
 *
 * @example
 * PUT /api/foods/123
 * Content-Type: multipart/form-data
 * {
 *   "name": "新しいラーメン",
 *   "price": "1200",
 *   "file": <binary>
 * }
 */
export const updateFood = async (req: ParamsRequest<IdParams> & FileRequest & BodyRequest<UpdateFoodRequest>, res: Response<ApiResponse<FoodData> | ApiResponse<null>>): Promise<void> => {
        try {
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "商品IDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDを数値に変換
                const id = parseInt(req.params.id);

                if (isNaN(id)) {
                        res.status(400).json({
                                success: false,
                                message: "無効な商品IDです"
                        } as ApiResponse<null>);
                        return;
                }

                // 既存商品の存在確認
                const existingFood = await FoodService.getFoodById(id);
                if (!existingFood) {
                        res.status(404).json({
                                success: false,
                                message: "商品が見つかりません"
                        } as ApiResponse<null>);
                        return;
                }

                // 画像パスの初期化
                let imagePath: string | undefined;

                // 新しい画像がアップロードされた場合
                if (req.file) {
                        // 古い画像を削除
                        if (existingFood.image_path) {
                                await FileService.deleteFile(existingFood.image_path);
                        }

                        // 新しい画像を保存
                        const fileResult = await FileService.saveProductImage(req.file);
                        imagePath = fileResult.fileUrl;
                }

                // データ変換（FormData は全て文字列として送信されるため）
                const updateData: UpdateFoodRequest = { ...req.body };
                if (updateData.price !== undefined) {
                        updateData.price = typeof updateData.price === 'string'
                                ? parseFloat(updateData.price)
                                : updateData.price;
                }

                // カテゴリIDを数値に変換
                if (updateData.category_id !== undefined) {
                        updateData.category_id = typeof updateData.category_id === 'string'
                                ? parseInt(updateData.category_id, 10)
                                : updateData.category_id;
                }

                // 商品を更新
                const updatedFood = await FoodService.updateFood(id, updateData, imagePath);

                res.status(200).json({
                        success: true,
                        message: "商品を更新しました",
                        data: updatedFood!
                } as ApiResponse<FoodData>);
        } catch (error) {
                console.error('商品更新エラー:', error);

                if (error instanceof Error && error.message === 'Invalid file format or size') {
                        res.status(400).json({
                                success: false,
                                message: "無効なファイル形式またはサイズです"
                        } as ApiResponse<null>);
                        return;
                }

                res.status(500).json({
                        success: false,
                        message: "商品の更新に失敗しました"
                } as ApiResponse<null>);
        }
};

/**
 * 商品削除（管理者専用）
 *
 * 商品を削除する（ソフトデリート）。
 * ソフトデリートを使用しているため、データベースから完全には削除されず、
 * statusフィールドがfalseに変更される。
 *
 * @param req - URLパラメータ（商品ID）を含むリクエスト
 *   - id: string - 商品ID（URLパラメータ）（必須）
 * @param res - 削除結果（deleted: boolean）
 * @returns void
 *
 * @throws 400 - 必須フィールドが不足 または 無効なID形式
 * @throws 500 - サーバーエラー
 *
 * 処理フロー:
 * 1. URLパラメータから商品IDを抽出
 * 2. IDの有効性確認
 * 3. Service層で商品をソフトデリート
 * 4. 削除結果（成功/失敗）をレスポンス
 *
 * @example
 * DELETE /api/foods/123
 *
 * レスポンス:
 * {
 *   "success": true,
 *   "message": "商品を削除しました",
 *   "data": { "deleted": true }
 * }
 */
export const deleteFood = async (req: ParamsRequest<IdParams>, res: Response<ApiResponse<{ deleted: boolean }> | ApiResponse<null>>): Promise<void> => {
        try {
                // ID検証
                if (!req.params.id) {
                        res.status(400).json({
                                success: false,
                                message: "商品IDが必要です"
                        } as ApiResponse<null>);
                        return;
                }

                // IDを数値に変換
                const id = parseInt(req.params.id);
                if (isNaN(id)) {
                        res.status(400).json({
                                success: false,
                                message: "無効な商品IDです"
                        } as ApiResponse<null>);
                        return;
                }

                // 商品削除（ソフトデリート）
                const deleted = await FoodService.deleteFood(id);

                res.status(200).json({
                        success: true,
                        message: deleted ? "商品を削除しました" : "商品の削除に失敗しました",
                        data: { deleted }
                } as ApiResponse<{ deleted: boolean }>);
        } catch (error) {
                console.error('商品削除エラー:', error);
                res.status(500).json({
                        success: false,
                        message: "商品の削除に失敗しました"
                } as ApiResponse<null>);
        }
};