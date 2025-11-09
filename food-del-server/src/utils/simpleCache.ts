interface CacheItem<T> {
    data: T;
    expiry: number;
}

// シンプルなインメモリキャッシュクラス
class SimpleCache {
    private cache = new Map<string, CacheItem<any>>();
    private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5分

    set<T>(key: string, data: T, ttl: number = this.DEFAULT_TTL): void {
        // キャッシュサイズ制限（100エントリ）
        if (this.cache.size >= 100) {
            this.cleanup();
        }

        this.cache.set(key, {
            data,
            expiry: Date.now() + ttl
        });
    }

    get<T>(key: string): T | null {
        const item = this.cache.get(key);

        if (!item) {
            return null;
        }

        // 期限切れチェック
        if (Date.now() > item.expiry) {
            this.cache.delete(key);
            return null;
        }

        return item.data as T;
    }

    deletePattern(pattern: string): number {
        let count = 0;
        for (const key of this.cache.keys()) {
            if (key.includes(pattern)) {
                this.cache.delete(key);
                count++;
            }
        }
        return count;
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, item] of this.cache.entries()) {
            if (now > item.expiry) {
                this.cache.delete(key);
            }
        }
    }

    generateKey(prefix: string, params: Record<string, any>): string {
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}:${params[key]}`)
            .join('|');
        return `${prefix}:${sortedParams}`;
    }

    getStats() {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// シングルトンインスタンス
export const cache = new SimpleCache();

export function withCache<T>(
    keyPrefix: string,
    ttl: number = 5 * 60 * 1000
) {
    return function (target: unknown, propertyName: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: unknown[]): Promise<T> {
            // キャッシュキー生成
            const cacheKey = cache.generateKey(keyPrefix, { args: JSON.stringify(args) });

            // キャッシュから取得試行
            const cached = cache.get<T>(cacheKey);
            if (cached !== null) {
                return cached;
            }

            // キャッシュにない場合は実行
            const result = await originalMethod.apply(this, args);

            // 結果をキャッシュ
            cache.set(cacheKey, result, ttl);

            return result;
        };
    };
}