import express from "express";
import type { Router, Request, Response, NextFunction } from "express";
import {
    getFoods,
    getDashboardFoods,
    getPublicFoods,
    getFoodById,
    getFeaturedFoods,
    getFoodsByCategory,
    createFood,
    updateFood,
    deleteFood,
} from "@/controllers/foodController";
import { isAdmin } from "@/middleware/authMiddleware";
import { fileUploadMiddleware, handleFileUploadError } from "@/middleware/fileUpload";
import { validateQuery, validateParams, validateBody, IdParamsSchema } from "@/middleware/validation";
import {
    CreateFoodSchema,
    UpdateFoodSchema,
    FoodSearchSchema,
    PublicFoodSearchSchema
} from "@/types/utils/validation";

// フォームデータの型変換ミドルウェア
const convertFormDataTypes = (req: Request, res: Response, next: NextFunction) => {
    // 数値フィールドの変換
    if (req.body.price && typeof req.body.price === 'string') {
        req.body.price = parseFloat(req.body.price);
    }

    // カテゴリIDの変換
    if (req.body.category_id && typeof req.body.category_id === 'string') {
        req.body.category_id = parseInt(req.body.category_id, 10);
    }

    // 在庫フィールドの変換
    next();
};

// フードルーターの作成
const foodRouter: Router = express.Router();

// 食品一覧の取得
foodRouter.get("/", validateQuery(FoodSearchSchema), getFoods);

// 公開食品一覧の取得
foodRouter.get("/public", validateQuery(PublicFoodSearchSchema), getPublicFoods);

// 注目食品の取得
foodRouter.get("/featured", validateQuery(FoodSearchSchema), getFeaturedFoods);

// カテゴリ別食品の取得
foodRouter.get("/category/:id", validateParams(IdParamsSchema), validateQuery(FoodSearchSchema), getFoodsByCategory);

// ダッシュボード用全食品の取得
foodRouter.get("/dashboard/all", isAdmin, validateQuery(FoodSearchSchema), getDashboardFoods);

// IDで食品を取得
foodRouter.get("/:id", validateParams(IdParamsSchema), getFoodById);

// 食品の作成
foodRouter.post("/",
    isAdmin,
    fileUploadMiddleware.single("image"),
    handleFileUploadError,
    convertFormDataTypes,
    validateBody(CreateFoodSchema),
    createFood
);

// 食品の更新
foodRouter.put("/:id",
    isAdmin,
    validateParams(IdParamsSchema),
    fileUploadMiddleware.single("image"),
    handleFileUploadError,
    convertFormDataTypes,
    validateBody(UpdateFoodSchema),
    updateFood
);

// 食品の削除
foodRouter.delete("/:id", isAdmin, validateParams(IdParamsSchema), deleteFood);

export default foodRouter;