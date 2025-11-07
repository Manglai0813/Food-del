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

// FormData から送信されたデータの型を変換するミドルウェア
const convertFormDataTypes = (req: Request, res: Response, next: NextFunction) => {
        // price と category_id を数値に変換
        if (req.body.price && typeof req.body.price === 'string') {
                req.body.price = parseFloat(req.body.price);
        }
        if (req.body.category_id && typeof req.body.category_id === 'string') {
                req.body.category_id = parseInt(req.body.category_id, 10);
        }
        next();
};

const foodRouter: Router = express.Router();

// 公開エンドポイント
foodRouter.get("/", validateQuery(FoodSearchSchema), getFoods); // 公開商品リスト（公開商品のみ、limit=10）
foodRouter.get("/public", validateQuery(PublicFoodSearchSchema), getPublicFoods); // クライアント専用商品リスト（公開商品のみ、limit=50）
foodRouter.get("/featured", validateQuery(FoodSearchSchema), getFeaturedFoods); // 注目の食品を取得
foodRouter.get("/category/:id", validateParams(IdParamsSchema), validateQuery(FoodSearchSchema), getFoodsByCategory); // カテゴリで食品を取得

// 管理者専用エンドポイント
foodRouter.get("/dashboard/all", isAdmin, validateQuery(FoodSearchSchema), getDashboardFoods); // Dashboard専用：全商品取得（非公開含む）
foodRouter.get("/:id", validateParams(IdParamsSchema), getFoodById); // IDで食品を取得（ID検証付き）
foodRouter.post("/",
        isAdmin,
        fileUploadMiddleware.single("image"),
        handleFileUploadError,
        convertFormDataTypes,
        validateBody(CreateFoodSchema),
        createFood
);
foodRouter.put("/:id",
        isAdmin,
        validateParams(IdParamsSchema),
        fileUploadMiddleware.single("image"),
        handleFileUploadError,
        convertFormDataTypes,
        validateBody(UpdateFoodSchema),
        updateFood
);
foodRouter.delete("/:id", isAdmin, validateParams(IdParamsSchema), deleteFood);

export default foodRouter;