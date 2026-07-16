import * as React from "react";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { ProductCatalog } from "@/components/storefront/ProductCatalog";

export default async function ProductsPage() {
  const products = await productService.getProducts();
  const categories = await categoryService.getCategories();
  return <ProductCatalog initialProducts={products} initialCategories={categories} />;
}
