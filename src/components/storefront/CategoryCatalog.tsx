"use client";

import * as React from "react";
import Link from "next/link";
import { Product, Category } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart, Heart, ArrowLeft, Info } from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import { notFound } from "next/navigation";

interface CategoryCatalogProps {
  slug: string;
  initialProducts: Product[];
  initialCategories: Category[];
}

export function CategoryCatalog({ slug, initialProducts, initialCategories }: CategoryCatalogProps) {
  const { products, initializeProducts } = useProductStore();
  const { categories, initializeCategories } = useCategoryStore();
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [sortBy, setSortBy] = React.useState("recommended");

  React.useEffect(() => {
    initializeProducts(initialProducts);
    initializeCategories(initialCategories);
  }, [initialProducts, initialCategories, initializeProducts, initializeCategories]);

  const activeProducts = products.length > 0 ? products : initialProducts;
  const activeCategories = categories.length > 0 ? categories : initialCategories;

  const category = activeCategories.find((c) => c.slug === slug);

  if (!category) {
    return notFound();
  }

  // Filter products by this category or its subcategories
  const childCategoryIds = activeCategories
    .filter(c => c.parentId === category._id)
    .map(c => c._id);
  const targetCategoryIds = [category._id, ...childCategoryIds];

  const categoryProducts = activeProducts.filter(p => targetCategoryIds.includes(p.categoryId));

  // Sort products
  const sortedProducts = React.useMemo(() => {
    const list = [...categoryProducts];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => a.price - b.price);
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => b.price - a.price);
    }
    if (sortBy === "newest") {
      return list.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
    }
    return list;
  }, [categoryProducts, sortBy]);

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
      <div className="mb-4">
        <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> All Categories
        </Link>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1">{category.description || `Browse B2B wholesale prices for ${category.name}`}</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border-input border rounded-md px-3 py-2 text-sm bg-background text-foreground"
          >
            <option value="recommended">Sort by: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      {sortedProducts.length === 0 ? (
        <div className="text-center py-16 bg-secondary/10 rounded-xl border flex flex-col items-center">
          <Info className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No products available in this category currently.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sortedProducts.map((product) => {
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
