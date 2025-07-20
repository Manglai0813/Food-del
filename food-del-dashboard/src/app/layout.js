'use client'

import { useState } from 'react';
import Header from "@/components/shared/header";
import Sidebar from "@/components/shared/sidebar";
import { AuthProvider } from "../context/AuthContext";
import { usePathname } from 'next/navigation';
import { PT_Sans, PT_Serif } from "next/font/google";
import "./globals.css";

const ptSans = PT_Sans({
  weight: ['400', '700'],
  variable: "--font-pt-sans",
  subsets: ["latin"],
});

const ptSerif = PT_Serif({
  weight: ['400', '700'],
  variable: "--font-pt-serif",
  subsets: ["latin"],
});

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <html lang="en">
      <head>
        <title>Tomato Admin</title>
        <meta name="description" content="Food Delivery Admin Panel" />
      </head>
      <body className={`${ptSans.variable} ${ptSerif.variable} antialiased`}>
        <AuthProvider>
          {!isAuthPage && <Header />}
          <div className="flex min-h-screen pt-16">
            {!isAuthPage && (
              <aside
                className={`fixed left-0 top-16 bottom-0 border-r border-gray-200 transition-all duration-300 ${isSidebarCollapsed ? "w-16" : "w-64"
                  }`}
              >
                <Sidebar collapsed={isSidebarCollapsed} toggleSidebar={toggleSidebar} />
              </aside>
            )}
            <main
              className={`flex-1 transition-all duration-300 ${!isAuthPage
                  ? (isSidebarCollapsed ? "ml-16" : "ml-64")
                  : ""
                }`}
            >
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}