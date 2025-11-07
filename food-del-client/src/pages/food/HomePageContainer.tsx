/**
 * ホームページ完全版コンテナ
 * 旧clientのApp.jsxに相当
 */

import { useState } from 'react';
import { Navbar, FooterNew } from '@/components/layout';
import { LoginPopup } from '@/components/auth';
import { HomePage } from './HomePage';

export const HomePageContainer: React.FC = () => {
        const [showLogin, setShowLogin] = useState(false);

        return (
                <div className="app px-[8vw]">
                        <Navbar setShowLogin={setShowLogin} />
                        <HomePage />
                        <FooterNew />

                        {/* ログインポップアップ */}
                        {showLogin && <LoginPopup setShowLogin={setShowLogin} />}
                </div>
        );
};
