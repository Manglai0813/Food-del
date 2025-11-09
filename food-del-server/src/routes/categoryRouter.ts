import express, { Router } from "express";
import {
    getCategories,
    getCategoryById,
    getActiveCategories,
    getCategoryFoods,
    createCategory,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
} from "@/controllers/categoryController";
import { isAdmin } from "@/middleware/authMiddleware";

// カテゴリールーターの作成
const categoryRouter: Router = express.Router();

// すべてのカテゴリーを取得
categoryRouter.get("/", getCategories);

// アクティブなカテゴリーを取得
categoryRouter.get("/active", getActiveCategories);

// 指定されたカテゴリーの食品を取得
categoryRouter.get("/:id/foods", getCategoryFoods);

//  IDでカテゴリーを取得
categoryRouter.get("/:id", getCategoryById);

// 新しいカテゴリーを作成
categoryRouter.post("/", isAdmin, createCategory);

// 既存のカテゴリーを更新
categoryRouter.put("/:id", isAdmin, updateCategory);

//  カテゴリーのステータスを更新
categoryRouter.patch("/:id/status", isAdmin, updateCategoryStatus);

// カテゴリーを削除
categoryRouter.delete("/:id", isAdmin, deleteCategory);

export default categoryRouter;