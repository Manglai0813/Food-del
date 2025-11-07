import type { Request, Response, NextFunction } from 'express';

/**
 * リクエスト制御ミドルウェア
 * サイズ制限、タイムアウト制御、不審なパターン検出
 */

/**
 * リクエストサイズ制限設定
 * DoS攻撃対策としてペイロードサイズを制限
 */
export const requestSizeLimits = {
        // JSON payload制限
        json: {
                limit: '1mb',
                type: 'application/json',
                verify: (req: Request, res: Response, buf: Buffer) => {
                        // ペイロードサイズの詳細チェック
                        const size = buf.length;
                        if (size > 1024 * 1024) { // 1MB
                                throw new Error('JSONペイロードサイズが制限を超えています');
                        }

                        // 不審に大きなJSONオブジェクトの検出
                        try {
                                const jsonString = buf.toString();
                                const depthCheck = (jsonString.match(/\{/g) || []).length;
                                if (depthCheck > 100) { // ネストが深すぎる
                                        console.warn(`[SECURITY] Deep nested JSON detected: ${depthCheck} levels`);
                                }
                        } catch (error) {
                                // JSON解析エラーは Express が処理
                        }
                }
        },

        // URL-encoded制限
        urlencoded: {
                limit: '1mb',
                extended: true,
                parameterLimit: 1000, // パラメータ数制限
                type: 'application/x-www-form-urlencoded'
        },

        // Raw body制限（バイナリデータ用）
        raw: {
                limit: '10mb', // バイナリファイルアップロード用
                type: ['application/octet-stream']  // multipart/form-data は Multer が処理するため除外
        },

        // テキスト制限
        text: {
                limit: '1mb',
                type: 'text/plain'
        }
};

/**
 * リクエストタイムアウト制御
 * 長時間実行リクエストの制限
 */
export const requestTimeout = (timeoutMs: number = 30000) => {
        return (req: Request, res: Response, next: NextFunction) => {
                // タイムアウトの設定
                const timeout = setTimeout(() => {
                        if (!res.headersSent) {
                                // タイムアウトログの記録
                                console.warn(`[TIMEOUT] Request timeout: ${req.method} ${req.path} from ${req.ip}`);
                                console.warn(`[TIMEOUT] User-Agent: ${req.get('User-Agent')}`);

                                res.status(408).json({
                                        success: false,
                                        message: 'リクエストがタイムアウトしました',
                                        code: 'REQUEST_TIMEOUT',
                                        timestamp: new Date().toISOString()
                                });
                        }
                }, timeoutMs);

                // レスポンス完了時にタイムアウトをクリア
                res.on('finish', () => {
                        clearTimeout(timeout);
                });

                // エラー時にもクリア
                res.on('close', () => {
                        clearTimeout(timeout);
                });

                // 接続中断時にもクリア
                req.on('close', () => {
                        clearTimeout(timeout);
                });

                next();
        };
};

/**
 * リクエスト監視ミドルウェア
 * 不審なパターンの検出と記録
 */
export const requestMonitoring = (req: Request, res: Response, next: NextFunction) => {
        const startTime = Date.now();

        // リクエスト情報の収集
        const logData = {
                method: req.method,
                path: req.path,
                ip: req.ip,
                userAgent: req.get('User-Agent') || 'unknown',
                contentLength: req.get('Content-Length') || '0',
                referer: req.get('Referer') || 'none',
                timestamp: new Date().toISOString()
        };

        // 不審なパターンの検出
        const suspiciousFlags = detectSuspiciousPatterns(req);
        if (suspiciousFlags.length > 0) {
                console.warn('[SECURITY] Suspicious request detected:', {
                        ...logData,
                        suspiciousFlags,
                        query: req.query,
                        headers: filterSensitiveHeaders(req.headers)
                });
        }

        // レスポンス完了時の処理
        res.on('finish', () => {
                const duration = Date.now() - startTime;

                // パフォーマンス監視
                if (duration > 5000) { // 5秒以上
                        console.warn(`[PERFORMANCE] Slow request: ${req.method} ${req.path} - ${duration}ms`);
                }

                // セキュリティ関連のレスポンス監視
                if (res.statusCode >= 400) {
                        console.log(`[SECURITY] ${req.method} ${req.path} - ${res.statusCode} - ${duration}ms - IP: ${req.ip}`);
                }
        });

        next();
};

/**
 * 不審なパターンの検出
 */
function detectSuspiciousPatterns(req: Request): string[] {
        const flags: string[] = [];
        const queryString = JSON.stringify(req.query);
        const bodyString = req.body ? JSON.stringify(req.body) : '';
        const combinedData = queryString + bodyString;

        // SQLインジェクション試行の検出
        const sqlPatterns = [
                /('|(\\')|(;)|(\\;))/i,
                /(select|insert|update|delete|drop|create|alter|exec|execute)/i,
                /(union|join|where|having|group\s+by|order\s+by)/i,
                /(\bor\b|\band\b).*?['"]/i
        ];

        for (const pattern of sqlPatterns) {
                if (pattern.test(combinedData)) {
                        flags.push('SQL_INJECTION_ATTEMPT');
                        break;
                }
        }

        // XSS試行の検出
        const xssPatterns = [
                /<script[^>]*>.*?<\/script>/i,
                /javascript:/i,
                /on\w+\s*=/i,
                /<iframe[^>]*>/i,
                /eval\s*\(/i,
                /expression\s*\(/i
        ];

        for (const pattern of xssPatterns) {
                if (pattern.test(combinedData)) {
                        flags.push('XSS_ATTEMPT');
                        break;
                }
        }

        // パストラバーサル試行の検出
        const pathTraversalPatterns = [
                /(\.\.|\/\.\.|\\\.\.)/,
                /(\/etc\/passwd|\/windows\/system32)/i,
                /\.\.[\/\\]/
        ];

        for (const pattern of pathTraversalPatterns) {
                if (pattern.test(req.path) || pattern.test(combinedData)) {
                        flags.push('PATH_TRAVERSAL_ATTEMPT');
                        break;
                }
        }

        // 異常に大きなヘッダー
        const headerSize = JSON.stringify(req.headers).length;
        if (headerSize > 8192) { // 8KB
                flags.push('OVERSIZED_HEADERS');
        }

        // 異常に多いパラメータ
        const paramCount = Object.keys(req.query).length + Object.keys(req.body || {}).length;
        if (paramCount > 100) {
                flags.push('EXCESSIVE_PARAMETERS');
        }

        // 不審なUser-Agent
        const userAgent = req.get('User-Agent') || '';
        const suspiciousUAPatterns = [
                /sqlmap/i,
                /nmap/i,
                /nikto/i,
                /burp/i,
                /curl.*bot/i,
                /scanner/i
        ];

        for (const pattern of suspiciousUAPatterns) {
                if (pattern.test(userAgent)) {
                        flags.push('SUSPICIOUS_USER_AGENT');
                        break;
                }
        }

        // 異常なメソッド使用
        const normalMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];
        if (!normalMethods.includes(req.method)) {
                flags.push('UNUSUAL_HTTP_METHOD');
        }

        return flags;
}

/**
 * 機密ヘッダーのフィルタリング
 */
function filterSensitiveHeaders(headers: any): any {
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        const filtered = { ...headers };

        for (const header of sensitiveHeaders) {
                if (filtered[header]) {
                        filtered[header] = '[FILTERED]';
                }
        }

        return filtered;
}

/**
 * エラーハンドリングミドルウェア
 * リクエスト制御関連のエラー処理
 */
export const requestControlErrorHandler = (error: any, req: Request, res: Response, next: NextFunction) => {
        // PayloadTooLargeError
        if (error.status === 413 || error.code === 'LIMIT_FILE_SIZE') {
                console.warn(`[SECURITY] Payload too large: ${req.ip} on ${req.path}`);
                res.status(413).json({
                        success: false,
                        message: 'リクエストサイズが大きすぎます',
                        code: 'PAYLOAD_TOO_LARGE'
                });
                return;
        }

        // JSON構文エラー
        if (error instanceof SyntaxError && 'body' in error) {
                console.warn(`[SECURITY] Invalid JSON payload: ${req.ip} on ${req.path}`);
                res.status(400).json({
                        success: false,
                        message: '無効なJSONフォーマットです',
                        code: 'INVALID_JSON'
                });
                return;
        }

        // その他のエラーは次のハンドラーに渡す
        next(error);
};