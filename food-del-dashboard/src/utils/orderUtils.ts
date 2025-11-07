import type { OrderStatus } from '@/types/order';

/**
 * 通貨フォーマット関数
 * @param amount - 金額
 * @returns フォーマットされた通貨文字列 (例: "￥1,234")
 */
export const formatCurrency = (amount: number) => {
	return new Intl.NumberFormat('ja-JP', {
		style: 'currency',
		currency: 'JPY',
		minimumFractionDigits: 0,
	}).format(amount);
};

/**
 * 日時フォーマット関数
 * @param dateStr - 日時文字列 (ISO形式)
 * @returns フォーマットされた日時文字列 (例: "2023/10/27 15:30")
 */
export const formatDateTime = (dateStr: string) => {
	return new Date(dateStr).toLocaleString('ja-JP', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
	});
};

/**
 * 注文ステータスの日本語ラベル
 */
export const statusLabels: Record<OrderStatus, string> = {
	pending: '待機中',
	confirmed: '確認済',
	preparing: '準備中',
	delivery: '配送中',
	completed: '完了',
	cancelled: 'キャンセル',
};

/**
 * 注文ステータスに対応するTailwind CSSクラス
 */
export const statusColors: Record<OrderStatus, string> = {
	pending: 'bg-yellow-100 text-yellow-800',
	confirmed: 'bg-blue-100 text-blue-800',
	preparing: 'bg-purple-100 text-purple-800',
	delivery: 'bg-indigo-100 text-indigo-800',
	completed: 'bg-green-100 text-green-800',
	cancelled: 'bg-red-100 text-red-800',
};
