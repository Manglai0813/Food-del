import { prisma } from '@/lib/prisma';
import type { User, UserResponse, CreateUserRequest, UpdateProfileRequest } from '@/types';
import { AuthService } from './authService';

// ユーザーサービスクラス
export class UserService {

    // ユーザーを作成
    static async createUser(userData: CreateUserRequest): Promise<UserResponse> {
        // 1. メールアドレスがすでに存在するかチェック
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (existingUser) {
            throw new Error('このメールアドレスは既に登録されています');
        }

        // 2. パスワードの強度を検証
        const passwordValidation = AuthService.validatePassword(userData.password);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        // 3. パスワードをハッシュ化
        const hashedPassword = await AuthService.hashPassword(userData.password);

        // 4. ユーザーを作成
        const user = await prisma.user.create({
            data: {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'customer',
                phone: userData.phone
            },
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

        return user;
    }

    // メールアドレスでユーザーを検索
    static async findUserByEmailWithPassword(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { email }
        });
    }

    // IDでユーザーを検索
    static async findUserById(id: number): Promise<UserResponse | null> {
        return prisma.user.findUnique({
            where: { id },
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
    }

    // ユーザープロフィールを更新
    static async updateProfile(
        userId: number,
        updateData: UpdateProfileRequest
    ): Promise<UserResponse> {
        return prisma.user.update({
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
    }

    // パスワードを変更
    static async changePassword(
        userId: number,
        currentPassword: string,
        newPassword: string
    ): Promise<void> {
        // 1. ユーザーの現在のパスワードを取得
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new Error('ユーザーが見つかりません');
        }

        // 2. 現在のパスワードを検証
        const isCurrentPasswordValid = await AuthService.comparePassword(
            currentPassword,
            user.password
        );

        if (!isCurrentPasswordValid) {
            throw new Error('現在のパスワードが正しくありません');
        }

        // 3. 新しいパスワードの強度を検証
        const passwordValidation = AuthService.validatePassword(newPassword);
        if (!passwordValidation.isValid) {
            throw new Error(passwordValidation.errors.join(', '));
        }

        // 4. 新しいパスワードをハッシュ化して更新
        const hashedNewPassword = await AuthService.hashPassword(newPassword);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedNewPassword }
        });
    }
}