import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '@/types';
import path from 'path';
import fs from 'fs';
import { FileValidator } from '@/utils/fileValidator';

// ファイルアクセスミドルウェア
export const fileAccessMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
        // リクエストされたパスの検証
        const requestedPath = req.path;

        // パスのバリデーション
        if (!FileValidator.validatePath(requestedPath)) {
            res.status(403).json({
                success: false,
                message: '不正なパスです'
            });
            return;
        }

        // プライベートファイルへのアクセス制御
        if (requestedPath.startsWith('/private/')) {
            if (!req.user) {
                res.status(401).json({
                    success: false,
                    message: '認証が必要です'
                });
                return;
            }
        }

        // ファイルの存在確認
        const filePath = path.join(process.cwd(), 'storage', requestedPath);

        // ファイルが存在しない場合の処理
        if (!fs.existsSync(filePath)) {
            res.status(404).json({
                success: false,
                message: 'ファイルが見つかりません'
            });
            return;
        }

        res.sendFile(filePath);

    } catch (error) {
        next(error);
    }
};