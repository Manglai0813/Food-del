/**
 * ユーザー設定状態管理Store
 * テーマ、言語、通知設定などの個人設定
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';
type Language = 'ja' | 'en' | 'zh';
type Currency = 'JPY' | 'USD' | 'CNY';

interface NotificationSettings {
        orderUpdates: boolean;
        promotions: boolean;
        newsletter: boolean;
        email: boolean;
        push: boolean;
        sms: boolean;
}

interface AccessibilitySettings {
        reducedMotion: boolean;
        highContrast: boolean;
        fontSize: 'small' | 'medium' | 'large';
        keyboardNavigation: boolean;
}

interface FoodPreferences {
        allergens: string[];
        dietaryRestrictions: string[];
        spiceLevel: 'none' | 'mild' | 'medium' | 'hot' | 'extra-hot';
        preferredCuisines: string[];
        excludedIngredients: string[];
}

interface DeliveryPreferences {
        defaultAddress?: {
                street: string;
                city: string;
                state: string;
                zipCode: string;
                country: string;
                additionalInfo?: string;
        };
        preferredDeliveryTime?: string;
        specialInstructions?: string;
}

interface PreferencesState {
        // UI設定
        theme: Theme;
        language: Language;
        currency: Currency;

        // 通知設定
        notifications: NotificationSettings;

        // アクセシビリティ設定
        accessibility: AccessibilitySettings;

        // 食品設定
        foodPreferences: FoodPreferences;

        // 配送設定
        deliveryPreferences: DeliveryPreferences;

        // 表示設定
        itemsPerPage: number;
        defaultSort: string;
        showNutritionInfo: boolean;
        showPrices: boolean;

        // プライバシー設定
        allowAnalytics: boolean;
        allowPersonalization: boolean;
        shareDataWithPartners: boolean;

        // アクション
        setTheme: (theme: Theme) => void;
        setLanguage: (language: Language) => void;
        setCurrency: (currency: Currency) => void;
        updateNotifications: (notifications: Partial<NotificationSettings>) => void;
        updateAccessibility: (accessibility: Partial<AccessibilitySettings>) => void;
        updateFoodPreferences: (foodPreferences: Partial<FoodPreferences>) => void;
        updateDeliveryPreferences: (deliveryPreferences: Partial<DeliveryPreferences>) => void;
        setItemsPerPage: (count: number) => void;
        setDefaultSort: (sort: string) => void;
        toggleNutritionInfo: () => void;
        togglePrices: () => void;
        updatePrivacySettings: (settings: {
                allowAnalytics?: boolean;
                allowPersonalization?: boolean;
                shareDataWithPartners?: boolean;
        }) => void;
        resetPreferences: () => void;
}

const defaultNotifications: NotificationSettings = {
        orderUpdates: true,
        promotions: false,
        newsletter: false,
        email: true,
        push: true,
        sms: false,
};

const defaultAccessibility: AccessibilitySettings = {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        keyboardNavigation: false,
};

const defaultFoodPreferences: FoodPreferences = {
        allergens: [],
        dietaryRestrictions: [],
        spiceLevel: 'medium',
        preferredCuisines: [],
        excludedIngredients: [],
};

const defaultDeliveryPreferences: DeliveryPreferences = {};

export const usePreferencesStore = create<PreferencesState>()(
        persist(
                (set) => ({
                        // 初期状態
                        theme: 'system',
                        language: 'ja',
                        currency: 'JPY',
                        notifications: defaultNotifications,
                        accessibility: defaultAccessibility,
                        foodPreferences: defaultFoodPreferences,
                        deliveryPreferences: defaultDeliveryPreferences,
                        itemsPerPage: 20,
                        defaultSort: 'popularity',
                        showNutritionInfo: true,
                        showPrices: true,
                        allowAnalytics: true,
                        allowPersonalization: true,
                        shareDataWithPartners: false,

                        // UI設定
                        setTheme: (theme) => {
                                set({ theme });
                                // システムテーマ変更の反映
                                if (theme === 'system') {
                                        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                                        document.documentElement.setAttribute('data-theme', systemTheme);
                                } else {
                                        document.documentElement.setAttribute('data-theme', theme);
                                }
                        },

                        setLanguage: (language) => {
                                set({ language });
                                // 言語設定をHTMLに反映
                                document.documentElement.lang = language;
                        },

                        setCurrency: (currency) => {
                                set({ currency });
                        },

                        // 通知設定
                        updateNotifications: (updates) => {
                                set(state => ({
                                        notifications: { ...state.notifications, ...updates }
                                }));
                        },

                        // アクセシビリティ設定
                        updateAccessibility: (updates) => {
                                set(state => {
                                        const newAccessibility = { ...state.accessibility, ...updates };

                                        // CSS カスタムプロパティに反映
                                        if (updates.fontSize) {
                                                const fontSizes = { small: '14px', medium: '16px', large: '18px' };
                                                document.documentElement.style.setProperty('--base-font-size', fontSizes[updates.fontSize]);
                                        }

                                        if (updates.reducedMotion !== undefined) {
                                                document.documentElement.style.setProperty(
                                                        '--animation-duration',
                                                        updates.reducedMotion ? '0ms' : '200ms'
                                                );
                                        }

                                        if (updates.highContrast !== undefined) {
                                                document.documentElement.classList.toggle('high-contrast', updates.highContrast);
                                        }

                                        return { accessibility: newAccessibility };
                                });
                        },

                        // 食品設定
                        updateFoodPreferences: (updates) => {
                                set(state => ({
                                        foodPreferences: { ...state.foodPreferences, ...updates }
                                }));
                        },

                        // 配送設定
                        updateDeliveryPreferences: (updates) => {
                                set(state => ({
                                        deliveryPreferences: { ...state.deliveryPreferences, ...updates }
                                }));
                        },

                        // 表示設定
                        setItemsPerPage: (count) => {
                                set({ itemsPerPage: Math.max(10, Math.min(100, count)) }); // 10-100の範囲に制限
                        },

                        setDefaultSort: (sort) => {
                                set({ defaultSort: sort });
                        },

                        toggleNutritionInfo: () => {
                                set(state => ({ showNutritionInfo: !state.showNutritionInfo }));
                        },

                        togglePrices: () => {
                                set(state => ({ showPrices: !state.showPrices }));
                        },

                        // プライバシー設定
                        updatePrivacySettings: (settings) => {
                                set(state => ({ ...state, ...settings }));
                        },

                        // 設定リセット
                        resetPreferences: () => {
                                set({
                                        theme: 'system',
                                        language: 'ja',
                                        currency: 'JPY',
                                        notifications: defaultNotifications,
                                        accessibility: defaultAccessibility,
                                        foodPreferences: defaultFoodPreferences,
                                        deliveryPreferences: defaultDeliveryPreferences,
                                        itemsPerPage: 20,
                                        defaultSort: 'popularity',
                                        showNutritionInfo: true,
                                        showPrices: true,
                                        allowAnalytics: true,
                                        allowPersonalization: true,
                                        shareDataWithPartners: false,
                                });
                        },
                }),
                {
                        name: 'preferences-storage', // localStorage キー
                        partialize: (state) => ({
                                // persistする項目（機密情報は除外）
                                theme: state.theme,
                                language: state.language,
                                currency: state.currency,
                                notifications: state.notifications,
                                accessibility: state.accessibility,
                                foodPreferences: state.foodPreferences,
                                deliveryPreferences: state.deliveryPreferences,
                                itemsPerPage: state.itemsPerPage,
                                defaultSort: state.defaultSort,
                                showNutritionInfo: state.showNutritionInfo,
                                showPrices: state.showPrices,
                                allowAnalytics: state.allowAnalytics,
                                allowPersonalization: state.allowPersonalization,
                                shareDataWithPartners: state.shareDataWithPartners,
                        }),
                }
        )
);

// セレクター関数
export const selectTheme = (state: PreferencesState) => state.theme;
export const selectLanguage = (state: PreferencesState) => state.language;
export const selectCurrency = (state: PreferencesState) => state.currency;
export const selectFoodPreferences = (state: PreferencesState) => state.foodPreferences;
export const selectDeliveryPreferences = (state: PreferencesState) => state.deliveryPreferences;
export const selectNotificationSettings = (state: PreferencesState) => state.notifications;
export const selectAccessibilitySettings = (state: PreferencesState) => state.accessibility;