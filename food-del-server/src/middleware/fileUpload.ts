import multer, { diskStorage } from 'multer';
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { FileValidator } from '@/utils/fileValidator';

const storage = diskStorage({
        destination: (_req, file, cb) => {
                let uploadPath = 'storage/public';

                if (file.fieldname === 'image') {
                        uploadPath = 'storage/public/foods';  // 商品画像用ディレクトリ
                } else if (file.fieldname === 'avatar') {
                        uploadPath = 'storage/private';
                } else if (file.fieldname === 'document') {
                        uploadPath = 'storage/private';
                }

                cb(null, uploadPath);
        },
        filename: (_req, file, cb) => {
                const safeName = FileValidator.sanitizeFileName(file.originalname);
                cb(null, safeName);
        }
});

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
        if (file.fieldname === 'image' || file.fieldname === 'avatar') {
                const validation = FileValidator.validateImage(file);
                if (!validation.isValid) {
                        return cb(new Error(validation.error));
                }
        } else if (file.fieldname === 'document') {
                const validation = FileValidator.validateDocument(file);
                if (!validation.isValid) {
                        return cb(new Error(validation.error));
                }
        }

        cb(null, true);
};

export const fileUploadMiddleware = multer({
        storage,
        fileFilter,
        limits: {
                fileSize: 10 * 1024 * 1024,
                files: 5
        }
});

export const handleFileUploadError: ErrorRequestHandler = (error: any, _req: Request, res: Response, next: NextFunction) => {
        if (error instanceof multer.MulterError) {
                if (error.code === 'LIMIT_FILE_SIZE') {
                        res.status(400).json({
                                success: false,
                                message: 'ファイルサイズが大きすぎます'
                        });
                        return;
                }
                if (error.code === 'LIMIT_FILE_COUNT') {
                        res.status(400).json({
                                success: false,
                                message: 'ファイル数が多すぎます'
                        });
                        return;
                }
        }

        if (error.message) {
                res.status(400).json({
                        success: false,
                        message: error.message
                });
                return;
        }

        next(error);
};