import * as React from "react";
import { productService } from "@/services/productService";
import { ProductCatalog } from "@/components/storefront/ProductCatalog";

export default async function ProductsPage() {
  const products = await productService.getProducts();
  return <ProductCatalog initialProducts={products} />;
}
