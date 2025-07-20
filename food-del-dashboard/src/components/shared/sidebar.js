'use client'

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { PlusCircle, List, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function Sidebar({ collapsed = false, toggleSidebar }) {
    const pathname = usePathname();
    const menuItems = [
        {
            title: 'List Items',
            href: '/dashboard/products',
            icon: List
        },
        {
            title: 'Add Items',
            href: '/dashboard/addProduct',
            icon: PlusCircle
        },
        {
            title: 'Orders',
            href: '/dashboard/orders',
            icon: ShoppingBag
        }
    ]

    return (
        <div className="flex flex-col gap-1 p-3 h-full">
            <div className="flex-grow">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;

                    if (collapsed) {
                        return (
                            <TooltipProvider key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Button
                                            variant={isActive ? "secondary" : "ghost"}
                                            className="w-full justify-center p-2"
                                            asChild
                                        >
                                            <Link href={item.href}>
                                                <item.icon className="h-5 w-5" />
                                            </Link>
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {item.title}
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        );
                    }

                    return (
                        <Button
                            key={item.href}
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start gap-2 py-3"
                            asChild
                        >
                            <Link href={item.href}>
                                <item.icon className="h-6 w-6" />
                                {item.title}
                            </Link>
                        </Button>
                    );
                })}
            </div>

            {/* 折疊按鈕放在底部 */}
            <div className="mt-auto pt-4 border-t border-gray-200">
                {collapsed ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={toggleSidebar}
                                    className="w-full justify-center"
                                >
                                    <ChevronRight className="h-5 w-5" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                サイドバーを展開
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleSidebar}
                        className="w-full justify-between"
                    >
                        <span>サイドバーを折りたたむ</span>
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                )}
            </div>
        </div>
    )
}