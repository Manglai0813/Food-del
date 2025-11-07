import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Propsの型定義
interface TopProductsListProps {
        products?: Array<{
                id: number;
                name: string;
                sales_count: number;
                revenue: number;
                image_url?: string;
                category_name?: string;
        }>;
}

/**
 * 人気商品ランキングコンポーネント
 * 注文数ベースで人気商品をランキング表示
 */
const TopProductsList: React.FC<TopProductsListProps> = ({ products }) => {
        if (!products || products.length === 0) {
                return (
                        <Card>
                                <CardHeader>
                                        <CardTitle>人気商品ランキング</CardTitle>
                                </CardHeader>
                                <CardContent>
                                        <div className="space-y-4">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                                                <div className="flex items-center gap-3">
                                                                        <div className="animate-pulse bg-muted rounded-full w-8 h-8"></div>
                                                                        <div className="space-y-1">
                                                                                <div className="animate-pulse bg-muted rounded w-24 h-4"></div>
                                                                                <div className="animate-pulse bg-muted rounded w-16 h-3"></div>
                                                                        </div>
                                                                </div>
                                                                <div className="animate-pulse bg-muted rounded w-12 h-4"></div>
                                                        </div>
                                                ))}
                                        </div>
                                </CardContent>
                        </Card>
                );
        }

        const formatCurrency = (amount: number) => {
                return `¥${amount.toLocaleString('ja-JP')}`;
        };

        const getRankColor = (rank: number) => {
                switch (rank) {
                        case 1: return 'text-yellow-600 bg-yellow-100';
                        case 2: return 'text-gray-600 bg-gray-100';
                        case 3: return 'text-amber-600 bg-amber-100';
                        default: return 'text-blue-600 bg-blue-100';
                }
        };

        return (
                <Card>
                        <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                        人気商品ランキング
                                        <span className="text-sm font-normal text-muted-foreground">
                                                注文数ベース
                                        </span>
                                </CardTitle>
                        </CardHeader>
                        <CardContent>
                                <div className="space-y-3">
                                        {products.slice(0, 5).map((product, index) => {
                                                const rank = index + 1;

                                                return (
                                                        <div
                                                                key={product.id}
                                                                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                                        >
                                                                <div className="flex items-center gap-3">
                                                                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getRankColor(rank)}`}>
                                                                                {rank}
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                                <p className="font-medium text-sm leading-tight">{product.name}</p>
                                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                                                        <span>{product.sales_count} 注文</span>
                                                                                        <span>•</span>
                                                                                        <span>{formatCurrency(product.revenue)}</span>
                                                                                        {product.category_name && (
                                                                                                <>
                                                                                                        <span>•</span>
                                                                                                        <span>{product.category_name}</span>
                                                                                                </>
                                                                                        )}
                                                                                </div>
                                                                        </div>
                                                                </div>

                                                                <div className="text-right">
                                                                        <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                                                                        <p className="text-xs text-muted-foreground">{product.sales_count}回注文</p>
                                                                </div>
                                                        </div>
                                                );
                                        })}
                                </div>

                                {products.length > 5 && (
                                        <div className="mt-4 pt-4 border-t text-center">
                                                <p className="text-sm text-muted-foreground">
                                                        他 {products.length - 5} 商品
                                                </p>
                                        </div>
                                )}
                        </CardContent>
                </Card>
        );
};

export default TopProductsList;