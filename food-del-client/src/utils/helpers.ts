// ユーティリティ関数集
export const cn = (...classes: (string | undefined | null | false)[]): string => {
    return classes.filter(Boolean).join(' ');
};

// URLクエリパラメータをオブジェクトに変換
export const parseQueryParams = (search: string): Record<string, string> => {
    const params = new URLSearchParams(search);
    const result: Record<string, string> = {};
    params.forEach((value, key) => {
        result[key] = value;
    });
    return result;
};

// オブジェクトをURLクエリパラメータに変換
export const stringifyQueryParams = (params: Record<string, unknown>): string => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
            searchParams.append(key, String(value));
        }
    });
    return searchParams.toString();
};

// 深いクローンを作成
export const deepClone = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj)) as T;
};

// デバウンス関数
export const debounce = <T extends (...args: unknown[]) => unknown>(
    func: T,
    delay: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: ReturnType<typeof setTimeout>;
    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
};