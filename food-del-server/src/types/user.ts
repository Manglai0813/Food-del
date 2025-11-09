import type { User as PrismaUser } from '@prisma/client';
import type { BaseQuery } from './utils/pagination';

// Prismaユーザー型の拡張
export type User = PrismaUser;

// ユーザー応答型
export type UserResponse = Omit<User, 'password'>;

// ユーザー作成リクエスト型
export interface CreateUserRequest {
    name: string;
    email: string;
    password: string;
    role?: 'customer' | 'admin' | 'staff';
    phone?: string;
}

// ユーザー更新リクエスト型
export interface UpdateUserRequest {
    name?: string;
    email?: string;
    phone?: string;
}

// ユーザー検索クエリ型
export interface UserQuery extends BaseQuery {
    role?: string;
    status?: string;
}