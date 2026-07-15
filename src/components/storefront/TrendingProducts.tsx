"use client";

import * as React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart, Heart } from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import Image from "next/image";

interface TrendingProductsProps {
  initialProducts: Product[];
}

export function TrendingProducts({ initialProducts }: TrendingProductsProps) {
  const { products, initializeProducts } = useProductStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
  }, [initialProducts, initializeProducts]);

  const activeProducts = products.length > 0 ? products : initialProducts;

  // Take first 5 products as "trending"
  const trending = React.useMemo(() => {
    return activeProducts.slice(0, 5);
  }, [activeProducts]);

  const handleAddToCart = (product: Product) => {
    const defaultVariant = product.colorVariants?.[0];
    const defaultSub = defaultVariant?.subVariants?.[0];
    if (!defaultVariant || !defaultSub) return;

    addItem(
      product,
      {
        Color: defaultVariant.color,
        Size: defaultSub.size || "Standard",
        Weight: defaultSub.weight || "250g"
      },
      1
    );
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {trending.map((product) => {
        const favorited = isInWishlist(product._id);
        const defaultVariant = product.colorVariants?.[0];
        const defaultSub = defaultVariant?.subVariants?.[0];
        const imgUrl = defaultVariant?.images?.[0] || "";

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
                <Image
                  src={imgUrl || "https://placehold.co/400x400/10b981/ffffff?text=Product"}
                  alt={product.title}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
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
                <PriceDisplay price={defaultSub?.price || 0} mrp={defaultSub?.mrp || 0} discount={defaultSub?.discount || 0} />
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
  );
}
