import type { Response, NextFunction } from 'express';
import type { AuthRequest, ApiResponse, UserResponse } from '@/types';
import { isJwtPayload } from '@/types';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { env } from '@/lib/env';

// ユーザー選択フィールド
const USER_SELECT_FIELDS = {
    id: true,
    name: true,
    email: true,
    role: true,
    phone: true,
    created_at: true,
    updated_at: true
} as const;

// JWT トークンを検証し、ペイロードを返す`
function verifyJWTToken(authHeader: string | undefined): jwt.JwtPayload {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('アクセストークンが必要です');
    }

    // Bearer トークンを抽出
    const token = authHeader.split(' ')[1];

    if (!token) {
        throw new Error('トークンが無効です');
    }

    // トークンを検証
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!isJwtPayload(decoded)) {
        throw new Error('無効なトークンペイロードです');
    }

    return decoded;
}

// ユーザーIDからユーザー情報を取得
async function getUserById(userId: number): Promise<UserResponse | null> {
    return await prisma.user.findUnique({
        where: { id: userId },
        select: USER_SELECT_FIELDS
    });
}

// 認証エラーを処理し、適切なレスポンスを返す
function handleAuthError(
    error: unknown,
    res: Response<ApiResponse>
): void {
    if (error instanceof jwt.JsonWebTokenError) {
        res.status(401).json({
            success: false,
            message: "トークンが無効です"
        } as ApiResponse);
        return;
    }

    if (error instanceof jwt.TokenExpiredError) {
        res.status(401).json({
            success: false,
            message: "トークンの有効期限が切れています",
            code: "TOKEN_EXPIRED"
        } as ApiResponse);
        return;
    }

    if (error instanceof Error) {
        // カスタムエラーメッセージ
        if (error.message === 'アクセストークンが必要です' ||
            error.message === 'トークンが無効です' ||
            error.message === '無効なトークンペイロードです') {
            res.status(401).json({
                success: false,
                message: error.message
            } as ApiResponse);
            return;
        }

        if (error.message === 'ユーザーが見つかりません') {
            res.status(404).json({
                success: false,
                message: error.message
            } as ApiResponse);
            return;
        }
    }

    // その他のエラー
    console.error('認証エラー:', error);
    res.status(500).json({
        success: false,
        message: "サーバー内部エラー"
    } as ApiResponse);
}

// ユーザーを認証し、ユーザー情報を返すユーティリティ関数
async function authenticateUser(req: AuthRequest): Promise<UserResponse> {
    const decoded = verifyJWTToken(req.headers.authorization);
    const user = await getUserById(decoded.id);

    if (!user) {
        throw new Error('ユーザーが見つかりません');
    }

    return user;
}

// 認証ミドルウェア
export const isAuthenticated = async (
    req: AuthRequest,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await authenticateUser(req);
        req.user = user;
        next();
    } catch (error) {
        handleAuthError(error, res);
    }
};

// 管理者権限チェックミドルウェア
export const isAdmin = async (
    req: AuthRequest,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await authenticateUser(req);

        if (user.role !== 'admin') {
            res.status(403).json({
                success: false,
                message: "管理者権限が必要です",
                code: "INSUFFICIENT_PERMISSIONS"
            } as ApiResponse);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        handleAuthError(error, res);
    }
};

// スタッフ権限チェックミドルウェア
export const isStaff = async (
    req: AuthRequest,
    res: Response<ApiResponse>,
    next: NextFunction
): Promise<void> => {
    try {
        const user = await authenticateUser(req);

        const allowedRoles = ['admin', 'staff'];
        if (!allowedRoles.includes(user.role)) {
            res.status(403).json({
                success: false,
                message: "スタッフ権限が必要です"
            } as ApiResponse);
            return;
        }

        req.user = user;
        next();
    } catch (error) {
        handleAuthError(error, res);
    }
};