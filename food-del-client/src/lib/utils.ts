import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// クラス名結合ユーティリティ
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
};