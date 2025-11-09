import type { Response } from 'express';
import validator from 'validator';
import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
    AuthRequest,
    BodyRequest,
    LoginRequest,
    RegisterRequest,
    ApiResponse,
    LoginData,
    UserResponse,
    TokenRefreshRequest,
    TokenRefreshData,
    UpdateProfileRequest,
    ChangePasswordRequest
} from '@/types';
import { AuthService } from '@/services/authService';

// ユーザーログインコントローラー
const loginUser = async (
    req: BodyRequest<LoginRequest>,
    res: Response<ApiResponse<LoginData> | ApiResponse<null>>
): Promise<void> => {
    const { email, password } = req.body;

    try {
        // 入力値を検証
        if (!email || !password) {
            res.status(400).json({
                success: false,
                message: "すべてのフィールドが必要です"
            } as ApiResponse<null>);
            return;
        }

        // ユーザーが存在するかチェック
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "ユーザーが存在しません"
            } as ApiResponse<null>);
            return;
        }

        // パスワードを検証
        const match = await AuthService.comparePassword(password, user.password);

        if (!match) {
            res.status(404).json({
                success: false,
                message: "パスワードが正しくありません"
            } as ApiResponse<null>);
            return;
        }

        // トークンを作成
        const token = AuthService.createToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: "ログインが成功しました",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                }
            }
        } as ApiResponse<LoginData>);
    } catch (error) {
        console.error('ログインエラー:', error);
        res.status(500).json({
            success: false,
            message: "ログイン中にエラーが発生しました。後でもう一度お試しください。"
        } as ApiResponse<null>);
    }
};

// ユーザー登録コントローラー
const registerUser = async (
    req: BodyRequest<RegisterRequest>,
    res: Response<ApiResponse<LoginData> | ApiResponse<null>>
): Promise<void> => {
    const { name, password, email } = req.body;

    try {
        // 入力値を検証
        if (!name || !email || !password) {
            res.status(400).json({
                success: false,
                message: "すべてのフィールドが必要です"
            } as ApiResponse<null>);
            return;
        }

        // ユーザーが既に存在するかチェック
        const exists = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (exists) {
            res.status(409).json({
                success: false,
                message: "ユーザーが既に存在します"
            } as ApiResponse<null>);
            return;
        }

        // メール形式と強力なパスワードを検証
        if (!validator.isEmail(email)) {
            res.status(400).json({
                success: false,
                message: "有効なメールアドレスを入力してください"
            } as ApiResponse<null>);
            return;
        }

        // パスワード強度をチェック
        const passwordValidation = AuthService.validatePassword(password);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: passwordValidation.errors.join(', ')
            } as ApiResponse<null>);
            return;
        }

        // ユーザーパスワードをハッシュ化
        const hashedPassword = await AuthService.hashPassword(password);

        // Prismaを使用して新しいユーザーを作成
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'customer'
            }
        });

        // トークンを作成
        const token = AuthService.createToken({
            id: user.id,
            email: user.email,
            role: user.role
        });

        res.status(200).json({
            success: true,
            message: "ユーザー登録が成功しました",
            data: {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    phone: user.phone,
                    created_at: user.created_at,
                    updated_at: user.updated_at
                }
            }
        } as ApiResponse<LoginData>);

    } catch (error: unknown) {
        console.error('登録エラー:', error);
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
            res.status(409).json({
                success: false,
                message: "このメールアドレスは既に登録されています"
            } as ApiResponse<null>);
            return;
        }
        if (error && typeof error === 'object' && 'code' in error && error.code === 'P2000') {
            res.status(400).json({
                success: false,
                message: "入力データが長すぎます"
            } as ApiResponse<null>);
            return;
        }
        res.status(500).json({
            success: false,
            message: "登録中にエラーが発生しました。後でもう一度お試しください。"
        } as ApiResponse<null>);
    }
};

// ユーザーログアウトコントローラー
const logoutUser = async (_req: AuthRequest, res: Response<ApiResponse<null>>): Promise<void> => {
    try {
        res.status(200).json({
            success: true,
            message: "ログアウトが成功しました"
        } as ApiResponse<null>);
    } catch (error) {
        console.error('ログアウトエラー:', error);
        res.status(500).json({
            success: false,
            message: "ログアウト中にエラーが発生しました。後でもう一度お試しください。"
        } as ApiResponse<null>);
    }
};

// トークンリフレッシュコントローラー
const refreshToken = async (req: BodyRequest<TokenRefreshRequest>, res: Response<ApiResponse<TokenRefreshData> | ApiResponse<null>>): Promise<void> => {
    try {
        const { refreshToken: token } = req.body;

        // リフレッシュトークンが必須
        if (!token) {
            res.status(400).json({
                success: false,
                message: "リフレッシュトークンが必要です"
            } as ApiResponse<null>);
            return;
        }

        // リフレッシュトークンを検証
        let decoded;
        try {
            decoded = AuthService.verifyRefreshToken(token);
        } catch (error) {
            res.status(401).json({
                success: false,
                message: "無効または期限切れのリフレッシュトークンです"
            } as ApiResponse<null>);
            return;
        }

        // ユーザーがまだ存在するか確認
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                created_at: true,
                updated_at: true
            }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "ユーザーが見つかりません"
            } as ApiResponse<null>);
            return;
        }

        // 新しいアクセストークンとリフレッシュトークンを生成
        const newAccessToken = AuthService.createToken({
            id: user.id,
            email: user.email,
            role: user.role
        });
        const newRefreshToken = AuthService.createRefreshToken(user.id);

        res.status(200).json({
            success: true,
            message: "トークンが正常に更新されました",
            data: {
                token: newAccessToken,
                refreshToken: newRefreshToken,
                expiresIn: "7d",
                user: user
            }
        } as ApiResponse<TokenRefreshData>);

    } catch (error) {
        console.error('トークン更新エラー:', error);
        res.status(500).json({
            success: false,
            message: "トークン更新中にエラーが発生しました"
        } as ApiResponse<null>);
    }
};

const getUserProfile = async (req: AuthRequest, res: Response<ApiResponse<UserResponse>>): Promise<void> => {
    try {
        // req.userはisAuthenticatedミドルウェアによって提供される
        const user = req.user;

        if (!user) {
            res.status(401).json({
                success: false,
                message: "ユーザーが認証されていません"
            } as ApiResponse<UserResponse>);
            return;
        }

        res.status(200).json({
            success: true,
            message: "プロフィールが正常に取得されました",
            data: user
        } as ApiResponse<UserResponse>);

    } catch (error) {
        console.error('プロフィール取得エラー:', error);
        res.status(500).json({
            success: false,
            message: "プロフィール取得中にエラーが発生しました"
        } as ApiResponse<UserResponse>);
    }
};

// プロフィール更新コントローラー
const updateProfile = async (req: AuthRequest & BodyRequest<UpdateProfileRequest>, res: Response<ApiResponse<UserResponse>>): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { name, phone } = req.body;

        // データ検証
        if (!name && !phone) {
            res.status(400).json({
                success: false,
                message: "少なくとも一つのフィールド（名前または電話番号）が必要です"
            } as ApiResponse<UserResponse>);
            return;
        }

        // 更新データを構築
        const updateData: Prisma.UserUpdateInput = {};
        if (name) updateData.name = name.trim();
        if (phone) updateData.phone = phone.trim();

        // ユーザー情報を更新
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                created_at: true,
                updated_at: true
            }
        });

        res.status(200).json({
            success: true,
            message: "プロフィールが正常に更新されました",
            data: updatedUser
        } as ApiResponse<UserResponse>);

    } catch (error) {
        console.error('プロフィール更新エラー:', error);
        res.status(500).json({
            success: false,
            message: "プロフィール更新中にエラーが発生しました"
        } as ApiResponse<UserResponse>);
    }
};
// パスワード変更コントローラー
const changePassword = async (req: AuthRequest & BodyRequest<ChangePasswordRequest>, res: Response<ApiResponse<null>>): Promise<void> => {
    try {
        const userId = req.user!.id;
        const { currentPassword, newPassword, confirmPassword } = req.body;

        // データ検証
        if (!currentPassword || !newPassword || !confirmPassword) {
            res.status(400).json({
                success: false,
                message: "すべてのパスワードフィールドが必要です"
            } as ApiResponse<null>);
            return;
        }

        if (newPassword !== confirmPassword) {
            res.status(400).json({
                success: false,
                message: "新しいパスワードの確認が一致しません"
            } as ApiResponse<null>);
            return;
        }

        // 新しいパスワードの強度を検証
        const passwordValidation = AuthService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            res.status(400).json({
                success: false,
                message: passwordValidation.errors.join(', ')
            } as ApiResponse<null>);
            return;
        }

        // ユーザーの現在のパスワードを取得
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            res.status(404).json({
                success: false,
                message: "ユーザーが見つかりません"
            } as ApiResponse<null>);
            return;
        }

        // 現在のパスワードを検証
        const isCurrentPasswordValid = await AuthService.comparePassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            res.status(400).json({
                success: false,
                message: "現在のパスワードが正しくありません"
            } as ApiResponse<null>);
            return;
        }

        // 新しいパスワードをハッシュ化
        const hashedNewPassword = await AuthService.hashPassword(newPassword);

        // パスワードを更新
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });

        res.status(200).json({
            success: true,
            message: "パスワードが正常に変更されました"
        } as ApiResponse<null>);

    } catch (error) {
        console.error('パスワード変更エラー:', error);
        res.status(500).json({
            success: false,
            message: "パスワード変更中にエラーが発生しました"
        } as ApiResponse<null>);
    }
};

// すべてのコントローラー関数をエクスポート
export {
    loginUser,
    registerUser,
    logoutUser,
    refreshToken,
    getUserProfile,
    updateProfile,
    changePassword
};