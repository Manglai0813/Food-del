// 在庫関連のエラー定義とユーティリティ
export class StockError extends Error {
    constructor(
        public readonly foodName: string,
        public readonly requested: number,
        public readonly available: number,
        public readonly type: 'insufficient' | 'reserved' | 'unavailable' | 'conflict'
    ) {
        super();
        this.name = 'StockError';
        this.message = this.formatMessage();
    }

    // エラーメッセージのフォーマット
    private formatMessage(): string {
        switch (this.type) {
            case 'insufficient':
                return `${this.foodName}の在庫が不足しています。利用可能: ${this.available}個、リクエスト: ${this.requested}個`;
            case 'reserved':
                return `${this.foodName}は他のユーザーにより予約済みです`;
            case 'unavailable':
                return `${this.foodName}は現在利用できません`;
            case 'conflict':
                return `${this.foodName}の在庫に同時アクセスが発生しました。しばらく後に再試行してください`;
            default:
                return `${this.foodName}の在庫エラーが発生しました`;
        }
    }

    // JSON レスポンス用のデータ
    toJSON() {
        return {
            error: this.name,
            type: this.type,
            foodName: this.foodName,
            requested: this.requested,
            available: this.available,
            message: this.message
        };
    }
}

// 在庫管理全般のエラー
export class InventoryError extends Error {
    constructor(
        message: string,
        public readonly code: string = 'INVENTORY_ERROR'
    ) {
        super(message);
        this.name = 'InventoryError';
    }

    toJSON() {
        return {
            error: this.name,
            code: this.code,
            message: this.message
        };
    }
}

// StockError に関するユーティリティクラス
export class StockErrorHelper {
    // 在庫不足エラーを生成
    static createInsufficientStockError(foodName: string, requested: number, available: number): StockError {
        return new StockError(foodName, requested, available, 'insufficient');
    }

    // 予約失敗エラーを生成
    static createReservationError(foodName: string): StockError {
        return new StockError(foodName, 0, 0, 'reserved');
    }

    // 利用不可エラーを生成
    static createUnavailableError(foodName: string): StockError {
        return new StockError(foodName, 0, 0, 'unavailable');
    }

    // 同時アクセスエラーを生成
    static createConcurrencyError(foodName: string): StockError {
        return new StockError(foodName, 0, 0, 'conflict');
    }

    static getErrorSeverity(error: StockError): 'low' | 'medium' | 'high' | 'critical' {
        switch (error.type) {
            case 'insufficient':
                return error.available === 0 ? 'critical' : 'high';
            case 'unavailable':
                return 'critical';
            case 'reserved':
                return 'medium';
            case 'conflict':
                return 'low';
            default:
                return 'medium';
        }
    }

    static getHttpStatusCode(error: StockError): number {
        switch (error.type) {
            case 'insufficient':
            case 'reserved':
            case 'unavailable':
                return 409; // Conflict
            case 'conflict':
                return 429; // Too Many Requests
            default:
                return 500;
        }
    }

    static getUserFriendlyMessage(error: StockError): string {
        switch (error.type) {
            case 'insufficient':
                if (error.available === 0) {
                    return `申し訳ございません。「${error.foodName}」は現在在庫切れです。`;
                }
                return `申し訳ございません。「${error.foodName}」の在庫が不足しています。現在${error.available}個のみご利用いただけます。`;
            case 'reserved':
                return `申し訳ございません。「${error.foodName}」は他のお客様により予約済みです。`;
            case 'unavailable':
                return `申し訳ございません。「${error.foodName}」は現在ご利用いただけません。`;
            case 'conflict':
                return `アクセスが集中しています。しばらく時間をおいて再度お試しください。`;
            default:
                return `「${error.foodName}」の処理中にエラーが発生しました。`;
        }
    }
}

// StockError に関する詳細情報のインターフェース
export interface StockErrorInfo {
    error: StockError;
    severity: 'low' | 'medium' | 'high' | 'critical';
    httpStatus: number;
    userMessage: string;
    systemMessage: string;
    suggestions?: string[];
}

// StockErrorInfo を構築するビルダークラス
export class StockErrorInfoBuilder {
    static build(error: StockError): StockErrorInfo {
        const severity = StockErrorHelper.getErrorSeverity(error);
        const httpStatus = StockErrorHelper.getHttpStatusCode(error);
        const userMessage = StockErrorHelper.getUserFriendlyMessage(error);
        const suggestions = this.generateSuggestions(error);

        return {
            error,
            severity,
            httpStatus,
            userMessage,
            systemMessage: error.message,
            suggestions
        };
    }

    // ユーザーへの提案を生成
    private static generateSuggestions(error: StockError): string[] {
        const suggestions: string[] = [];

        switch (error.type) {
            case 'insufficient':
                if (error.available > 0) {
                    suggestions.push(`数量を${error.available}個以下に変更してください`);
                }
                suggestions.push('類似商品をお探しください');
                suggestions.push('再入荷のお知らせにご登録ください');
                break;
            case 'unavailable':
                suggestions.push('類似商品をお探しください');
                suggestions.push('しばらく時間をおいて再度お試しください');
                break;
            case 'reserved':
                suggestions.push('しばらく時間をおいて再度お試しください');
                suggestions.push('類似商品をお探しください');
                break;
            case 'conflict':
                suggestions.push('ページを再読み込みしてください');
                suggestions.push('数分後に再度お試しください');
                break;
        }

        return suggestions;
    }
}