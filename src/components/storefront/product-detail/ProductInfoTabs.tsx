"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { useProductDetail } from "./ProductDetailContext";
import { sanitizeHtml } from "@/lib/sanitize";

export function ProductInfoTabs() {
  const {
    product,
    isDescExpanded,
    setIsDescExpanded
  } = useProductDetail();

  if (!product) return null;

  const visibility = product.fieldVisibility || {
    showDescription: true,
    showSizes: true,
    showWeights: true,
    showDimensions: true,
    showImages: true,
  };

  if (!visibility.showDescription || !product.description) {
    return null;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-bold">Product Description</h3>
      <div className="relative">
        <div
          className={`text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert transition-all duration-300 overflow-hidden ${
            isDescExpanded ? "max-h-full" : "max-h-[160px] line-clamp-6"
          }`}
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.description) }}
        />
        {!isDescExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>
      <Button
        variant="link"
        onClick={() => setIsDescExpanded(!isDescExpanded)}
        className="text-primary font-bold p-0 h-auto text-xs flex items-center cursor-pointer"
      >
        {isDescExpanded ? "Show Less" : "Read Full Description"}
      </Button>
    </div>
  );
}
