"use client";

import * as React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart, Trash2, Heart } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";

export function WishlistView() {
  const { items, toggleWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  const handleMoveToCart = (product: Product) => {
    const selectedVariants: Record<string, string> = {};
    if (product.variants) {
      product.variants.forEach(v => {
        if (!selectedVariants[v.name]) {
          selectedVariants[v.name] = v.value;
        }
      });
    }
    // Add to cart
    addItem(product, selectedVariants, 1);
    // Remove from wishlist
    toggleWishlist(product);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">My Wishlist</h1>
        <p className="text-muted-foreground mt-1">Saved items you might want to purchase later.</p>
      </div>

      {items.length === 0 ? (
        <EmptyState 
          title="Your wishlist is empty" 
          description="Looks like you haven't added any products to your wishlist yet."
          actionText="Browse Products"
          actionHref="/products"
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {items.map((product) => (
            <Card key={product._id} className="flex flex-col h-full hover:shadow-md transition-shadow relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 z-10 text-destructive hover:bg-destructive/10 bg-background/50 backdrop-blur-sm"
                title="Remove from wishlist"
                onClick={() => toggleWishlist(product)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
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
                    onClick={() => handleMoveToCart(product)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Move to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
