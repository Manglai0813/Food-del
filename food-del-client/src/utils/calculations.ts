import type { FoodWithCategory, FoodViewModel } from '@/types';
import type { CartData, CartViewModel } from '@/types';
import type { OrderData, OrderViewModel, OrderStatus } from '@/types';
import { formatPrice } from './format';

// 配送料の閾値
const FREE_DELIVERY_THRESHOLD = 3000;
const DELIVERY_FEE = 300;

// 税率
const TAX_RATE = 0.1;

// 食品の利用可能数量を計算
export function calculateAvailableQuantity(stock: number, reserved: number): number {
    return Math.max(0, stock - reserved);
}

// 食品が在庫ありかチェック
export function isInStock(stock: number, reserved: number): boolean {
    return calculateAvailableQuantity(stock, reserved) > 0;
}

// 食品ビューモデルを作成
export function createFoodViewModel(food: FoodWithCategory): FoodViewModel {
    const availableQuantity = calculateAvailableQuantity(food.stock, food.reserved);

    return {
        ...food,
        isInStock: availableQuantity > 0,
        availableQuantity,
        formattedPrice: formatPrice(food.price),
    };
}

// 配送料を計算
export function calculateDeliveryFee(subtotal: number): number {
    return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

// 税金を計算
export function calculateTax(subtotal: number): number {
    return Math.round(subtotal * TAX_RATE);
}

// カートビューモデルを作成
export function createCartViewModel(cart: CartData): CartViewModel {
    const subtotal = cart.summary.totalAmount;
    const deliveryFee = calculateDeliveryFee(subtotal);
    const tax = calculateTax(subtotal);
    const total = subtotal + deliveryFee + tax;

    // チェックアウト可能条件
    const canCheckout = cart.cart_items.length > 0 &&
        cart.cart_items.every(item => isInStock(item.food.stock, item.food.reserved));

    return {
        ...cart,
        subtotal,
        deliveryFee,
        tax,
        total,
        canCheckout,
    };
}

// 注文ステータスのラベルを取得
export function getOrderStatusLabel(status: OrderStatus | string): string {
    const labels: Record<string, string> = {
        pending: '注文待ち',
        confirmed: '注文確認済み',
        preparing: '調理中',
        delivery: '配送中',
        completed: '配送完了',
        cancelled: '注文キャンセル',
    };

    return labels[status] || status;
}

// 注文がキャンセル可能かチェック
export function canCancelOrder(status: OrderStatus | string): boolean {
    return status === 'pending' || status === 'confirmed';
}

// 注文の小計を計算
export function calculateOrderSubtotal(items: Array<{ quantity: number; price: number }>): number {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
}

// 注文ビューモデルを作成
export function createOrderViewModel(order: OrderData): OrderViewModel {
    const subtotal = calculateOrderSubtotal(order.items);
    const deliveryFee = calculateDeliveryFee(subtotal);
    const tax = calculateTax(subtotal);

    return {
        ...order,
        subtotal,
        deliveryFee,
        tax,
        formattedTotal: formatPrice(order.total_amount),
        statusLabel: getOrderStatusLabel(order.status),
        canCancel: canCancelOrder(order.status),
    };
}
