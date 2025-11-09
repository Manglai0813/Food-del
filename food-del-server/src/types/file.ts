// ファイルアップロード結果型
export interface FileUploadResult {
    fileName: string;
    originalName: string;
    filePath: string;
    fileUrl: string;
    fileSize: number;
    mimeType: string;
}

// ファイルバリデーションオプション型
export interface FileValidationOptions {
    maxSize?: number;
    allowedTypes?: string[];
    allowedExtensions?: string[];
}

// 画像ファイル処理結果型
export interface ImageProcessResult extends FileUploadResult {
    width?: number;
    height?: number;
    isProcessed: boolean;
}

// ファイル削除結果型
export interface FileDeleteResult {
    success: boolean;
    filePath: string;
    error?: string;
}