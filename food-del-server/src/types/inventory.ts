import type { InventoryHistory as PrismaInventoryHistory, Food, User, Order } from '@prisma/client';

// 基礎型
export type InventoryHistory = PrismaInventoryHistory;

// 在庫変更種別
export enum InventoryChangeType {
    ADD = 'add',           // 在庫追加
    SUBTRACT = 'subtract', // 在庫減算
    RESERVE = 'reserve',   // 在庫予約
    RELEASE = 'release'    // 予約解除
}

// 在庫情報型
export interface StockInfo {
    stock: number;         // 総在庫
    reserved: number;      // 予約済み在庫
    available: number;     // 利用可能在庫
    minStock: number;      // 最小在庫閾値
    isLowStock: boolean;   // 低在庫フラグ
}

// 在庫更新リクエスト型
export interface UpdateStockRequest {
    quantity: number;      // 数量
    operation: 'add' | 'subtract'; // 操作種別
    note?: string;         // 備考
}

// 在庫予約リクエスト型
export interface ReserveStockRequest {
    quantity: number;      // 予約数量
    note?: string;         // 備考
}

// 在庫履歴データ型
export interface InventoryHistoryData extends InventoryHistory {
    created_by_user: Pick<User, 'id' | 'name' | 'role'>;
    order?: Pick<Order, 'id' | 'status'> | null;
}

// 在庫状況データ型
export interface StockStatusData {
    id: number;
    name: string;
    stock: number;
    reserved: number;
    available: number;
    minStock: number;
    isLowStock: boolean;
    status: boolean;
}

// 在庫操作結果型
export interface StockOperationResult {
    success: boolean;
    newStock?: number;
    availableStock?: number;
    version?: number;
    message?: string;
}

// 在庫警告データ型
export interface StockAlert {
    foodId: number;
    foodName: string;
    currentStock: number;
    minStock: number;
    severity: 'low' | 'critical' | 'out_of_stock';
    message: string;
}

// 在庫レポートデータ型
export interface StockReport {
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    totalValue: number;
    alerts: StockAlert[];
    summary: {
        date: string;
        lastUpdated: Date;
    };
}

// 在庫履歴クエリ型
export interface InventoryHistoryQuery {
    foodId?: number;
    changeType?: InventoryChangeType;
    orderId?: number;
    userId?: number;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
}

// 在庫一括更新リクエスト型
export interface BulkStockUpdateRequest {
    updates: Array<{
        foodId: number;
        quantity: number;
        operation: 'add' | 'subtract';
        note?: string;
    }>;
    reason?: string;
}

// 在庫調整リクエスト型
export interface StockAdjustmentRequest {
    foodId: number;
    newStock: number;
    reason: string;
}

// 在庫検証結果型
export interface StockValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    stockInfo?: StockInfo;
}

// 在庫操作ログ型
export interface StockOperationLog {
    operation: string;
    foodId: number;
    quantity: number;
    beforeStock: number;
    afterStock: number;
    userId: number;
    timestamp: Date;
    success: boolean;
    error?: string;
}