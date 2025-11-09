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

// ユーザー登録ルート
userRouter.post("/auth/register", authRateLimit, registerUser);

// ユーザーログインルート
userRouter.post("/auth/login", authRateLimit, loginUser);

// ユーザーログアウトルート
userRouter.post("/auth/logout", isAuthenticated, logoutUser);

// トークンリフレッシュルート
userRouter.post("/auth/refresh", refreshToken);

// パスワード変更ルート
userRouter.post("/auth/change-password", isAuthenticated, changePassword);

// ユーザープロフィール取得ルート
userRouter.get("/profile", isAuthenticated, getUserProfile);

// ユーザープロフィール更新ルート
userRouter.put("/profile", isAuthenticated, updateProfile);

export default userRouter;