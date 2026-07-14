import * as React from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export default async function AdminEditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminProductForm productId={id} initialProducts={products} initialCategories={categories} />;
}
