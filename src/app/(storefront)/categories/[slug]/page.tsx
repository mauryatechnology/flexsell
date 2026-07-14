import * as React from "react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import { CategoryCatalog } from "@/components/storefront/CategoryCatalog";

export default async function CategoryProductsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CategoryCatalog slug={slug} initialProducts={products} initialCategories={categories} />;
}
