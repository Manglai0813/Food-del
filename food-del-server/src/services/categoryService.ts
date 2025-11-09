import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
    CategoryData,
    CategorySearchResult,
    CreateCategoryRequest,
    UpdateCategoryRequest,
    CategorySearchQuery,
    FoodData,
    PaginatedData,
    FoodSearchQuery
} from '@/types';

export class CategoryService {

    // カテゴリリスト取得
    static async getCategories(query?: CategorySearchQuery): Promise<CategoryData[]> {
        const { include_count = false, status } = query || {};

        // 検索条件の構築
        const where: Prisma.CategoryWhereInput = {};

        // ステータスフィルタリング
        if (status !== undefined) {
            where.status = typeof status === 'boolean' ? status : status === 'true';
        }

        // カウント付きで取得
        if (typeof include_count === 'boolean' ? include_count : include_count === 'true') {
            const categories = await prisma.category.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            foods: {
                                where: { status: true }
                            }
                        }
                    }
                },
                orderBy: { created_at: 'desc' }
            });

            return categories.map(category => ({
                ...category,
                _count: { foods: category._count.foods }
            })) as CategoryData[];
        } else {
            const categories = await prisma.category.findMany({
                where,
                orderBy: { created_at: 'desc' }
            });

            return categories as CategoryData[];
        }
    }

    // カテゴリ詳細取得
    static async getCategoryById(id: number): Promise<CategoryData | null> {
        const category = await prisma.category.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        foods: {
                            where: { status: true }
                        }
                    }
                }
            }
        });

        if (!category) return null;

        return {
            ...category,
            _count: { foods: category._count.foods }
        } as CategoryData;
    }

    // カテゴリ下の商品取得
    static async getCategoryFoods(categoryId: number, query?: FoodSearchQuery): Promise<PaginatedData<FoodData>> {
        const { FoodService } = await import('./foodService');

        // カテゴリ存在チェック
        const searchQuery = {
            ...query,
            category_id: categoryId
        };

        return FoodService.getFoods(searchQuery);
    }

    // 有効カテゴリリスト取得
    static async getActiveCategories(): Promise<CategoryData[]> {
        const categories = await prisma.category.findMany({
            where: { status: true },
            orderBy: { created_at: 'desc' }
        });

        return categories as CategoryData[];
    }

    // カテゴリ作成
    static async createCategory(data: CreateCategoryRequest): Promise<CategoryData> {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                description: data.description,
                status: data.status ?? true
            }
        });

        return category as CategoryData;
    }

    // カテゴリ更新
    static async updateCategory(id: number, data: UpdateCategoryRequest): Promise<CategoryData | null> {
        const updateData: Prisma.CategoryUpdateInput = {};

        // 更新フィールド設定
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.status !== undefined) updateData.status = data.status;

        try {
            const category = await prisma.category.update({
                where: { id },
                data: updateData
            });

            return category as CategoryData;
        } catch {
            return null;
        }
    }

    // カテゴリステータス更新
    static async updateCategoryStatus(id: number, status: boolean): Promise<CategoryData | null> {
        try {
            const category = await prisma.category.update({
                where: { id },
                data: { status }
            });

            return category as CategoryData;
        } catch {
            return null;
        }
    }

    // カテゴリ削除
    static async deleteCategory(id: number): Promise<boolean> {
        try {
            const hasFood = await this.hasFoods(id);
            if (hasFood) {
                return false;
            }

            await prisma.category.update({
                where: { id },
                data: { status: false }
            });
            return true;
        } catch {
            return false;
        }
    }

    // カテゴリ利用可能性検証
    static async validateCategoryAvailable(id: number): Promise<boolean> {
        const category = await prisma.category.findUnique({
            where: { id },
            select: { status: true }
        });

        return category?.status === true;
    }

    // 商品関連チェック
    static async hasFoods(categoryId: number): Promise<boolean> {
        const count = await prisma.food.count({
            where: {
                category_id: categoryId,
                status: true
            }
        });

        return count > 0;
    }
};