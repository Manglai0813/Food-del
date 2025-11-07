import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

/**
 * メインレイアウトコンポーネント
 * レスポンシブデザインでHeader + Sidebar + Main構成
 */
const Layout: React.FC = () => {
        const [sidebarOpen, setSidebarOpen] = useState(false);
        const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

        return (
                <div>
                        {sidebarOpen && (
                                <div
                                        className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                                        onClick={() => setSidebarOpen(false)}
                                />
                        )}

                        <Sidebar
                                isOpen={sidebarOpen}
                                onClose={() => setSidebarOpen(false)}
                                collapsed={sidebarCollapsed}
                        />

                        <div className={`${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'} flex flex-col min-h-screen transition-all duration-300`}>
                                <Header
                                        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                                        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
                                        collapsed={sidebarCollapsed}
                                />
                                <main className="flex-1 p-6 bg-background mt-16">
                                        <Outlet />
                                </main>
                        </div>
                </div>
        );
};

export default Layout;