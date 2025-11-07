import fs from 'fs/promises';
import path from 'path';
import { FileValidator } from '@/utils/fileValidator';

/**
 * ファイル管理サービス
 */
export class FileService {
        // ストレージのベースディレクトリ
        private static readonly STORAGE_BASE = path.join(process.cwd(), 'storage');

        // ファイルのアップロード
        static async uploadFile(file: Express.Multer.File, category: 'public' | 'private' = 'public'): Promise<string> {
                // ファイル名のサニタイズと保存パスの生成
                const fileName = FileValidator.sanitizeFileName(file.originalname);

                // 保存先ディレクトリの作成
                const categoryDir = path.join(this.STORAGE_BASE, category);
                await fs.mkdir(categoryDir, { recursive: true });

                const filePath = path.join(categoryDir, fileName);

                // ディレクトリが存在しない場合は作成
                await fs.writeFile(filePath, file.buffer);
                return `/${category}/${fileName}`;
        }

        // ファイルの削除
        static async deleteFile(filePath: string): Promise<void> {
                if (!FileValidator.validatePath(filePath)) {
                        throw new Error('不正なパスです');
                }

                // フルパスの生成
                const fullPath = path.join(this.STORAGE_BASE, filePath);

                try {
                        await fs.unlink(fullPath);
                } catch (error) {
                        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
                                throw error;
                        }
                }
        }

        // ファイルの存在確認
        static async fileExists(filePath: string): Promise<boolean> {
                if (!FileValidator.validatePath(filePath)) {
                        return false;
                }

                // フルパスの生成
                const fullPath = path.join(this.STORAGE_BASE, filePath);

                try {
                        await fs.access(fullPath);
                        return true;
                } catch {
                        return false;
                }
        }

        // 商品画像保存
        static async saveProductImage(file: Express.Multer.File): Promise<{ fileUrl: string }> {
                const fileName = file.filename;
                return { fileUrl: `/files/public/${fileName}` };
        }

        // 一時ファイルのクリーンアップ（24時間以上経過したファイルを削除）
        static async cleanupTempFiles(): Promise<void> {
                const tempDir = path.join(this.STORAGE_BASE, 'temp');
                const files = await fs.readdir(tempDir);
                const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

                for (const file of files) {
                        const filePath = path.join(tempDir, file);
                        const stats = await fs.stat(filePath);

                        if (stats.mtime.getTime() < oneDayAgo) {
                                await fs.unlink(filePath);
                        }
                }
        }
};