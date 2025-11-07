import React, { useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DynamicForm } from '@/components/common';
import { productEntityConfig } from '../../configs/products';
import { useFood, useCreateFood, useUpdateFood, useCategories } from '@/api';

/**
 * 商品作成・編集ページ
 * DynamicFormコンポーネントで設定駆動フォームを実装。
 * 新規作成と編集の両方のモードに対応します。
 */
const FoodFormPage: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const isEdit = !!id;

	// 編集モード時に既存の商品データを取得
	const { data: product, isLoading, error: queryError } = useFood(id, {
		enabled: isEdit,
	});

	// カテゴリ一覧を取得
	const { data: categoriesResponse, isLoading: categoriesLoading } = useCategories();

	// 商品の作成と更新の変更関数
	const createMutation = useCreateFood();
	const updateMutation = useUpdateFood();
	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	// フォーム初期値をメモ化しフィールド名を変換
	const initialValues = useMemo(() => {
		if (!product) return {};

		const productCategory = product.category as Record<string, unknown> | undefined;
		return {
			name: product.name || '',
			description: product.description || '',
			price: product.price || 0,
			category: (product.category_id || (productCategory?.id as number | undefined) || '').toString(),
			image: undefined,
		};
	}, [product]);

	// カテゴリオプションを動的に生成
	const categoryOptions = useMemo(() => {
		const categories = Array.isArray(categoriesResponse?.data)
			? categoriesResponse.data
			: (categoriesResponse || []);
		return (categories as Array<{ id: number; name: string }>).map(cat => ({
			label: cat.name,
			value: cat.id.toString(),
		}));
	}, [categoriesResponse]);

	// フォームデータをサーバー形式に変換
	const transformFormData = useCallback((data: Record<string, unknown>) => {
		const transformed = { ...data };

		if (data.category) {
			transformed.category_id = typeof data.category === 'string'
				? parseInt(data.category, 10)
				: data.category;
			delete transformed.category;
		}

		if (data.price !== undefined && data.price !== null && data.price !== '') {
			transformed.price = typeof data.price === 'string'
				? parseFloat(data.price)
				: data.price;
		}

		if (data.image instanceof File) {
			transformed.image = data.image;
		} else if (!data.image) {
			delete transformed.image;
		}

		return transformed;
	}, []);

	// フォーム送信処理
	const handleSubmit = useCallback(async (data: Record<string, unknown>) => {
		const mutation = isEdit ? updateMutation : createMutation;
		const successMessage = isEdit ? '商品を更新しました' : '商品を登録しました';

		try {
			const transformedData = transformFormData(data);
			let savedProduct;

			if (isEdit && id) {
				const dataWithId = {
					...transformedData,
					id: parseInt(id)
				};
				savedProduct = await mutation.mutateAsync(dataWithId as unknown as Parameters<typeof mutation.mutateAsync>[0]);
			} else {
				savedProduct = await mutation.mutateAsync(transformedData as unknown as Parameters<typeof mutation.mutateAsync>[0]);
			}

			toast.success(successMessage);
			navigate(isEdit ? `/foods/${savedProduct.id}` : '/foods');
		} catch (err) {
			let errorMessage = '保存に失敗しました';
			if (err instanceof Error) {
				errorMessage = err.message;
			} else if (typeof err === 'object' && err !== null && 'response' in err) {
				const apiErr = err as { response?: { data?: { message?: string } } };
				errorMessage = apiErr.response?.data?.message || errorMessage;
			}
			toast.error(errorMessage);
		}
	}, [isEdit, id, navigate, createMutation, updateMutation, transformFormData]);

	// フォーム設定を動的に生成しカテゴリオプションを注入
	const dynamicFormConfig = useMemo(() => {
		const config = isEdit ? productEntityConfig.form.update : productEntityConfig.form.create;
		return config.map(field => {
			if (field.key === 'category') {
				return {
					...field,
					options: categoryOptions,
				};
			}
			return field;
		});
	}, [isEdit, categoryOptions]);

	// ローディング中はスケルトン表示
	if (isLoading || categoriesLoading) {
		return (
			<div className="p-6 space-y-6">
				{/* ヘッダースケルトン */}
				<div className="flex items-center space-x-4">
					<div className="h-10 w-24 bg-gray-200 rounded-md animate-pulse"></div>
					<div className="space-y-2">
						<div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
						<div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
					</div>
				</div>
				{/* フォームスケルトン */}
				<div className="h-64 bg-gray-200 rounded-md animate-pulse"></div>
			</div>
		);
	}

	// データ取得エラー時の表示
	if (queryError) {
		return (
			<div className="p-6 text-center">
				<p className="text-destructive mb-4">データの読み込みに失敗しました。</p>
				<Button onClick={() => navigate('/foods')}>商品一覧に戻る</Button>
			</div>
		);
	}

	// 編集モードで商品が見つからない場合
	if (isEdit && !product) {
		return (
			<div className="p-6 text-center">
				<p className="text-muted-foreground mb-4">指定された商品は見つかりませんでした。</p>
				<Button onClick={() => navigate('/foods')}>商品一覧に戻る</Button>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center space-x-4">
				<Button variant="ghost" onClick={() => navigate(isEdit ? `/foods/${id}` : '/foods')}>
					<ArrowLeft className="w-4 h-4 mr-2" />
					戻る
			</Button>
				<div>
					<h1 className="text-3xl font-bold">
						{isEdit ? '商品編集' : '新規商品登録'}
					</h1>
					<p className="text-muted-foreground">
						{isEdit ? '商品情報を編集します' : '新しい商品を登録します'}
					</p>
				</div>
			</div>

			{/* カテゴリが読み込まれていない場合の警告 */}
			{categoryOptions.length === 0 && (
				<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
					<p className="text-sm text-yellow-800">
						カテゴリを読み込み中です...
					</p>
				</div>
			)}

			{/* 編集時に既存の商品画像をプレビュー */}
			{isEdit && product?.image_path && (
				<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
					<p className="text-sm font-medium text-blue-900 mb-2">現在の商品画像</p>
					<div className="w-32 h-32 rounded-lg overflow-hidden border border-blue-300">
						<img
							src={`${import.meta.env.VITE_API_BASE_URL}/files${product.image_path}`}
							alt="現在の商品画像"
							className="w-full h-full object-cover"
							onError={e => {
								(e.target as HTMLImageElement).src = '/food.svg';
							}}
						/>
					</div>
					<p className="text-xs text-blue-700 mt-2">
						新しい画像をアップロードすると、この画像は置き換わります
					</p>
				</div>
			)}

			<DynamicForm
				fields={dynamicFormConfig}
				sections={productEntityConfig.form.sections}
				initialValues={initialValues}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
				submitText={isEdit ? '変更を保存' : '商品を登録'}
				layout={productEntityConfig.form.layout}
			/>
		</div>
	);
};

export default FoodFormPage;