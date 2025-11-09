import { useState, type FormEvent } from 'react';
import { useAuth } from '@/hooks';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface LoginPopupProps {
    setShowLogin: (show: boolean) => void;
}

// ログインポップアップコンポーネント
export const LoginPopup: React.FC<LoginPopupProps> = ({ setShowLogin }) => {
    const [currState, setCurrState] = useState<'Login' | 'Sign Up'>('Login');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const { login, register } = useAuth();

    // フォーム入力変更ハンドラ
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // フォーム送信ハンドラ
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            if (currState === 'Login') {
                await login({
                    email: formData.email,
                    password: formData.password,
                });
            } else {
                await register({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                });
            }
            setShowLogin(false);
        } catch (error: unknown) {
            let errorMessage = 'An error occurred';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null) {
                const errRecord = error as Record<string, unknown>;
                const responseData = errRecord.response as Record<string, unknown>;
                if (responseData && typeof responseData === 'object') {
                    const dataObj = responseData.data as Record<string, unknown>;
                    if (dataObj && typeof dataObj.message === 'string') {
                        errorMessage = dataObj.message;
                    }
                }
            }
            alert(errorMessage);
        }
    };

    return (
        <Dialog open={true} onOpenChange={setShowLogin}>
            <DialogContent className="sm:max-w-[425px] max-w-[90vw] p-0 gap-0">
                <DialogTitle className="sr-only">{currState}</DialogTitle>
                <DialogDescription className="sr-only">
                    {currState === 'Login'
                        ? 'Login to your account'
                        : 'Create a new account'}
                </DialogDescription>

                <Card className="border-0 shadow-none">
                    <CardHeader className="space-y-2 pb-4 mobile:pb-6 pt-6 mobile:pt-8 px-4 mobile:px-6">
                        <CardTitle className="text-xl mobile:text-2xl font-bold tracking-tight">
                            {currState}
                        </CardTitle>
                        <CardDescription className="text-xs mobile:text-sm">
                            {currState === 'Login'
                                ? 'Enter your email below to login to your account'
                                : 'Create a new account to get started'}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-6 mobile:pb-8 pt-0 px-4 mobile:px-6">
                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-4 mobile:gap-5">
                                {currState === 'Sign Up' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="name" className="text-sm font-medium">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="John Doe"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            className="h-10"
                                        />
                                    </div>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="email" className="text-sm font-medium">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="h-10"
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password" className="text-sm font-medium">
                                        Password
                                    </Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        className="h-10"
                                    />
                                </div>

                                <Button type="submit" className="w-full h-10 mt-2">
                                    {currState === 'Sign Up' ? 'Create account' : 'Login'}
                                </Button>

                                <div className="text-center text-sm text-muted-foreground mt-2">
                                    {currState === 'Login' ? (
                                        <p className="leading-relaxed">
                                            Don't have an account?{' '}
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="p-0 h-auto text-sm underline-offset-4"
                                                onClick={() => setCurrState('Sign Up')}
                                            >
                                                Sign up
                                            </Button>
                                        </p>
                                    ) : (
                                        <p className="leading-relaxed">
                                            Already have an account?{' '}
                                            <Button
                                                type="button"
                                                variant="link"
                                                className="p-0 h-auto text-sm underline-offset-4"
                                                onClick={() => setCurrState('Login')}
                                            >
                                                Login
                                            </Button>
                                        </p>
                                    )}
                                </div>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </DialogContent>
        </Dialog>
    );
};