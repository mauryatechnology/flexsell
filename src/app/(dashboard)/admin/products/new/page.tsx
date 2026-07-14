import * as React from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { AdminProductForm } from "@/components/admin/AdminProductForm";

export default function AdminNewProductPage() {
  return <AdminProductForm initialProducts={products} initialCategories={categories} />;
}
