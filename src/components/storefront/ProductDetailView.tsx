"use client";

import * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { Badge } from "@/components/ui/Badge";
import { Barcode } from "@/components/ui/Barcode";
import { useProductStore } from "@/stores/productStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  Minus, 
  Plus, 
  Check, 
  Box,
  Scale,
  Maximize2
} from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface ProductDetailViewProps {
  slug: string;
  initialProducts: Product[];
}

export function ProductDetailView({ slug, initialProducts }: ProductDetailViewProps) {
  const { products, initializeProducts } = useProductStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addItem } = useCartStore();

  React.useEffect(() => {
    initializeProducts(initialProducts);
  }, [initialProducts, initializeProducts]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const product = activeProducts.find((p) => p.slug === slug);

  // Selector States
  const [selectedColorIdx, setSelectedColorIdx] = React.useState(0);
  const [selectedSize, setSelectedSize] = React.useState("");
  const [selectedWeight, setSelectedWeight] = React.useState("");
  const [qty, setQty] = React.useState(1);
  const [activeImageIdx, setActiveImageIdx] = React.useState(0);
  const [addedToCartToast, setAddedToCartToast] = React.useState(false);

  // Derive active variant details
  const activeVariant = React.useMemo(() => {
    if (!product || !product.colorVariants) return null;
    return product.colorVariants[selectedColorIdx] || product.colorVariants[0];
  }, [product, selectedColorIdx]);

  // Reset secondary selections on color changes
  React.useEffect(() => {
    if (activeVariant) {
      setSelectedSize(activeVariant.sizes[0] || "Standard");
      setSelectedWeight(activeVariant.weights[0] || "250g");
      setActiveImageIdx(0);
      setQty(1);
    }
  }, [selectedColorIdx, activeVariant]);

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-foreground">
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">The product you are looking for does not exist in our wholesale catalog.</p>
        <Link href="/products">
          <Button>Back to Products</Button>
        </Link>
      </div>
    );
  }

  const favorited = isInWishlist(product._id);
  const colorVariants = product.colorVariants || [];

  const handleAddToCart = () => {
    if (!activeVariant) return;
    
    addItem(
      product,
      {
        Color: activeVariant.color,
        Size: selectedSize,
        Weight: selectedWeight
      },
      qty
    );

    setAddedToCartToast(true);
    setTimeout(() => setAddedToCartToast(false), 2000);
  };

  const currentImages = activeVariant?.images || [];
  const mainImage = currentImages[activeImageIdx] || "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="container mx-auto px-4 py-8 text-foreground">
      {/* Toast Alert */}
      {addedToCartToast && (
        <div className="fixed bottom-5 right-5 bg-primary text-primary-foreground border border-primary/20 shadow-lg px-4 py-3 rounded-lg z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <Check className="h-4.5 w-4.5 text-success-foreground bg-success p-0.5 rounded-full" />
          <span className="text-sm font-bold">{qty} x Wholesale items added to cart!</span>
        </div>
      )}

      {/* Breadcrumb Header */}
      <div className="mb-6 flex justify-between items-center">
        <Link href="/products" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center font-medium">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Link>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => toggleWishlist(product)}
          className={favorited ? "text-destructive border-destructive bg-destructive/5 hover:bg-destructive/10" : ""}
        >
          <Heart className={`h-4 w-4 mr-2 ${favorited ? "fill-destructive" : ""}`} />
          {favorited ? "In Wishlist" : "Add to Wishlist"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Left: Interactive Image Slider */}
        <div className="space-y-4">
          <div className="aspect-square bg-card rounded-xl overflow-hidden border border-border shadow-sm flex items-center justify-center relative">
            <img
              src={mainImage}
              alt={product.title}
              className="w-full h-full object-cover hover:scale-102 transition-transform duration-300"
            />
            {activeVariant && activeVariant.discount > 0 && (
              <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-black px-2.5 py-1 rounded shadow">
                {activeVariant.discount}% OFF
              </span>
            )}
          </div>
          
          {/* Slider thumbnails list */}
          {currentImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pr-1">
              {currentImages.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImageIdx(i)}
                  className={`w-20 h-20 rounded-lg border-2 overflow-hidden flex-shrink-0 bg-secondary transition-all ${
                    activeImageIdx === i ? "border-primary scale-95 shadow-sm" : "border-border hover:border-primary/50"
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${i}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product specifications & options */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <Badge variant="secondary" className="font-semibold">B2B Cargo Line</Badge>
              {activeVariant && (
                <Badge variant="outline" className="border-primary text-primary font-mono text-[10px]">
                  SKU: {activeVariant.sku}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center text-yellow-500 font-medium">
                ★ {product.rating} <span className="text-muted-foreground ml-1 font-normal">({product.reviewCount} reviews)</span>
              </div>
              <span>|</span>
              <span>1000+ wholesale units dispatched</span>
            </div>
          </div>

          {/* Pricing & Stock Card */}
          {activeVariant && (
            <div className="p-6 bg-secondary/20 rounded-xl space-y-4 border border-border">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-primary">{formatPrice(activeVariant.price)}</span>
                {activeVariant.mrp > activeVariant.price && (
                  <span className="text-sm text-muted-foreground line-through font-medium">{formatPrice(activeVariant.mrp)}</span>
                )}
                <span className="text-xs text-muted-foreground font-semibold ml-2">+ 18% GST (Wholesale Claimable)</span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-1 border-t border-border/40 mt-2">
                {activeVariant.stock > 30 ? (
                  <Badge variant="success">In Stock ({activeVariant.stock} available)</Badge>
                ) : activeVariant.stock > 0 ? (
                  <Badge variant="warning">Low Stock ({activeVariant.stock} left)</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                <span className="text-muted-foreground font-medium">• MOQ: 5 units</span>
                <span className="text-muted-foreground font-medium">• Dimensions: {activeVariant.dimensions}</span>
              </div>
            </div>
          )}

          {/* Color Selection Swatches */}
          {colorVariants.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Select Color: 
                <span className="text-primary font-semibold ml-2">{activeVariant?.color}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map((v, idx) => {
                  const isSelected = selectedColorIdx === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" 
                          : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                      }`}
                    >
                      {v.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection Swatches */}
          {activeVariant && activeVariant.sizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Maximize2 className="h-4.5 w-4.5 text-muted-foreground" />
                Select Size: 
                <span className="text-primary font-semibold ml-2">{selectedSize}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeVariant.sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-bold" 
                          : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weight Selection Swatches */}
          {activeVariant && activeVariant.weights.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-4.5 w-4.5 text-muted-foreground" />
                Select Cargo Weight: 
                <span className="text-primary font-semibold ml-2">{selectedWeight}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeVariant.weights.map((weight) => {
                  const isSelected = selectedWeight === weight;
                  return (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-bold" 
                          : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                      }`}
                    >
                      {weight}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector & Action buttons */}
          {activeVariant && (
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t items-stretch">
              <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-secondary/10 justify-between px-3 w-full sm:w-32">
                <button
                  type="button"
                  onClick={() => setQty(prev => Math.max(1, prev - 1))}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="text-sm font-extrabold">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(prev => prev + 1)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <Button 
                size="lg" 
                className="flex-1 font-bold flex items-center justify-center gap-2 shadow" 
                onClick={handleAddToCart}
                disabled={activeVariant.stock <= 0}
              >
                <ShoppingCart className="h-5 w-5" /> Add Bulk Cargo
              </Button>
            </div>
          )}

          {/* Barcode encoding SKU */}
          {activeVariant && (
            <div className="flex flex-col gap-1.5 p-3 bg-white rounded-lg border border-border w-max pt-4">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground">Product Logistical SKU Barcode</span>
              <Barcode sku={activeVariant.sku} height={40} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 py-6 border-y">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Secure Payment</p>
                <p className="text-xs text-muted-foreground">100% encrypted</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-full text-primary">
                <Truck className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-sm">Fast Shipping</p>
                <p className="text-xs text-muted-foreground">Across India</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold">Product Description</h3>
            <div className="text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description }} />
          </div>
        </div>
      </div>

      {/* A+ Content Section */}
      {product.aPlusContent && product.aPlusContent.length > 0 && (
        <div className="mt-20 space-y-16 border-t pt-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight">From the Manufacturer</h2>
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
