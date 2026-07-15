"use client";

import * as React from "react";
import Link from "next/link";
import { Product } from "@/types";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useProductStore } from "@/stores/productStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCartStore } from "@/stores/cartStore";
import { useToastStore } from "@/stores/toastStore";
import { 
  ShieldCheck, 
  Truck, 
  ArrowLeft, 
  Heart, 
  ShoppingCart, 
  Minus, 
  Plus, 
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
  const { addToast } = useToastStore();

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

  // Quantity input element ref for auto-focusing
  const qtyInputRef = React.useRef<HTMLInputElement>(null);

  // Derive active color line details
  const activeVariant = React.useMemo(() => {
    if (!product || !product.colorVariants) return null;
    return product.colorVariants[selectedColorIdx] || product.colorVariants[0];
  }, [product, selectedColorIdx]);

  // Derive active specific combination (subvariant)
  const activeSubVariant = React.useMemo(() => {
    if (!activeVariant || !activeVariant.subVariants) return null;
    return activeVariant.subVariants.find(sv => 
      (!selectedSize || sv.size === selectedSize) && 
      (!selectedWeight || sv.weight === selectedWeight)
    ) || activeVariant.subVariants[0];
  }, [activeVariant, selectedSize, selectedWeight]);

  // Derive unique sizes and weights for the current color variant
  const uniqueSizes = React.useMemo(() => {
    if (!activeVariant || !activeVariant.subVariants) return [];
    return Array.from(new Set(activeVariant.subVariants.map(sv => sv.size))).filter(Boolean);
  }, [activeVariant]);

  const uniqueWeights = React.useMemo(() => {
    if (!activeVariant || !activeVariant.subVariants) return [];
    return Array.from(new Set(activeVariant.subVariants.map(sv => sv.weight))).filter(Boolean);
  }, [activeVariant]);

  // Reset secondary selections on color changes
  React.useEffect(() => {
    if (uniqueSizes.length > 0) setSelectedSize(uniqueSizes[0]);
    if (uniqueWeights.length > 0) setSelectedWeight(uniqueWeights[0]);
    setActiveImageIdx(0);
    setQty(product?.moq || 5);
  }, [selectedColorIdx, activeVariant, product]);

  // Synchronize size and weight selection to ensure it corresponds to a valid sub-variant
  React.useEffect(() => {
    if (!activeVariant || !activeVariant.subVariants) return;
    
    // Check if the current size and weight combination is valid
    const isValidCombination = activeVariant.subVariants.some(sv => 
      sv.size === selectedSize && sv.weight === selectedWeight
    );
    
    if (!isValidCombination) {
      // Find the first sub-variant that matches either the selected size or selected weight
      const matchingSize = activeVariant.subVariants.find(sv => sv.size === selectedSize);
      if (matchingSize) {
        setSelectedWeight(matchingSize.weight);
      } else {
        const matchingWeight = activeVariant.subVariants.find(sv => sv.weight === selectedWeight);
        if (matchingWeight) {
          setSelectedSize(matchingWeight.size);
        } else if (activeVariant.subVariants.length > 0) {
          // Default fallback
          setSelectedSize(activeVariant.subVariants[0].size);
          setSelectedWeight(activeVariant.subVariants[0].weight);
        }
      }
    }
  }, [selectedSize, selectedWeight, activeVariant]);

  // Auto-focus quantity input on mount
  React.useEffect(() => {
    setTimeout(() => {
      qtyInputRef.current?.focus();
      qtyInputRef.current?.select();
    }, 300);
  }, [selectedColorIdx]);

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
  const moq = product.moq ?? 5;
  const visibility = product.fieldVisibility || {
    showDescription: true,
    showSizes: true,
    showWeights: true,
    showDimensions: true,
    showImages: true,
  };

  const handleAddToCart = () => {
    if (!activeVariant) return;

    if (qty < moq) {
      addToast(`Cannot add to cart. Minimum Order Quantity (MOQ) of ${moq} units is required.`, "warning");
      setQty(moq);
      qtyInputRef.current?.focus();
      return;
    }

    if (qty > (activeSubVariant?.stock || 0)) {
      addToast(`Cannot add to cart. Only ${activeSubVariant?.stock || 0} units are currently available.`, "warning");
      setQty(activeSubVariant?.stock || 0);
      qtyInputRef.current?.focus();
      return;
    }

    addItem(
      product,
      {
        Color: activeVariant.color,
        Size: selectedSize,
        Weight: selectedWeight
      },
      qty
    );

    // Auto focus and select input for next action
    qtyInputRef.current?.focus();
    qtyInputRef.current?.select();
  };

  // Indian standard GST breakdown
  const gstRate = product.gstRate ?? 18;
  const isIncl = product.priceIncludesGst ?? true;
  const price = activeSubVariant ? activeSubVariant.price : 0;
  const mrp = activeSubVariant ? activeSubVariant.mrp : 0;

  let basePrice = price;
  let taxAmount = 0;
  let totalPrice = price;

  if (isIncl) {
    basePrice = price / (1 + gstRate / 100);
    taxAmount = price - basePrice;
  } else {
    taxAmount = price * (gstRate / 100);
    totalPrice = price + taxAmount;
  }

  const cgstAmount = taxAmount / 2;
  const sgstAmount = taxAmount / 2;

  const currentImages = activeVariant?.images || [];
  const mainImage = currentImages[activeImageIdx] || "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?auto=format&fit=crop&w=600&q=80";

  return (
    <div className="container mx-auto px-4 py-8 text-foreground">
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
          {favorited ? "Saved in Wishlist" : "Save to Wishlist"}
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
            {activeSubVariant && activeSubVariant.discount > 0 && (
              <span className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-xs font-black px-2.5 py-1 rounded shadow animate-pulse">
                {activeSubVariant.discount}% DISCOUNT
              </span>
            )}
          </div>
          
          {/* Slider thumbnails list */}
          {visibility.showImages && currentImages.length > 1 && (
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
              <Badge variant="secondary" className="font-semibold">FACTORY DIRECT SUPPLY</Badge>
              {activeSubVariant && (
                <Badge variant="outline" className="border-primary text-primary font-mono text-[10px]">
                  SKU: {activeSubVariant.sku}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">{product.title}</h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center text-yellow-500 font-medium">
                ★ {product.rating} <span className="text-muted-foreground ml-1 font-normal">({product.reviewCount} reviews)</span>
              </div>
              <span>|</span>
              <span>100% Verified Wholesaler</span>
            </div>
          </div>

          {/* Pricing & GST Tax Breakdown Card */}
          {activeVariant && (
            <div className="p-6 bg-secondary/20 rounded-xl space-y-4 border border-border shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">{formatPrice(totalPrice)}</span>
                  {mrp > price && (
                    <span className="text-sm text-muted-foreground line-through font-medium">{formatPrice(mrp)}</span>
                  )}
                  <span className="text-xs text-muted-foreground font-bold">
                    {isIncl ? "(GST Inclusive)" : "(GST Exclusive)"}
                  </span>
                </div>
                
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs pt-3 border-t border-border/40">
                {(activeSubVariant?.stock || 0) > moq * 2 ? (
                  <Badge variant="success">In Stock ({activeSubVariant?.stock || 0} available)</Badge>
                ) : (activeSubVariant?.stock || 0) > 0 ? (
                  <Badge variant="warning">Low Stock ({activeSubVariant?.stock || 0} remaining)</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
                <span className="text-muted-foreground font-semibold">• Minimum Order: {moq} units</span>
                {visibility.showDimensions && activeVariant.dimensions && (
                  <span className="text-muted-foreground font-semibold">• Box Size: {activeVariant.dimensions}</span>
                )}
              </div>
            </div>
          )}

          {/* Color Selection Swatches */}
          {colorVariants.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider">
                Select Option / Color: 
                <span className="text-primary font-semibold ml-2">{activeVariant?.color}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {colorVariants.map((v, idx) => {
                  const isSelected = selectedColorIdx === idx;
                  const isOutOfStock = v.subVariants?.every(sv => sv.stock === 0);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedColorIdx(idx)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" 
                          : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                      } ${isOutOfStock ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      title={isOutOfStock ? "This option is currently out of stock" : ""}
                    >
                      {v.color}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Size Selection Swatches */}
          {visibility.showSizes && uniqueSizes.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Maximize2 className="h-4.5 w-4.5 text-muted-foreground" />
                Select Pack Sizing: 
                <span className="text-primary font-semibold ml-2">{selectedSize}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueSizes.map((size) => {
                  const isSelected = selectedSize === size;
                  const isOutOfStock = activeVariant?.subVariants
                    ?.filter(sv => sv.size === size)
                    .every(sv => sv.stock === 0);
                  
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all relative ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" 
                          : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                      } ${isOutOfStock ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      title={isOutOfStock ? "This pack size option is currently out of stock" : ""}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Weight Selection Swatches */}
          {visibility.showWeights && uniqueWeights.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="font-bold text-sm text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="h-4.5 w-4.5 text-muted-foreground" />
                Select Weight Unit: 
                <span className="text-primary font-semibold ml-2">{selectedWeight}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {uniqueWeights.map((weight) => {
                  const isSelected = selectedWeight === weight;
                  const isOutOfStock = activeVariant?.subVariants
                    ?.filter(sv => sv.weight === weight)
                    .every(sv => sv.stock === 0);

                  return (
                    <button
                      key={weight}
                      onClick={() => setSelectedWeight(weight)}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold transition-all relative ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-bold shadow-sm" 
                          : "border-border hover:border-primary/50 text-muted-foreground bg-card"
                      } ${isOutOfStock ? "opacity-40 line-through cursor-not-allowed" : ""}`}
                      title={isOutOfStock ? "This weight option is currently out of stock" : ""}
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
              <div className="flex items-center gap-2 border border-border rounded-lg p-1 bg-secondary/10 justify-between px-3 w-full sm:w-36">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setQty(prev => Math.max(moq, prev - 1))}
                  className="p-1 h-8 w-8 text-foreground"
                  disabled={qty <= moq}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                
                {/* Quantity Input Box */}
                <input
                  ref={qtyInputRef}
                  type="number"
                  className="w-12 text-center text-sm font-extrabold bg-transparent text-foreground focus:outline-none border-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={qty}
                  min={moq}
                  max={activeSubVariant?.stock || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val)) setQty(val);
                  }}
                  onBlur={() => {
                    if (qty < moq) setQty(moq);
                    if (qty > (activeSubVariant?.stock || 0)) setQty(activeSubVariant?.stock || 0);
                  }}
                />

                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setQty(prev => Math.min(activeSubVariant?.stock || 0, prev + 1))}
                  className="p-1 h-8 w-8 text-foreground"
                  disabled={qty >= (activeSubVariant?.stock || 0)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                size="lg" 
                className="flex-1 font-bold flex items-center justify-center gap-2 shadow" 
                onClick={handleAddToCart}
                disabled={(activeSubVariant?.stock || 0) <= 0}
              >
                <ShoppingCart className="h-5 w-5" /> Add to Cart
              </Button>
            </div>
          )}

          {/* End of action section */}

          {/* Product Description */}
          {visibility.showDescription && product.description && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold">Product Description</h3>
              <div className="text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: product.description }} />
            </div>
          )}
        </div>
      </div>

      {/* A+ Content Section */}
      {product.aPlusContent && product.aPlusContent.length > 0 && (
        <div className="mt-20 border-t pt-16">
          <div className="flex flex-col w-full max-w-[970px] mx-auto">
            {product.aPlusContent.map((block) => {
              // Only render blocks that actually contain an image, ignoring all text elements
              if (block.imageUrl) {
                return (
                  <img 
                    key={block.id}
                    src={block.imageUrl} 
                    alt="Manufacturer marketing graphic sheet" 
                    className="w-full h-auto block"
                  />
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
