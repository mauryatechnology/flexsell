import * as React from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { AdminProductsManager } from "@/components/admin/AdminProductsManager";

export default function AdminProductsPage() {
  return <AdminProductsManager initialProducts={products} initialCategories={categories} />;
}
