// ユーザー入力のバリデーション関数群
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 日本の電話番号バリデーション
export const isValidPhone = (phone: string): boolean => {
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length === 10 || cleaned.length === 11;
};

// パスワードのバリデーション
export const validatePassword = (password: string): {
    isValid: boolean;
    errors: string[];
} => {
    const errors: string[] = [];

    if (password.length < 8) {
        errors.push('8文字以上必要です');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('大文字を1文字以上含める必要があります');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('小文字を1文字以上含める必要があります');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('数字を1文字以上含める必要があります');
    }

    return {
        isValid: errors.length === 0,
        errors,
    };
};
