"use client";

import * as React from "react";
import { Product } from "@/types";
import { useProductStore } from "@/stores/productStore";
import { ProductCard } from "./ProductCard";

interface TrendingProductsProps {
  initialProducts: Product[];
}

export function TrendingProducts({ initialProducts }: TrendingProductsProps) {
  const { products, initializeProducts } = useProductStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
  }, [initialProducts, initializeProducts]);

  const activeProducts = products.length > 0 ? products : initialProducts;

  // Take first 5 products as "trending"
  const trending = React.useMemo(() => {
    return activeProducts.slice(0, 5);
  }, [activeProducts]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {trending.map((product) => (
        <ProductCard key={product._id} product={product} layout="grid" />
      ))}
    </div>
  );
}
