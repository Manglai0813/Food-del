import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { JwtPayload } from '@/types';
import { isRefreshTokenPayload } from '@/types';
import { env } from '@/lib/env';

/**
 * 認証に関連するサービスを提供するクラスです。
 * JWTトークンの生成、検証、パスワードのハッシュ化、比較、
 * およびパスワードの強度検証の機能を含みます。
 */
export class AuthService {

        // JWTトークンを作成
        static createToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
                return jwt.sign(
                        payload, // 署名するペイロード
                        env.JWT_SECRET,
                        {
                                expiresIn: '7d',
                                issuer: 'food-del-api',
                                audience: 'food-del-client'
                        }
                );
        }

        // リフレッシュトークンを作成
        static createRefreshToken(userId: number): string {
                return jwt.sign(
                        { userId, type: 'refresh' },
                        env.JWT_REFRESH_SECRET,
                        { expiresIn: '30d' }
                );
        }

        // トークンを検証
        static verifyToken(token: string): JwtPayload {
                try {
                        return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
                } catch (error) {
                        if (error instanceof jwt.JsonWebTokenError) {
                                throw new Error('トークンが無効です');
                        }
                        if (error instanceof jwt.TokenExpiredError) {
                                throw new Error('トークンの有効期限が切れています');
                        }
                        throw error;
                }
        }

        // リフレッシュトークンを検証
        static verifyRefreshToken(token: string): { userId: number } {
                try {
                        const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);

                        // リフレッシュトークンの型安全検証
                        if (!isRefreshTokenPayload(decoded)) {
                                throw new Error('無効なリフレッシュトークンペイロードです');
                        }

                        return { userId: decoded.userId };
                } catch (error) {
                        if (error instanceof jwt.JsonWebTokenError) {
                                throw new Error('リフレッシュトークンが無効です');
                        }
                        if (error instanceof jwt.TokenExpiredError) {
                                throw new Error('リフレッシュトークンの有効期限が切れています');
                        }
                        throw error;
                }
        }

        // パスワードをハッシュ化
        static async hashPassword(password: string): Promise<string> {
                return bcrypt.hash(password, 10);
        }

        // パスワードを比較
        static async comparePassword(password: string, hash: string): Promise<boolean> {
                return bcrypt.compare(password, hash);
        }

        // パスワードの強度を検証（ユーザー体験を重視したバランス型アプローチ）
        static validatePassword(password: string): {
                isValid: boolean;
                errors: string[];
                strength: 'weak' | 'medium' | 'strong';
                suggestions: string[];
        } {
                const errors: string[] = [];
                const suggestions: string[] = [];
                let characterTypes = 0;

                // 基本的な長さチェック（セキュリティの最低要件）
                if (password.length < 8) {
                        errors.push('パスワードは最低8文字以上である必要があります');
                }

                // 文字種別の確認
                const hasUppercase = /[A-Z]/.test(password);
                const hasLowercase = /[a-z]/.test(password);
                const hasNumbers = /\d/.test(password);
                const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

                if (hasUppercase) characterTypes++;
                if (hasLowercase) characterTypes++;
                if (hasNumbers) characterTypes++;
                if (hasSpecialChars) characterTypes++;

                // 最低2種類の文字種別が必要（UXとセキュリティのバランス）
                if (characterTypes < 2) {
                        errors.push('パスワードには少なくとも2種類の文字種別（大文字、小文字、数字、特殊文字）を含める必要があります');

                        // より具体的な提案を提供
                        if (!hasNumbers && !hasSpecialChars) {
                                suggestions.push('数字または特殊文字を追加してください');
                        } else if (!hasUppercase && !hasLowercase) {
                                suggestions.push('英字（大文字または小文字）を追加してください');
                        }
                }

                // パスワード強度の判定
                let strength: 'weak' | 'medium' | 'strong';
                if (password.length >= 12 && characterTypes >= 3) {
                        strength = 'strong';
                } else if (password.length >= 8 && characterTypes >= 2) {
                        strength = 'medium';
                } else {
                        strength = 'weak';
                }

                // 強度向上のための提案
                if (strength === 'medium') {
                        suggestions.push('より強力なパスワードにするには、12文字以上または3種類以上の文字種別をお勧めします');
                } else if (strength === 'weak') {
                        suggestions.push('パスワードを強化してください');
                }

                return {
                        isValid: errors.length === 0,
                        errors,
                        strength,
                        suggestions
                };
        }
}