import * as React from "react";
import { productService } from "@/services/productService";
import { SearchResults } from "@/components/storefront/SearchResults";

export default async function SearchResultsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";
  const products = await productService.getProducts();
  
  return <SearchResults query={query} initialProducts={products} />;
}
