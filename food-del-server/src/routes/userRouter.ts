import express, { Router } from "express";
import {
        loginUser,
        registerUser,
        logoutUser,
        refreshToken,
        getUserProfile,
        updateProfile,
        changePassword
} from "@/controllers/userController";
import { isAuthenticated } from "@/middleware/authMiddleware";
import { authRateLimit } from "@/middleware/rateLimiting";

// ユーザールーターの作成
const userRouter: Router = express.Router();

// 公開ルート（認証不要・レート制限付き）
userRouter.post("/auth/register", authRateLimit, registerUser); // ユーザー登録
userRouter.post("/auth/login", authRateLimit, loginUser); // ログイン

// 認証ルート（ログイン必要）
userRouter.post("/auth/logout", isAuthenticated, logoutUser); // ログアウト
userRouter.post("/auth/refresh", refreshToken); // トークンリフレッシュ
userRouter.post("/auth/change-password", isAuthenticated, changePassword); // パスワード変更

// ユーザープロフィールルート（ログイン必要）
userRouter.get("/profile", isAuthenticated, getUserProfile); // プロフィール取得
userRouter.put("/profile", isAuthenticated, updateProfile); // プロフィール更新

export default userRouter;
