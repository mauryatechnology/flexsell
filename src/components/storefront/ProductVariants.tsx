"use client";

import * as React from "react";
import { Product, ProductVariant } from "@/types";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart, Heart, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

interface ProductVariantsProps {
  product: Product;
}

export function ProductVariants({ product }: ProductVariantsProps) {
  // Group variants by name (e.g. "Color", "Size", "Weight")
  const variantGroups = React.useMemo(() => {
    const groups: Record<string, ProductVariant[]> = {};
    if (product.variants) {
      product.variants.forEach(v => {
        if (!groups[v.name]) {
          groups[v.name] = [];
        }
        groups[v.name].push(v);
      });
    }
    return groups;
  }, [product.variants]);

  // State to track selected value for each variant category
  const [selectedValues, setSelectedValues] = React.useState<Record<string, string>>(() => {
    const defaults: Record<string, string> = {};
    Object.entries(variantGroups).forEach(([category, options]) => {
      if (options.length > 0) {
        defaults[category] = options[0].value;
      }
    });
    return defaults;
  });

  const handleSelectOption = (category: string, value: string) => {
    setSelectedValues(prev => ({
      ...prev,
      [category]: value
    }));
  };

  // Calculate dynamic price based on all selected variants
  const calculatedOffset = React.useMemo(() => {
    let offset = 0;
    Object.entries(selectedValues).forEach(([category, value]) => {
      const option = variantGroups[category]?.find(opt => opt.value === value);
      if (option) {
        offset += option.priceOffset;
      }
    });
    return offset;
  }, [selectedValues, variantGroups]);

  // Determine stock based on selected options (using minimum stock of selected options as a safe B2B mock limit)
  const calculatedStock = React.useMemo(() => {
    let minStock = product.stock;
    Object.entries(selectedValues).forEach(([category, value]) => {
      const option = variantGroups[category]?.find(opt => opt.value === value);
      if (option && option.stock < minStock) {
        minStock = option.stock;
      }
    });
    return minStock;
  }, [selectedValues, variantGroups, product.stock]);

  const finalPrice = product.price + calculatedOffset;
  const finalMrp = product.mrp + calculatedOffset;
  const hasVariants = Object.keys(variantGroups).length > 0;

  return (
    <div className="space-y-6">
      {/* Dynamic Price Display */}
      <div className="p-6 bg-secondary/50 rounded-xl space-y-4 border">
        <PriceDisplay price={finalPrice} mrp={finalMrp} discount={product.discount} size="lg" />
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Prices are inclusive of all taxes. GST invoice available.</span>
          <span>•</span>
          {calculatedStock > 0 ? (
            <Badge variant="success">In Stock ({calculatedStock})</Badge>
          ) : (
            <Badge variant="destructive">Out of Stock</Badge>
          )}
        </div>
      </div>

      {/* Render each variant category group */}
      {hasVariants && (
        <div className="space-y-4 pt-2">
          {Object.entries(variantGroups).map(([category, options]) => (
            <div key={category} className="space-y-2">
              <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                Select {category}: 
                <span className="text-primary font-normal">{selectedValues[category]}</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => {
                  const isSelected = selectedValues[category] === option.value;
                  const isOutOfStock = option.stock <= 0;
                  return (
                    <button
                      key={option.id}
                      onClick={() => !isOutOfStock && handleSelectOption(category, option.value)}
                      className={`px-3 py-1.5 rounded-md border text-xs transition-all ${
                        isSelected 
                          ? "border-primary bg-primary/10 text-primary font-semibold" 
                          : "border-border hover:border-primary/50 text-muted-foreground"
                      } ${isOutOfStock ? "opacity-40 cursor-not-allowed bg-secondary/50" : ""}`}
                      disabled={isOutOfStock}
                    >
                      {option.value} 
                      {option.priceOffset > 0 && ` (+₹${option.priceOffset})`}
                      {isOutOfStock && " (OOS)"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 pt-2">
        <Button 
          size="lg" 
          className="flex-1" 
          disabled={calculatedStock <= 0}
        >
          <ShoppingCart className="mr-2 h-5 w-5" /> Add to Cart
        </Button>
        <Button 
          size="lg" 
          variant="secondary" 
          className="flex-1 bg-foreground text-background hover:bg-foreground/90" 
          disabled={calculatedStock <= 0}
        >
          Buy Now
        </Button>
        <Button size="lg" variant="outline" className="w-14 px-0">
          <Heart className="h-5 w-5" />
        </Button>
        <Button size="lg" variant="outline" className="w-14 px-0">
          <Share2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
