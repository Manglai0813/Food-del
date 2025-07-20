"use client"

import React from 'react';
import { useParams } from 'next/navigation';
import EditProductForm from '@/components/ProductForm';

export default function EditProduct() {
    const params = useParams();
    const productId = params.id;
    return (
        <EditProductForm
            mode='update'
            productId={productId}
        />
    )
}
