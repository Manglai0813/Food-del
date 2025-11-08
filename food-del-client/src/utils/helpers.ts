/**
 * その他ヘルパー関数
 *
 * クラス名結合、クエリパラメータ操作、オブジェクトコピー、
 * デバウンスなどの汎用ユーティリティ関数を提供します。
 */

/**
 * クラス名を条件付きで結合
 *
 * 条件付きでクラス名を組み合わせます。
 *
 * @param classes - クラス名の配列（false/null/undefinedは除外）
 * @returns スペース区切りのクラス名文字列
 *
 * @example
 * ```typescript
 * cn('btn', isActive && 'active', disabled && 'disabled')
 * // => 'btn active' (disabledがfalseの場合)
 * ```
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
        return classes.filter(Boolean).join(' ');
};

/**
 * URLクエリパラメータをオブジェクトに変換
 *
 * クエリ文字列をキーバリューペアのオブジェクトに変換します。
 *
 * @param search - クエリ文字列（例: 'page=1&limit=10'）
 * @returns パラメータオブジェクト
 */
export const parseQueryParams = (search: string): Record<string, string> => {
        const params = new URLSearchParams(search);
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
                result[key] = value;
        });
        return result;
};

/**
 * オブジェクトをURLクエリパラメータに変換
 *
 * オブジェクトをURLクエリ文字列に変換します。
 * null/undefined値は除外されます。
 *
 * @param params - パラメータオブジェクト
 * @returns クエリ文字列（例: 'page=1&limit=10'）
 *
 * @example
 * ```typescript
 * stringifyQueryParams({ page: 1, limit: 10 })
 * // => 'page=1&limit=10'
 * ```
 */
export const stringifyQueryParams = (params: Record<string, unknown>): string => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                        searchParams.append(key, String(value));
                }
        });
        return searchParams.toString();
};

/**
 * ディープコピー
 *
 * オブジェクトの深いコピーを作成します。
 * 【注意】シリアライズ不可の値（関数など）は失われます。
 *
 * @param obj - コピー対象オブジェクト
 * @returns コピーされたオブジェクト
 *
 * @example
 * ```typescript
 * const original = { user: { name: '太郎' } };
 * const copy = deepClone(original);
 * copy.user.name = '次郎';
 * console.log(original.user.name); // '太郎'（変更されない）
 * ```
 */
export const deepClone = <T>(obj: T): T => {
        return JSON.parse(JSON.stringify(obj)) as T;
};

/**
 * デバウンス
 *
 * 関数の呼び出しを遅延実行させ、指定時間内の連続呼び出しをまとめます。
 * 検索入力やウィンドウリサイズなど、頻繁に発火するイベントに有効です。
 *
 * @param func - デバウンス対象の関数
 * @param delay - 遅延時間（ミリ秒）
 * @returns デバウンスされた関数
 *
 * @example
 * ```typescript
 * const handleSearch = debounce((query: string) => {
 *   api.search(query);
 * }, 300);
 *
 * input.addEventListener('change', (e) => {
 *   handleSearch(e.target.value);
 * });
 * ```
 */
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
