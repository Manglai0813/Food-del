// ストア
export { useAuthStore } from './auth';
export { useCartStore } from './cart';
export { useUIStore } from './ui';
export { usePreferencesStore } from './preferences';

// セレクター関数
export {
    selectIsAdmin,
    selectUserId,
    selectUserEmail,
} from './auth';

// カート関連セレクター
export {
    selectCartItemCount,
    selectCartTotal,
    selectCartIsEmpty,
} from './cart';

// UI関連セレクター
export {
    selectIsLoading,
    selectLoadingMessage,
    selectIsSidebarOpen,
    selectModals,
    selectToasts,
    selectSearchQuery,
    selectActiveFilters,
    selectHasActiveFilters,
} from './ui';

// ユーザー設定セレクター
export {
    selectTheme,
    selectLanguage,
    selectCurrency,
    selectFoodPreferences,
    selectDeliveryPreferences,
    selectNotificationSettings,
    selectAccessibilitySettings,
} from './preferences';

// 型定義
export type { Toast, Modal } from './ui';

// 個別インポート
import { useAuthStore } from './auth';
import { useCartStore } from './cart';
import { useUIStore } from './ui';
import { usePreferencesStore } from './preferences';

// ストア組み合わせ用ユーティリティ型
export type AllStores = {
    auth: ReturnType<typeof useAuthStore>;
    cart: ReturnType<typeof useCartStore>;
    ui: ReturnType<typeof useUIStore>;
    preferences: ReturnType<typeof usePreferencesStore>;
};