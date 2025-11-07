/**
 * フォーマット関連ユーティリティ
 */

import { format, formatDistance } from 'date-fns';
import { ja } from 'date-fns/locale';

/**
 * 価格フォーマット
 */
export const formatPrice = (price: number): string => {
        return `¥${price.toLocaleString('ja-JP')}`;
};

/**
 * 日付フォーマット
 */
export const formatDate = (date: string | Date, formatStr: string = 'yyyy/MM/dd'): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return format(dateObj, formatStr, { locale: ja });
};

/**
 * 相対時間フォーマット（例: 3時間前）
 */
export const formatRelativeTime = (date: string | Date): string => {
        const dateObj = typeof date === 'string' ? new Date(date) : date;
        return formatDistance(dateObj, new Date(), { addSuffix: true, locale: ja });
};

/**
 * 電話番号フォーマット
 */
export const formatPhone = (phone: string): string => {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{4})(\d{4})$/);
        if (match) {
                return `${match[1]}-${match[2]}-${match[3]}`;
        }
        return phone;
};
