/**
 * ホームページ
 */

import { useState } from 'react';
import { HeroBanner } from '@/components/layout';
import { ExploreMenu, FoodDisplay } from '@/components/food';
import { Pagination } from '@/components/common';
import { usePublicFoods, useActiveCategories } from '@/hooks';

export const HomePage: React.FC = () => {
        const [category, setCategory] = useState<string>('All');
        const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);
        const [page, setPage] = useState<number>(1);

        // カテゴリデータ取得
        const { data: categories } = useActiveCategories();

        // 商品データ取得（カテゴリIDでフィルタリング、分頁対応）
        const { data: response, isLoading: foodsLoading, error: foodsError } = usePublicFoods({
                category_id: selectedCategoryId,
                page
        });

        // カテゴリ選択時の処理
        const handleCategoryChange = (categoryName: string) => {
                setPage(1); // カテゴリ変更時はページを1にリセット

                if (categoryName === 'All') {
                        setCategory('All');
                        setSelectedCategoryId(undefined);
                } else {
                        setCategory(categoryName);
                        // カテゴリ名からIDを取得
                        const cat = categories?.find(c => c.name === categoryName);
                        setSelectedCategoryId(cat?.id);
                }
        };

        // ページ変更時の処理
        const handlePageChange = (newPage: number) => {
                setPage(newPage);
                window.scrollTo({ top: 0, behavior: 'smooth' }); // ページトップにスクロール
        };

        return (
                <div className="home">
                        <HeroBanner />

                        <ExploreMenu
                                category={category}
                                setCategory={handleCategoryChange}
                                categories={categories}
                        />
                        <div id="food-display">
                                <FoodDisplay
                                        foods={(response?.data as any)?.foods || response?.data || []}
                                        loading={foodsLoading}
                                        error={foodsError?.message || null}
                                        category={category}
                                />
                        </div>

                        {/* 分頁器 */}
                        <Pagination
                                currentPage={page}
                                totalPages={(response as any)?.pagination?.totalPages || Math.ceil(((response?.data as any)?.total || 0) / 12) || 1}
                                onPageChange={handlePageChange}
                        />
                </div>
        );
};
