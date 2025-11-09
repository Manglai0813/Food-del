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

// 商品リストを取得、公開用
export const getFoods = async (req: QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
    try {
        // 公開商品のみに強制
        const query: FoodSearchQuery = {
            ...req.query,
            status: true
        };

        // クエリパラメータに基づいて商品を取得
        const result = await FoodService.getFoods(query);

        // 公開用データに変換
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

// 管理者用：全商品リストを取得
export const getDashboardFoods = async (req: QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
    try {
        // 管理者は全商品を取得可能
        const result = await FoodService.getFoods(req.query);

        // Dashboard用：完全なデータを返す
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

// 公開商品リストを取得
export const getPublicFoods = async (req: QueryRequest<FoodSearchQuery>, res: Response<PaginatedResponse<PublicFoodWithCategory> | ApiResponse<null>>): Promise<void> => {
    try {
        // Zodバリデーション済みのクエリを使用
        const query: FoodSearchQuery = {
            ...req.query,
            status: true // 公開商品のみに強制
        };

        // クエリパラメータに基づいて商品を取得
        const result = await FoodService.getFoods(query);

        // 公開用データに変換
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

// 商品詳細を取得、公開用
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

        // 公開用データに変換
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

// 推奨商品を取得、公開用
export const getFeaturedFoods = async (req: AuthRequest, res: Response<ApiResponse<PublicFoodWithCategory[]> | ApiResponse<null>>): Promise<void> => {
    try {
        // クエリパラメータからlimitを取得、デフォルトは5
        const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;

        // limitが有効な数値であることを確認
        const foods = await FoodService.getFeaturedFoods(limit);

        // 公開用データに変換
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

// カテゴリ別商品を取得、公開用
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

        // 公開用データに変換
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

// 商品作成
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

        // 数値型への変換
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        const numCategoryId = typeof category_id === 'string' ? parseInt(category_id, 10) : category_id;
        const numStatus = status === undefined ? undefined : (typeof status === 'string' ? status === 'true' : Boolean(status));

        // ファイルを保存
        const fileResult = await FileService.saveProductImage(req.file);

        // 商品を作成
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

// 商品更新
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

        // データ変換
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

// 商品削除
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

        // 商品削除
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