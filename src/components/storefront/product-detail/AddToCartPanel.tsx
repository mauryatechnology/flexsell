"use client";

import * as React from "react";
import { Badge } from "@/components/ui/Badge";
import { useProductDetail } from "./ProductDetailContext";
import { Star } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export function AddToCartPanel() {
  const {
    product,
    activeVariant,
    activeSubVariant
  } = useProductDetail();

  if (!product) return null;

  const moq = product.moq ?? 1;
  const visibility = product.fieldVisibility || {
    showDescription: true,
    showSizes: true,
    showWeights: true,
    showDimensions: true,
    showImages: true,
  };

  const gstRate = product.gstRate ?? 18;
  const isIncl = product.priceIncludesGst ?? true;
  const price = activeSubVariant ? activeSubVariant.price : 0;
  const mrp = activeSubVariant ? activeSubVariant.mrp : 0;

  let taxAmount = 0;
  let totalPrice = price;

  if (isIncl) {
    taxAmount = price - (price / (1 + gstRate / 100));
  } else {
    taxAmount = price * (gstRate / 100);
    totalPrice = price + taxAmount;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap mb-2">
          <Badge variant="secondary" className="font-semibold">FACTORY DIRECT SUPPLY</Badge>
          {activeSubVariant && (
            <Badge variant="outline" className="border-primary text-primary font-mono text-[10px]">
              SKU: {activeSubVariant.sku}
            </Badge>
          )}
        </div>
        <h1 className="text-3xl font-black tracking-tight">{product.title}</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Star className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
            <span className="text-sm font-black">{product.rating || "0.0"}</span>
            <span className="text-xs text-muted-foreground">({product.reviewCount || "0"} verified reviews)</span>
          </div>
        </div>
      </div>

      {activeSubVariant && (
        <div className="p-4 bg-secondary/15 rounded-xl border border-border/40 space-y-3">
          <div className="flex items-baseline justify-between">
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
            {visibility.showDimensions && activeVariant?.dimensions && (
              <span className="text-muted-foreground font-semibold">• Box Size: {activeVariant.dimensions}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
