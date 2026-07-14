import * as React from "react";
import { products } from "@/data/products";
import { SearchResults } from "@/components/storefront/SearchResults";

export default async function SearchResultsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = q || "";
  
  return <SearchResults query={query} initialProducts={products} />;
}
