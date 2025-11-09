import type { AuthRequest } from '../auth';

// ファイルアップロードリクエスト型
export interface FileRequest extends AuthRequest {
    file?: Express.Multer.File; // Multerでアップロードされたファイル
}

// パラメータ付きリクエスト型
export interface ParamsRequest<T extends Record<string, string> = Record<string, string>> extends AuthRequest {
    params: T;
}

// クエリ付きリクエスト型
export interface QueryRequest<T extends Record<string, any> = Record<string, any>> extends AuthRequest {
    query: T;
}

// ボディ付きリクエスト型
export interface BodyRequest<T = any> extends AuthRequest {
    body: T;
}

// 全項目付きリクエスト型
export interface FullRequest<
    TParams extends Record<string, string> = Record<string, string>,
    TQuery extends Record<string, any> = Record<string, any>,
    TBody = any
> extends AuthRequest {
    params: TParams;
    query: TQuery;
    body: TBody;
}

// 共通パラメータ型
export interface IdParams extends Record<string, string> {
    id: string;
}