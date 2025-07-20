'use client'

import React, { useEffect, useState } from 'react';
import Image from "next/image";
import { toast } from 'sonner';
import { Toaster } from 'sonner';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { createFood, updateFood, getFood } from '@/api/foodApi';

export default function ProductForm({
    mode = 'create',
    productId = null,
    onSuccess = () => { }
}) {
    const [image, setImage] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    // 設置 React Hook Form
    const form = useForm({
        defaultValues: {
            name: '',
            description: '',
            price: '',
            category: '',
        }
    });

    useEffect(() => {
        if (mode !== 'create' && productId) {
            const fetchProductData = async () => {
                try {
                    const product = await getFood(productId);
                    if (product) {
                        // 填充表单数据
                        form.reset({
                            name: product.name,
                            description: product.description,
                            price: product.price,
                            category: product.category,
                        });

                        // 如果有图片URL，设置图片预览
                        if (product.imageUrl) {
                            setImageUrl(product.imageUrl);
                        }
                    }
                } catch (error) {
                    toast.error("Failed to fetch product data");

                }
            };

            fetchProductData();
        }
    }, [mode, productId, form]);

    const onSubmit = async (values) => {
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("price", Number(values.price));
        formData.append("category", values.category);
        formData.append("image", image);

        if (image) {
            formData.append("image", image);
        }

        if (mode !== 'create' && productId) {
            formData.append("id", productId);
        }

        try {
            let response;

            if (mode == "create") {
                const response = await createFood(formData);
                if (response.success) {
                    form.reset();
                    setImage(false);
                    toast.success(response.message || "Product added successfully");
                    onSuccess();
                } else {
                    toast.error(response.message || "Failed to add product");
                }
            } else {
                const response = await updateFood(formData);
                if (response.success) {
                    toast.success(response.message || "Product updated successfully");
                    onSuccess();
                } else {
                    toast.error(response.message || "Failed to update product");
                }
            }
        } catch (error) {
            toast.error(mode == "create"
                ? "An error occurred while adding the product"
                : "An error occurred while updating the product"
            );
            console.error(error);
        }
    }

    return (
        <div className="flex justify-center items-center h-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 border rounded-lg  max-w-4xl w-full"
                >
                    <div className="space-y-4">
                        {/* 產品名稱 */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter product name"
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {/* 產品描述 */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write product description here"
                                            className="resize-none"
                                            rows={6}
                                            {...field}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4">
                        {/* 產品圖片上傳 */}
                        <FormItem>
                            <FormLabel>Product Image</FormLabel>
                            <div className="border-2 border-dashed border-gray-300 rounded-md p-2 text-center">
                                <label htmlFor="image-upload" className="cursor-pointer">
                                    <div className="mt-2">
                                        {image ? (
                                            <div className="relative h-20 w-full">
                                                <Image
                                                    src={URL.createObjectURL(image)}
                                                    alt="Product Preview"
                                                    fill
                                                    className="mx-auto object-contain"
                                                />
                                            </div>
                                        ) : (
                                            <div className="relative h-20 w-full">
                                                <Image
                                                    src="/file-upload.svg"
                                                    alt="Upload Image"
                                                    fill
                                                    className="mx-auto object-contain"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        onChange={(e) => setImage(e.target.files[0])}
                                        accept="image/*"
                                    />
                                    <span className="mt-2 block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                                        Click to upload image
                                    </span>
                                </label>
                            </div>
                        </FormItem>

                        <div className="grid grid-cols-2 gap-4">
                            {/* 類別選擇 */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Salad">Salad</SelectItem>
                                                <SelectItem value="Rolls">Rolls</SelectItem>
                                                <SelectItem value="Pasta">Pasta</SelectItem>
                                                <SelectItem value="Deserts">Deserts</SelectItem>
                                                <SelectItem value="SandWich">SandWich</SelectItem>
                                                <SelectItem value="Cake">Cake</SelectItem>
                                                <SelectItem value="Pure Veg">Pure Veg</SelectItem>
                                                <SelectItem value="Noodles">Noodles</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />

                            {/* 價格輸入 */}
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="$0.00"
                                                min="0"
                                                step="0.01"
                                                {...field}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* 提交按鈕 */}
                    <div className="col-span-1 md:col-span-2 mt-4">
                        <Button
                            type="submit"
                            className="w-full"
                        >
                            Save
                        </Button>
                    </div>
                </form>
                <Toaster />
            </Form>
        </div>
    );
}