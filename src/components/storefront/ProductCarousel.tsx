"use client";

import * as React from "react";
import { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: Product[];
}

export function ProductCarousel({ title, subtitle, products }: ProductCarouselProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  if (!products || products.length === 0) return null;

  const scroll = (direction: "left" | "right") => {
    if (containerRef.current) {
      const scrollAmount = 280;
      containerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="space-y-6 relative group">
      <div>
        <h3 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button
          onClick={() => scroll("left")}
          className="absolute -left-4 top-1/2 -translate-y-1/2 bg-background border border-border text-foreground p-2 rounded-full shadow hover:bg-secondary transition-all z-20 cursor-pointer opacity-0 group-hover:opacity-100"
          title="Scroll Left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => scroll("right")}
          className="absolute -right-4 top-1/2 -translate-y-1/2 bg-background border border-border text-foreground p-2 rounded-full shadow hover:bg-secondary transition-all z-20 cursor-pointer opacity-0 group-hover:opacity-100"
          title="Scroll Right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Scroll Container */}
        <div
          ref={containerRef}
          className="flex gap-6 overflow-x-auto py-2 px-1 snap-x scroll-smooth"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((prod) => (
            <div key={prod._id} className="w-[240px] flex-shrink-0 snap-start">
              <ProductCard product={prod} layout="grid" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
