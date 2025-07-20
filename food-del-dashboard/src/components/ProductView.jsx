import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

export default function ProductView({ product }) {
    if (!product) return <div>No product data  available</div>;

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    return (
        <Card className="w-full border-none shadow-none">
            <CardContent className="p-0">
                <div className='grid md:grid-cols-2 gap-6'>
                    <div className='flex justify-center items-center'>
                        {product.image_path ? (
                            <div className='w-full flex justify-center items-center'>
                                <Image
                                    src={`${API_URL}${product.image_path}`}
                                    alt='product image'
                                    width={64}
                                    height={64}
                                    className='object-contain rounded-md'
                                />
                            </div>
                        ) : (
                            <div className='w-full h-64 flex items-center justify-center bg-gray-100 rounded-md'>
                                <span className='text-gray-400'>No image available</span>
                            </div>
                        )}
                    </div>

                    <div className='space-y-4'>
                        <div>
                            <h2 className='text-2xl font-bold'>{product.name}</h2>
                            <div className='flex items-center mt-2'>
                                <Badge variant='outline' className='mr-2'>{product.category}</Badge>
                                <span className='text-xl font-bold text-green-600'>${product.price}</span>
                            </div>
                        </div>

                        <div>
                            <h3 className='text-lg font-medium mb-2'>Description</h3>
                            <p className='text-gray-700 whitespace-pre-line'>{product.description}</p>
                        </div>

                        <Separator />

                        <div className='flex items-center justify-between text-sm text-gray-500'>
                            <span>Product ID: {product.id}</span>
                            {product.created_at && (
                                <span>Added: {new Date(product.created_at).toLocaleDateString()}</span>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
};
