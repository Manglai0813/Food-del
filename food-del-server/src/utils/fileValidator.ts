import path from 'path';
import { createHash } from 'crypto';

// ファイル検証ユーティリティクラス
export class FileValidator {
    private static readonly ALLOWED_IMAGE_TYPES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    // PDF, Word文書などの許可されたドキュメントタイプ
    private static readonly ALLOWED_DOCUMENT_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // サイズ制限
    private static readonly MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static readonly MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

    // 画像ファイルの検証
    static validateImage(file: Express.Multer.File): { isValid: boolean; error?: string } {
        if (!this.ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            return { isValid: false, error: '許可されていない画像形式です' };
        }

        if (file.size > this.MAX_IMAGE_SIZE) {
            return { isValid: false, error: '画像サイズが大きすぎます（最大5MB）' };
        }

        return { isValid: true };
    }

    // ドキュメントファイルの検証
    static validateDocument(file: Express.Multer.File): { isValid: boolean; error?: string } {
        if (!this.ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
            return { isValid: false, error: '許可されていないドキュメント形式です' };
        }

        if (file.size > this.MAX_DOCUMENT_SIZE) {
            return { isValid: false, error: 'ドキュメントサイズが大きすぎます（最大10MB）' };
        }

        return { isValid: true };
    }

    // ファイル名のサニタイズ
    static sanitizeFileName(filename: string): string {
        const ext = path.extname(filename);
        const timestamp = Date.now();
        const hash = createHash('md5').update(filename + timestamp).digest('hex').substring(0, 8);
        return `${hash}${ext}`;
    }

    // ファイルパスの検証
    static validatePath(filePath: string): boolean {
        const normalizedPath = path.normalize(filePath);
        return !normalizedPath.includes('..');
    }
}