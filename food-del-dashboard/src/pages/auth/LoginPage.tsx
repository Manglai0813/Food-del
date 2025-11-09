import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks';
import type { LoginRequest } from '@/types/auth';

// ログインページコンポーネント
const LoginPage: React.FC = () => {
    // 認証ホック
    const { login, isAuthenticated, isLoading, loginError } = useAuth();

    // フォーム状態を管理
    const [formData, setFormData] = useState<LoginRequest>({
        email: '',
        password: '',
    });
    // パスワード表示切替フラグ
    const [showPassword, setShowPassword] = useState(false);
    // バリデーションエラーを管理
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    // 既に認証済みの場合はホームにリダイレクト
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // フォーム入力値を変更しエラーをクリア
    const handleInputChange = (field: keyof LoginRequest) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value,
        }));

        // 入力時にこのフィールドのエラーをクリア
        if (validationErrors[field]) {
            setValidationErrors(prev => ({
                ...prev,
                [field]: '',
            }));
        }
    };

    // フォーム入力を検証
    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};

        // メールアドレスの形式をチェック
        if (!formData.email) {
            errors.email = 'メールアドレスを入力してください';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = '有効なメールアドレスを入力してください';
        }

        // パスワードの必須チェック
        if (!formData.password) {
            errors.password = 'パスワードを入力してください';
        }

        // エラー状態を更新
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // ログイン submit処理
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // バリデーションチェック
        if (!validateForm()) return;

        // ログイン処理
        try {
            await login(formData);
        } catch (error: unknown) {
            const err = error as Error | undefined;
            console.error('Login error:', err?.message);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">


                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold">Food-Del Dashboard</CardTitle>
                        <CardDescription>
                            管理画面にアクセスするにはログインしてください
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">


                            {loginError ? (
                                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                                    {String(loginError.message || 'ログインに失敗しました')}
                                </div>
                            ) : null}


                            <div className="space-y-2">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleInputChange('email')}
                                    placeholder="admin@food-del.com"
                                    disabled={isLoading}
                                    className={validationErrors.email ? 'border-red-500' : ''}
                                />
                                {validationErrors.email && (
                                    <p className="text-sm text-red-600">{validationErrors.email}</p>
                                )}
                            </div>


                            <div className="space-y-2">
                                <Label htmlFor="password">パスワード</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={handleInputChange('password')}
                                        placeholder="パスワードを入力"
                                        disabled={isLoading}
                                        className={validationErrors.password ? 'border-red-500' : ''}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-muted-foreground" />
                                        )}
                                    </Button>
                                </div>
                                {validationErrors.password && (
                                    <p className="text-sm text-red-600">{validationErrors.password}</p>
                                )}
                            </div>


                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isLoading ? 'ログイン中...' : 'ログイン'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage