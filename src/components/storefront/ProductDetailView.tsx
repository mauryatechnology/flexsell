"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, Truck, ArrowLeft, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ProductVariants } from "@/components/storefront/ProductVariants";
import { useProductStore } from "@/stores/productStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { Barcode } from "@/components/ui/Barcode";

interface ProductDetailViewProps {
  slug: string;
  initialProducts: Product[];
}

export function ProductDetailView({ slug, initialProducts }: ProductDetailViewProps) {
  const { products, initializeProducts } = useProductStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
  }, [initialProducts, initializeProducts]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const product = activeProducts.find((p) => p.slug === slug);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist in our wholesale catalog.</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const favorited = isInWishlist(product._id);
  const mainImage = product.images[0];

  return (
    <div className="container mx-auto px-4 py-8 text-foreground">
      <div className="mb-6 flex justify-between items-center">
        <Link href="/products" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => toggleWishlist(product)}
          className={favorited ? "text-destructive border-destructive" : ""}
        >
          <Heart className={`h-4 w-4 mr-2 ${favorited ? "fill-destructive" : ""}`} />
          {favorited ? "In Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-secondary rounded-xl overflow-hidden border">
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button key={i} className="w-20 h-20 rounded-md border-2 border-transparent hover:border-primary overflow-hidden flex-shrink-0 bg-secondary">
                <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary">SKU: {product.sku}</Badge>
              {product.fsiNo && (
                <Badge variant="outline" className="border-primary text-primary font-mono">
                  FSI: {product.fsiNo}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center text-yellow-500 font-medium">
                ★ {product.rating} <span className="text-muted-foreground ml-1 font-normal">({product.reviewCount} reviews)</span>
              </div>
              <span>|</span>
              <span>100+ bought in past month</span>
            </div>
          </div>

          <ProductVariants product={product} />

          {/* Code 39 Combined Barcode */}
          <div className="flex flex-col gap-1.5 p-3 bg-white rounded-lg border border-border w-max">
            <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Product Logistical Barcode</span>
            <Barcode sku={product.sku} fsiNo={product.fsiNo} height={40} />
          </div>

          <div className="grid grid-cols-2 gap-4 py-6 border-y">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-sm">Fast Shipping</p>
                <p className="text-xs text-muted-foreground">Across India</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Product Description</h3>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* A+ Content Section */}
      {product.aPlusContent && product.aPlusContent.length > 0 && (
        <div className="mt-20 space-y-16 border-t pt-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold tracking-tight">From the Manufacturer</h2>
            <p className="text-muted-foreground">Discover the premium features and build quality that makes this product a bestseller.</p>
          </div>
          
          <div className="space-y-12 max-w-5xl mx-auto">
            {product.aPlusContent.map((block) => {
              if (block.type === "image" && block.imageUrl) {
                const isTall = block.content === "970x600";
                return (
                  <div key={block.id} className="max-w-[970px] mx-auto border bg-secondary/10 overflow-hidden rounded-xl shadow-sm flex items-center justify-center">
                    <img 
                      src={block.imageUrl} 
                      alt="Manufacturer marketing banner" 
                      className="w-full object-cover"
                      style={{ aspectRatio: isTall ? "970/600" : "970/300" }}
                    />
                  </div>
                );
              }
              if (block.type === "image-text") {
                return (
                  <div key={block.id} className="grid md:grid-cols-2 gap-8 items-center bg-secondary/20 rounded-2xl overflow-hidden border">
                    {block.imageUrl && (
                      <div className="h-64 md:h-full relative">
                        <img src={block.imageUrl} alt={block.title || "Product feature"} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-8 space-y-4">
                      {block.title && <h3 className="text-2xl font-bold">{block.title}</h3>}
                      {block.content && <p className="text-muted-foreground leading-relaxed">{block.content}</p>}
                    </div>
                  </div>
                );
              }
              if (block.type === "features" && block.features) {
                return (
                  <div key={block.id} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {block.features.map((feature, idx) => (
                      <div key={idx} className="bg-secondary/40 p-6 rounded-xl border text-center space-y-3">
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary font-bold text-xl">
                          {idx + 1}
                        </div>
                        <p className="font-medium">{feature}</p>
                      </div>
                    ))}
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
