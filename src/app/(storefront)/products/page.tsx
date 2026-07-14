import * as React from "react";
import { products } from "@/data/products";
import { ProductCatalog } from "@/components/storefront/ProductCatalog";

export default function ProductsPage() {
  return <ProductCatalog initialProducts={products} />;
}
