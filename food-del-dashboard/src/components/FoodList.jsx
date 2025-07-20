'use client'

import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getFoodList, deleteFood, getFood } from '@/api/foodApi';
import ProductView from "./ProductView";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function FoodList() {
    const [list, setList] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [viewDialogOpen, setViewDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    const router = useRouter();

    const fetchList = async (page = currentPage) => {
        setLoading(true);
        try {
            const response = await getFoodList(page, pageSize);

            if (response.success) {
                setList(response.data);

                if (response.pagination) {
                    setTotalItems(response.pagination.total);
                    setTotalPages(response.pagination.totalPages);
                    setCurrentPage(response.pagination.page);
                }
            } else {
                toast.error(response.message || "Error fetching data");
            }
        } catch (error) {
            toast.error("Failed to load data");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchList(1);
    }, []);

    const handleDelete = (foodId) => {
        setSelectedId(foodId);
        setShowConfirm(true);
    };

    // 編輯產品的函數
    // 這裡的 router 是 Next.js 的路由器，用於導航到編輯頁面
    const handleEdit = (foodId) => {
        router.push(`/dashboard/editProduct/${foodId}`);
    };

    const handelView = async (foodId) => {
        setLoading(true);
        try {
            const response = await getFood(foodId);
            if (response.success) {
                setSelectedProduct(response.data);
                setViewDialogOpen(true);
            } else {
                toast.error(response.message || "Error fetching product data");
            }
        } catch (error) {
            toast.error("Failed to load product data");
        } finally {
            setLoading(false);
        }
    };

    const confirmDelete = async () => {
        setLoading(true);
        try {
            const response = await deleteFood(selectedId);
            if (response.success) {
                toast.success(response.message || "Item deleted successfully");
                await fetchList();
            } else {
                toast.error(response.message || "Failed to delete item");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
            setShowConfirm(false);
            setSelectedId(null);
        }
    };

    const handlePageChange = (page) => {
        if (page < 1) page = 1;
        if (page > totalPages) page = totalPages;

        if (page !== currentPage) {
            setCurrentPage(page);
            fetchList(page);
        }
    }

    const goToNextPage = () => handlePageChange(currentPage + 1);
    const goToPreviousPage = () => handlePageChange(currentPage - 1);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Products List</h1>
            <div className="w-full overflow-x-auto">
                <Table className="w-full table-fixed">
                    <TableHeader>
                        <TableRow className="border-gray-200 hover:bg-gray-100 hover:shadow-sm">
                            <TableHead className="font-bold text-black">Image</TableHead>
                            <TableHead className="font-bold text-black">Name</TableHead>
                            <TableHead className="font-bold text-black">Category</TableHead>
                            <TableHead className="font-bold text-black w-24">Price</TableHead>
                            <TableHead className="font-bold text-black w-80 text-center">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {list.length > 0 ? (
                            list.map((item) => (
                                <TableRow key={item.id} className="border-gray-200 hover:bg-gray-100 hover:shadow-sm">
                                    <TableCell>
                                        <Image
                                            src={`${API_URL}${item.image_path}`}
                                            alt={item.name}
                                            width={64}
                                            height={64}
                                            className="object-cover rounded"
                                        />
                                    </TableCell>
                                    <TableCell className="truncate">{item.name}</TableCell>
                                    <TableCell className="truncate">{item.category}</TableCell>
                                    <TableCell>${item.price}</TableCell>
                                    <TableCell className='align-middle text-center'>
                                        <Button
                                            className="rounded-full border-green-700 text-green-700 hover:bg-green-700 hover:text-white transition-colors w-16 mx-3"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handelView(item.id)}
                                            disabled={loading}
                                        >
                                            View
                                        </Button>
                                        <Button
                                            className="rounded-full border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition-colors w-16"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleEdit(item.id)}
                                            disabled={loading}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            className="rounded-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors w-16 mx-3"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleDelete(item.id)}
                                            disabled={loading}
                                        >
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                                    No products found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* 分頁組件 */}
            {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                    <Pagination>
                        <PaginationContent>
                            {/* 上一頁按鈕 */}
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={goToPreviousPage}
                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>

                            {/* 生成頁碼按鈕 */}
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // 顯示邏輯: 顯示第一頁、最後一頁，和當前頁附近的頁碼
                                    return page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                })
                                .map((page, i, filteredPages) => {
                                    // 檢查是否需要添加省略號
                                    const needEllipsisBefore = i > 0 && filteredPages[i - 1] !== page - 1;
                                    const needEllipsisAfter = i < filteredPages.length - 1 && filteredPages[i + 1] !== page + 1;

                                    return (
                                        <React.Fragment key={page}>
                                            {/* 如需要，添加前置省略號 */}
                                            {needEllipsisBefore && (
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )}

                                            {/* 頁碼按鈕 */}
                                            <PaginationItem>
                                                <PaginationLink
                                                    onClick={() => handlePageChange(page)}
                                                    isActive={page === currentPage}
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>

                                            {/* 如需要，添加後置省略號 */}
                                            {needEllipsisAfter && (
                                                <PaginationItem>
                                                    <PaginationEllipsis />
                                                </PaginationItem>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            }

                            {/* 下一頁按鈕 */}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={goToNextPage}
                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            )}

            {showConfirm && (
                <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>削除してもよろしいですか？</AlertDialogTitle>
                            <AlertDialogDescription>
                                この操作は取り消せません、製品は永久に削除されます
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel disabled={loading}>
                                Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDelete} disabled={loading}
                                className='bg-red-500 hover:bg-red-600 text-white'
                            >
                                Continue
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Product Details</DialogTitle>
                    </DialogHeader>
                    {selectedProduct && <ProductView product={selectedProduct} />}
                </DialogContent>
            </Dialog>

            <Toaster />
        </div>
    )
};