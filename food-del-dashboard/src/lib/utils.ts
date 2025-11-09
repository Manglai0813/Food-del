import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ユーティリティ関数集
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
};