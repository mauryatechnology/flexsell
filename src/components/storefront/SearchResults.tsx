"use client";

import * as React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart, SearchX, Heart } from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

interface SearchResultsProps {
  query: string;
  initialProducts: Product[];
}

export function SearchResults({ query, initialProducts }: SearchResultsProps) {
  const { products, initializeProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
  }, [initialProducts, initializeProducts]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const lowercaseQuery = query.toLowerCase();

  const results = React.useMemo(() => {
    if (!lowercaseQuery) return activeProducts;
    return activeProducts.filter(p => 
      p.title.toLowerCase().includes(lowercaseQuery) || 
      p.description.toLowerCase().includes(lowercaseQuery) ||
      p.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [activeProducts, lowercaseQuery]);

  const handleAddToCart = (product: Product) => {
    const selectedVariants: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach(v => {
        if (!selectedVariants[v.name]) {
          selectedVariants[v.name] = v.value;
        }
      });
    }
    addItem(product, selectedVariants, 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Search Results
        </h1>
        <p className="text-muted-foreground mt-1">
          Showing results for "{query}"
        </p>
      </div>
      
      {results.length === 0 ? (
        <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed flex flex-col items-center">
          <div className="bg-secondary p-4 rounded-full mb-4">
            <SearchX className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-medium text-foreground">No matches found</h3>
          <p className="text-muted-foreground mt-1 mb-6">We couldn't find any products matching your search terms.</p>
          <Link href="/products">
            <Button>Browse All Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {results.map((product) => {
            const favorited = isInWishlist(product._id);
            return (
              <Card key={product._id} className="flex flex-col h-full hover:shadow-md transition-shadow relative group">
                <button 
                  onClick={() => toggleWishlist(product)}
                  className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive p-1.5 rounded-full shadow-sm transition-colors"
                >
                  <Heart className={`h-4.5 w-4.5 ${favorited ? "fill-destructive text-destructive" : ""}`} />
                </button>

                <div className="aspect-square relative bg-secondary overflow-hidden rounded-t-lg">
                  <Link href={`/products/${product.slug}`}>
                    <img
                      src={product.images[0]}
                      alt={product.title}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                </div>
                <CardContent className="p-4 flex flex-col flex-1 gap-2">
                  <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                    <h3 className="font-medium text-sm line-clamp-2 text-foreground" title={product.title}>
                      {product.title}
                    </h3>
                  </Link>
                  <div className="mt-auto pt-2 space-y-3">
                    <PriceDisplay price={product.price} mrp={product.mrp} discount={product.discount} />
                    <Button 
                      className="w-full" 
                      size="sm"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
