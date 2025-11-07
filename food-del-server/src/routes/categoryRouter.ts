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

// ルーターの初期化
const categoryRouter: Router = express.Router();

/**
 * カテゴリルーター
 * カテゴリ管理のためのAPIエンドポイントを提供します
 */

// 公開エンドポイント
categoryRouter.get("/", getCategories); // 全カテゴリを取得（クエリパラメータでフィルタ可能）
categoryRouter.get("/active", getActiveCategories); // 有効なカテゴリのみを取得
categoryRouter.get("/:id/foods", getCategoryFoods); // カテゴリ下の商品を取得
categoryRouter.get("/:id", getCategoryById); // IDでカテゴリを取得

// 管理者専用エンドポイント
categoryRouter.post("/", isAdmin, createCategory); // カテゴリを作成
categoryRouter.put("/:id", isAdmin, updateCategory); // カテゴリを更新
categoryRouter.patch("/:id/status", isAdmin, updateCategoryStatus); // カテゴリステータスを更新
categoryRouter.delete("/:id", isAdmin, deleteCategory); // カテゴリを削除

export default categoryRouter;