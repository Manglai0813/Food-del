import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useOrder, useUpdateOrderStatus } from '@/api';
import type { OrderStatus } from '@/types/order';
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
	CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Package, MapPin, Phone, Calendar, User } from 'lucide-react';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';

/**
 * 注文詳細ページコンポーネント（管理者専用）
 * 個別注文の詳細情報表示とステータス更新機能を提供
 */
const OrderDetailPage = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();

	// 注文詳細情報を取得
	const { data: order, isLoading, error } = useOrder(id!);

	// 注文ステータス更新の変更関数
	const updateStatusMutation = useUpdateOrderStatus();

	// 通貨をフォーマット
	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat('ja-JP', {
			style: 'currency',
			currency: 'JPY',
			minimumFractionDigits: 0,
		}).format(amount);
	};

	// 日時をフォーマット
	const formatDateTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	// ステータスのラベルを定義
	const statusLabels: Record<OrderStatus, string> = {
		pending: '待機中',
		confirmed: '確認済',
		preparing: '準備中',
		delivery: '配送中',
		completed: '完了',
		cancelled: 'キャンセル',
	};

	// ステータスに対応する背景色と文字色を取得
	const getStatusColor = (status: OrderStatus) => {
		const colors: Record<OrderStatus, string> = {
			pending: 'bg-yellow-100 text-yellow-800',
			confirmed: 'bg-blue-100 text-blue-800',
			preparing: 'bg-purple-100 text-purple-800',
			delivery: 'bg-indigo-100 text-indigo-800',
			completed: 'bg-green-100 text-green-800',
			cancelled: 'bg-red-100 text-red-800',
		};
		return colors[status];
	};

	// 注文ステータスを変更しtoast通知を表示
	const handleStatusChange = async (newStatus: OrderStatus) => {
		if (!order) return;

		try {
			await updateStatusMutation.mutateAsync({
				orderId: order.id,
				status: newStatus,
			});
			toast.success('注文ステータスが更新されました');
		} catch (error) {
			let errorMessage = '注文ステータスの更新に失敗しました';
			if (error instanceof Error) {
				errorMessage = error.message;
				// エラーメッセージの状態名を日本語に置換
				Object.entries(statusLabels).forEach(([key, label]) => {
					errorMessage = errorMessage.replace(key, label);
				});
			}
			toast.error(errorMessage);
		}
	};

	if (isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
					<p className="mt-4 text-muted-foreground">読み込み中...</p>
				</div>
			</div>
		);
	}

	if (error || !order) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Card className="w-full max-w-md">
					<CardContent className="pt-6">
						<div className="text-center">
							<p className="text-destructive font-medium">エラーが発生しました</p>
							<p className="text-sm text-muted-foreground mt-2">
								{error instanceof Error ? error.message : '注文が見つかりません'}
							</p>
							<Button
								onClick={() => navigate('/orders')}
								variant="outline"
								className="mt-4"
							>
								注文一覧に戻る
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="space-y-6 p-6">
			{/* ページヘッダー */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="icon" onClick={() => navigate('/orders')}>
						<ArrowLeft className="h-5 w-5" />
					</Button>
					<div>
						<h1 className="text-3xl font-bold">注文詳細 #{order.id}</h1>
						<p className="text-muted-foreground">
							注文日時: {formatDateTime(order.order_date)}
						</p>
					</div>
				</div>
				<Badge className={`${getStatusColor(order.status)} text-base px-4 py-2`}>
					{statusLabels[order.status]}
				</Badge>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* 左側: 注文情報 */}
				<div className="lg:col-span-2 space-y-6">
					{/* 注文商品リスト */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Package className="h-5 w-5" />
								注文商品
							</CardTitle>
						</CardHeader>
						<CardContent>
							{order.order_items && order.order_items.length > 0 ? (
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>商品ID</TableHead>
											<TableHead>数量</TableHead>
											<TableHead className="text-right">単価</TableHead>
											<TableHead className="text-right">小計</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{order.order_items.map((item) => (
											<TableRow key={item.id}>
												<TableCell className="font-medium">#{item.food_id}</TableCell>
												<TableCell>{item.quantity}個</TableCell>
												<TableCell className="text-right">
													{formatCurrency(item.price)}
												</TableCell>
												<TableCell className="text-right font-medium">
													{formatCurrency(item.price * item.quantity)}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							) : (
								<p className="text-muted-foreground text-center py-4">
									商品情報がありません
								</p>
							)}

							<div className="mt-6 pt-4 border-t">
								<div className="flex items-center justify-between text-lg font-bold">
									<span>合計金額</span>
									<span className="text-primary">{formatCurrency(order.total_amount)}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* 配送情報 */}
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<MapPin className="h-5 w-5" />
								配送情報
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<p className="text-sm text-muted-foreground mb-1">配送先住所</p>
								<p className="font-medium">{order.delivery_address}</p>
							</div>
							<div className="flex items-center gap-2">
								<Phone className="h-4 w-4 text-muted-foreground" />
								<p className="font-medium">{order.phone}</p>
							</div>
							{order.notes && (
								<div>
									<p className="text-sm text-muted-foreground mb-1">備考</p>
									<p className="text-sm">{order.notes}</p>
								</div>
							)}
						</CardContent>
					</Card>
				</div>

				{/* 右側: ステータス管理 */}
				<div className="space-y-6">
					{/* ステータス変更 */}
					<Card>
						<CardHeader>
							<CardTitle>ステータス管理</CardTitle>
							<CardDescription>注文のステータスを変更できます</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<label className="text-sm font-medium mb-2 block">現在のステータス</label>
								<Select
									value={order.status}
									onValueChange={(value) => handleStatusChange(value as OrderStatus)}
									disabled={updateStatusMutation.isPending}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="pending">待機中</SelectItem>
										<SelectItem value="confirmed">確認済</SelectItem>
										<SelectItem value="preparing">準備中</SelectItem>
										<SelectItem value="delivery">配送中</SelectItem>
										<SelectItem value="completed">完了</SelectItem>
										<SelectItem value="cancelled">キャンセル</SelectItem>
									</SelectContent>
								</Select>
							</div>

							{updateStatusMutation.isPending && (
								<p className="text-sm text-muted-foreground">更新中...</p>
							)}
						</CardContent>
					</Card>

					{/* 注文情報サマリー */}
					<Card>
						<CardHeader>
							<CardTitle>注文情報</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div className="flex items-center gap-2 text-sm">
								<User className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">ユーザーID:</span>
								<span className="font-medium">{order.user_id}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">注文日時:</span>
								<span className="font-medium">{formatDateTime(order.order_date)}</span>
							</div>
							<div className="flex items-center gap-2 text-sm">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="text-muted-foreground">更新日時:</span>
								<span className="font-medium">{formatDateTime(order.updated_at)}</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default OrderDetailPage;
