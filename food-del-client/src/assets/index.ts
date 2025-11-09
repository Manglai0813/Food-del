// UI要素・アイコン
export const assets = {
    logo: new URL('./images/logo.png', import.meta.url).href,
    basket_icon: new URL('./images/basket_icon.png', import.meta.url).href,
    header_img: new URL('./images/header_img.png', import.meta.url).href,
    search_icon: new URL('./images/search_icon.png', import.meta.url).href,
    rating_starts: new URL('./images/rating_starts.png', import.meta.url).href,
    add_icon_green: new URL('./images/add_icon_green.png', import.meta.url).href,
    add_icon_white: new URL('./images/add_icon_white.png', import.meta.url).href,
    remove_icon_red: new URL('./images/remove_icon_red.png', import.meta.url).href,
    app_store: new URL('./images/app_store.png', import.meta.url).href,
    play_store: new URL('./images/play_store.png', import.meta.url).href,
    linkedin_icon: new URL('./images/linkedin_icon.png', import.meta.url).href,
    facebook_icon: new URL('./images/facebook_icon.png', import.meta.url).href,
    twitter_icon: new URL('./images/twitter_icon.png', import.meta.url).href,
    cross_icon: new URL('./images/cross_icon.png', import.meta.url).href,
    selector_icon: new URL('./images/selector_icon.png', import.meta.url).href,
    profile_icon: new URL('./images/profile_icon.png', import.meta.url).href,
    logout_icon: new URL('./images/logout_icon.png', import.meta.url).href,
    bag_icon: new URL('./images/bag_icon.png', import.meta.url).href,
    parcel_icon: new URL('./images/parcel_icon.png', import.meta.url).href,
} as const;

// カテゴリメニュー画像マッピング
export const categoryImages = {
    Salad: new URL('./images/menu_1.png', import.meta.url).href,
    Rolls: new URL('./images/menu_2.png', import.meta.url).href,
    Deserts: new URL('./images/menu_3.png', import.meta.url).href,
    Sandwich: new URL('./images/menu_4.png', import.meta.url).href,
    Cake: new URL('./images/menu_5.png', import.meta.url).href,
    'Pure Veg': new URL('./images/menu_6.png', import.meta.url).href,
    Pasta: new URL('./images/menu_7.png', import.meta.url).href,
    Noodles: new URL('./images/menu_8.png', import.meta.url).href,
} as const;

// カテゴリ名の型定義
export type CategoryName = keyof typeof categoryImages;

// カテゴリ画像取得ヘルパー関数
export const getCategoryImage = (categoryName: string): string => {
    return categoryImages[categoryName as CategoryName] || categoryImages.Salad;
};