import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * ユーティリティ関数集
 * TailwindCSS クラス名の統合とマージ機能
 */
export function cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs))
};