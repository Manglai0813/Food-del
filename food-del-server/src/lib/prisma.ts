import { PrismaClient } from '@prisma/client';

// グローバルPrismaインスタンス
declare global {
        var prisma: PrismaClient | undefined;
}

// シングルトンパターンでPrismaClientを作成
const prisma = globalThis.prisma || new PrismaClient();

// 開発環境では、ホットリロード時にコネクションが増えすぎないようにする
if (process.env.NODE_ENV !== 'production') {
        globalThis.prisma = prisma;
}

export { prisma };