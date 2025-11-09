import { prisma } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { cache, withCache } from '@/utils/simpleCache';
import type {
    FoodData,
    FoodSearchResult,
    CreateFoodRequest,
    UpdateFoodRequest,
    PaginatedData,
    FoodSearchQuery
} from '@/types';

// 食品サービスクラス
export class FoodService {

    // 商品リスト取得
    static async getFoods(query: FoodSearchQuery): Promise<PaginatedData<FoodData>> {
        const {
            page = 1,
            limit = 10,
            search,
            category_id,
            status = true,
            price_min,
            price_max,
            sortBy = 'id',
            sortOrder = 'desc'
        } = query;

        // キャッシュキー生成
        const cacheKey = cache.generateKey('foods_list', {
            page, limit, search, category_id, status, price_min, price_max, sortBy, sortOrder
        });

        // キャッシュから取得試行
        const cached = cache.get<PaginatedData<FoodData>>(cacheKey);
        if (cached) {
            return cached;
        }

        // 検索条件の構築
        const where: Prisma.FoodWhereInput = {
            status: typeof status === 'boolean' ? status : status === 'true'
        };

        // 検索条件
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // カテゴリフィルタ
        if (category_id) {
            where.category_id = category_id;
        }

        // 価格フィルタ
        if (price_min || price_max) {
            where.price = {};
            if (price_min) where.price.gte = price_min;
            if (price_max) where.price.lte = price_max;
        }

        const skip = (page - 1) * limit;
        const orderBy: Prisma.FoodOrderByWithRelationInput = {
            [sortBy]: sortOrder
        } as Prisma.FoodOrderByWithRelationInput;

        // 總数キャッシュの確認
        const countCacheKey = cache.generateKey('foods_count', {
            search, category_id, status, price_min, price_max
        });
        let total = cache.get<number>(countCacheKey);

        // 並列でデータと総数を取得
        const [foods, countResult] = await Promise.all([
            prisma.food.findMany({
                where,
                skip,
                take: limit,
                orderBy,
                include: {
                    category: true
                }
            }),
            total === null ? prisma.food.count({ where }) : Promise.resolve(total)
        ]);

        // 總数をキャッシュ
        if (total === null) {
            total = countResult as number;
            cache.set(countCacheKey, total, 10 * 60 * 1000);
        }

        // 総ページ数計算
        const totalPages = Math.ceil(total / limit);

        // 結果の構築
        const result = {
            data: foods as FoodData[],
            total,
            page,
            limit,
            totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1
        };

        // 結果をキャッシュ
        cache.set(cacheKey, result, 5 * 60 * 1000);

        return result;
    }

    // 商品詳細取得
    static async getFoodById(id: number): Promise<FoodData | null> {
        const food = await prisma.food.findUnique({
            where: { id },
            include: {
                category: true
            }
        });

        return food as FoodData | null;
    }

    // 商品検索
    static async searchFoods(query: FoodSearchQuery & { search: string }): Promise<FoodSearchResult> {
        const result = await this.getFoods(query);

        return {
            foods: result.data,
            total: result.total,
            searchTerm: query.search,
            appliedFilters: {
                category_id: query.category_id,
                price_min: query.price_min,
                price_max: query.price_max,
                status: query.status
            }
        };
    }

    // 推奨商品取得
    static async getFeaturedFoods(limit: number = 5): Promise<FoodData[]> {
        const foods = await prisma.food.findMany({
            where: {
                status: true
            },
            take: limit,
            orderBy: {
                created_at: 'desc'
            },
            include: {
                category: true
            }
        });

        return foods as FoodData[];
    }

    // カテゴリ別商品取得
    static async getFoodsByCategory(categoryId: number, query?: FoodSearchQuery): Promise<PaginatedData<FoodData>> {
        const searchQuery = {
            ...query,
            category_id: categoryId
        };

        return this.getFoods(searchQuery);
    }

    // 商品作成
    static async createFood(data: CreateFoodRequest, imagePath: string): Promise<FoodData> {
        const food = await prisma.food.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                category_id: data.category_id,
                image_path: imagePath,
                status: data.status ?? true
            },
            include: {
                category: true
            }
        });

        // キャッシュ無効化
        this.invalidateFoodCache();

        return food as FoodData;
    }

    // 商品更新
    static async updateFood(id: number, data: UpdateFoodRequest, imagePath?: string): Promise<FoodData | null> {
        const updateData: Prisma.FoodUpdateInput = {};

        // 更新フィールド設定
        if (data.name !== undefined) updateData.name = data.name; // 名前
        if (data.description !== undefined) updateData.description = data.description; // 説明
        if (data.price !== undefined) updateData.price = data.price; // 価格
        if (data.category_id !== undefined) updateData.category = { connect: { id: data.category_id } };  // カテゴリID
        if (data.status !== undefined) updateData.status = data.status; // ステータス
        if (imagePath) updateData.image_path = imagePath; // 画像パス

        // 商品更新
        const food = await prisma.food.update({
            where: { id },
            data: updateData,
            include: {
                category: true
            }
        });

        // キャッシュ無効化
        this.invalidateFoodCache();

        return food as FoodData;
    }

    // 商品ステータス更新
    static async updateFoodStatus(id: number, status: boolean): Promise<FoodData | null> {
        const food = await prisma.food.update({
            where: { id },
            data: { status },
            include: {
                category: true
            }
        });

        // キャッシュ無効化
        this.invalidateFoodCache();

        return food as FoodData;
    }

    // 商品削除
    static async deleteFood(id: number): Promise<boolean> {
        try {
            await prisma.food.update({
                where: { id },
                data: { status: false }
            });

            // キャッシュ無効化
            this.invalidateFoodCache();

            return true;
        } catch {
            return false;
        }
    }

    // 商品利用可能性検証
    static async validateFoodAvailable(id: number): Promise<boolean> {
        const food = await prisma.food.findUnique({
            where: { id },
            select: { status: true }
        });

        return food?.status === true;
    }

    // キャッシュ無効化
    private static invalidateFoodCache(): void {
        // 商品リストキャッシュを削除
        cache.deletePattern('foods_list');
        // 商品数キャッシュを削除
        cache.deletePattern('foods_count');
    }
};