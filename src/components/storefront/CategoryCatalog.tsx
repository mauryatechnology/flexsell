"use client";

import * as React from "react";
import Link from "next/link";
import { Product, Category } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { 
  ShoppingCart, 
  Heart, 
  ArrowLeft, 
  Info,
  Grid, 
  List, 
  SlidersHorizontal, 
  RotateCcw, 
  Minus, 
  Plus
} from "lucide-react";
import { useProductStore } from "@/stores/productStore";
import { useCategoryStore } from "@/stores/categoryStore";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";
import Image from "next/image";
import { Pagination } from "@/components/ui/Pagination";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";

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

  // Layout States
  const [sortBy, setSortBy] = React.useState("recommended");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = React.useState(1);
  const ITEMS_PER_PAGE = 12;

  // Filter States
  const [selectedSubcategories, setSelectedSubcategories] = React.useState<string[]>([]);
  const [minPrice, setMinPrice] = React.useState<number | "">("");
  const [maxPrice, setMaxPrice] = React.useState<number | "">("");
  const [inStockOnly, setInStockOnly] = React.useState(false);
  const [minDiscount, setMinDiscount] = React.useState<number>(0);
  const [showMobileFilters, setShowMobileFilters] = React.useState(false);

  // Bulk quantities select
  const [quantities, setQuantities] = React.useState<Record<string, number>>({});

  const getItemQty = (id: string) => quantities[id] || 1;
  const adjustItemQty = (id: string, amount: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + amount)
    }));
  };
  const setItemQty = (id: string, qty: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(1, qty)
    }));
  };

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

  // Find subcategories of the active category
  const subcategories = React.useMemo(() => {
    return activeCategories.filter(c => c.parentId === category._id);
  }, [activeCategories, category]);

  // Reset page index on state changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, selectedSubcategories, minPrice, maxPrice, inStockOnly, minDiscount]);

  const handleSubcategoryToggle = (catId: string) => {
    setSelectedSubcategories(prev => 
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const handleClearFilters = () => {
    setSelectedSubcategories([]);
    setMinPrice("");
    setMaxPrice("");
    setInStockOnly(false);
    setMinDiscount(0);
  };

  // Filter Logic
  const filteredProducts = React.useMemo(() => {
    // If specific subcategories are chosen, filter by them. Otherwise, default to this category + all its subcategories.
    let targetCategoryIds = [category._id];
    if (selectedSubcategories.length > 0) {
      targetCategoryIds = selectedSubcategories;
    } else {
      const childIds = subcategories.map(c => c._id);
      targetCategoryIds = [category._id, ...childIds];
    }

    let list = activeProducts.filter(p => targetCategoryIds.includes(p.categoryId));

    if (minPrice !== "") {
      list = list.filter(p => {
        const price = p.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
        return price >= Number(minPrice);
      });
    }
    if (maxPrice !== "") {
      list = list.filter(p => {
        const price = p.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
        return price <= Number(maxPrice);
      });
    }
    if (inStockOnly) {
      list = list.filter(p => p.totalStock > 0);
    }
    if (minDiscount > 0) {
      list = list.filter(p => {
        const discount = p.colorVariants?.[0]?.subVariants?.[0]?.discount ?? 0;
        return discount >= minDiscount;
      });
    }

    return list;
  }, [activeProducts, category, subcategories, selectedSubcategories, minPrice, maxPrice, inStockOnly, minDiscount]);

  // Sort products
  const sortedProducts = React.useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === "price-asc") {
      return list.sort((a, b) => {
        const priceA = a.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
        const priceB = b.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
        return priceA - priceB;
      });
    }
    if (sortBy === "price-desc") {
      return list.sort((a, b) => {
        const priceA = a.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
        const priceB = b.colorVariants?.[0]?.subVariants?.[0]?.price ?? 0;
        return priceB - priceA;
      });
    }
    if (sortBy === "newest") {
      return list.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
    }
    return list;
  }, [filteredProducts, sortBy]);

  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return sortedProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [sortedProducts, currentPage]);

  const handleAddToCart = (product: Product) => {
    const qty = getItemQty(product._id);
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
      qty
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 text-foreground">
      {/* Back Link */}
      <div className="mb-4">
        <Link href="/categories" className="text-sm text-muted-foreground hover:text-primary inline-flex items-center">
          <ArrowLeft className="mr-2 h-4 w-4" /> All Categories
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 border-b pb-6 border-border/60">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{category.name}</h1>
          <p className="text-muted-foreground mt-1">{category.description || `Browse B2B wholesale prices for ${category.name}`}</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Mobile Filter toggle */}
          {subcategories.length > 0 && (
            <Button 
              variant="outline" 
              className="lg:hidden flex-1 sm:flex-none flex items-center justify-center gap-2"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </Button>
          )}

          {/* Grid/List togglers */}
          <div className="hidden sm:flex border rounded-md p-0.5 bg-secondary/20">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded transition-colors ${viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded transition-colors ${viewMode === "list" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="border-input border rounded-md px-3 py-2 text-sm bg-background text-foreground flex-1 sm:flex-none h-10"
          >
            <option value="recommended">Sort by: Recommended</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest Arrivals</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Column: Sidebar Filters */}
        <div className={`w-full lg:w-64 flex-shrink-0 bg-card rounded-xl border border-border p-5 space-y-6 text-foreground h-fit lg:sticky lg:top-24 transition-all duration-300 ${
          showMobileFilters ? "block" : "hidden lg:block"
        }`}>
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-primary" /> Filter
            </h3>
            <button 
              onClick={handleClearFilters}
              className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 font-medium"
            >
              <RotateCcw className="h-3 w-3" /> Clear
            </button>
          </div>

          {/* Subcategories checklist */}
          {subcategories.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Subcategories</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {subcategories.map(cat => {
                  const checked = selectedSubcategories.includes(cat._id);
                  return (
                    <label key={cat._id} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => handleSubcategoryToggle(cat._id)}
                        className="rounded border-input text-primary focus:ring-primary w-4 h-4 bg-background"
                      />
                      <span className="truncate">{cat.name}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Price Range (₹)</h4>
            <div className="flex gap-2 items-center">
              <Input 
                type="number"
                placeholder="Min"
                className="h-8 text-xs text-center"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value === "" ? "" : Number(e.target.value))}
              />
              <span className="text-muted-foreground text-xs">—</span>
              <Input 
                type="number"
                placeholder="Max"
                className="h-8 text-xs text-center"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
          </div>

          {/* Stock toggle */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Availability</h4>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input 
                type="checkbox" 
                checked={inStockOnly} 
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary w-4 h-4 bg-background"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          {/* Discount levels */}
          <div className="space-y-3 pt-4 border-t">
            <h4 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider">Wholesale Discount</h4>
            <div className="space-y-2">
              {[0, 20, 40, 60].map((disc) => (
                <label key={disc} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary transition-colors">
                  <input 
                    type="radio" 
                    name="minDiscount"
                    checked={minDiscount === disc}
                    onChange={() => setMinDiscount(disc)}
                    className="text-primary focus:ring-primary w-4 h-4 bg-background"
                  />
                  <span>{disc === 0 ? "All Offers" : `${disc}% OFF & higher`}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Products Grid/List */}
        <div className="flex-1 w-full space-y-6">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <p>Showing {sortedProducts.length} cargo matches in category</p>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-xl border border-dashed flex flex-col items-center justify-center">
              <Info className="h-8 w-8 text-muted-foreground/60 mb-3 animate-pulse" />
              <p className="font-bold text-foreground text-base">No cargo lines found</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">Try adjusting price bounds, checking subcategories, or resetting active filters.</p>
              <Button size="sm" onClick={handleClearFilters} className="mt-4">Reset Filters</Button>
            </div>
          ) : viewMode === "grid" ? (
            /* Enhanced B2B Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => {
                const favorited = isInWishlist(product._id);
                const currentQty = getItemQty(product._id);
                const isBestseller = product.rating >= 4.6 || product.cardTags?.some(tag => tag.toLowerCase() === "bestseller");
                const isNew = product.cardTags?.some(tag => tag.toLowerCase() === "new" || tag.toLowerCase() === "new arrival");
                const isTrending = product.cardTags?.some(tag => tag.toLowerCase() === "trending" || tag.toLowerCase() === "hot");
                const defaultVariant = product.colorVariants?.[0];
                const defaultSub = defaultVariant?.subVariants?.[0];
                const firstImg = defaultVariant?.images?.[0];
                const imgUrl = firstImg ? (typeof firstImg === "string" ? firstImg : firstImg.url || "") : "";
                const price = defaultSub?.price ?? 0;
                const mrp = defaultSub?.mrp ?? 0;
                const discount = defaultSub?.discount ?? 0;
                const sku = defaultSub?.sku || "NO SKU";

                return (
                  <Card key={product._id} className="flex flex-col h-full bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 relative group border border-border">
                    <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                      {discount > 0 && (
                        <span className="bg-destructive text-destructive-foreground text-[10px] font-extrabold px-2 py-0.5 rounded shadow uppercase">
                          {discount}% OFF
                        </span>
                      )}
                      {isBestseller && (
                        <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow uppercase">
                          BEST SELLER
                        </span>
                      )}
                      {isNew && (
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow uppercase">
                          NEW
                        </span>
                      )}
                      {isTrending && (
                        <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow uppercase">
                          TRENDING
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive p-1.5 rounded-full shadow transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${favorited ? "fill-destructive text-destructive" : ""}`} />
                    </button>

                    <div className="aspect-square relative bg-secondary overflow-hidden rounded-t-lg border-b">
                      <Link href={`/products/${product.slug}`}>
                        <Image
                          src={imgUrl || "https://placehold.co/400x400/10b981/ffffff?text=Product"}
                          alt={product.title}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </Link>
                      <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1 rounded">
                        MOQ: {product.moq || 1} pcs
                      </div>
                    </div>

                    <CardContent className="p-4 flex flex-col flex-1 gap-3">
                      <div className="space-y-1">
                        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-bold text-sm line-clamp-2 text-foreground" title={product.title}>
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-[10px] font-mono text-muted-foreground">SKU: {sku}</p>
                        {/* Tiny Tag Pills */}
                        {product.cardTags && product.cardTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {product.cardTags.slice(0, 3).map((tag, tIdx) => (
                              <span key={tIdx} className="bg-secondary text-muted-foreground text-[8px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div>
                        {product.totalStock > 30 ? (
                          <span className="text-[11px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                            In Stock ({product.totalStock})
                          </span>
                        ) : product.totalStock > 0 ? (
                          <span className="text-[11px] font-semibold text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                            Low Stock ({product.totalStock})
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="pt-2 border-t mt-auto space-y-3">
                        <div>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-primary">{formatPrice(price)}</span>
                            {mrp > price && (
                              <span className="text-xs text-muted-foreground line-through">{formatPrice(mrp)}</span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground font-semibold">+ 18% GST (B2B Claimable)</span>
                        </div>

                        {/* Bulk quantity counters */}
                        <div className="flex items-center gap-1.5 border rounded-lg p-0.5 bg-secondary/10 w-full justify-between">
                          <button
                            type="button"
                            onClick={() => adjustItemQty(product._id, -1)}
                            className="p-1 rounded-md hover:bg-secondary transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <input
                            type="number"
                            value={currentQty}
                            onChange={(e) => setItemQty(product._id, Number(e.target.value))}
                            className="w-12 text-center text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-foreground"
                          />
                          <button
                            type="button"
                            onClick={() => adjustItemQty(product._id, 1)}
                            className="p-1 rounded-md hover:bg-secondary transition-colors"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <Button 
                          className="w-full flex items-center justify-center gap-2 font-bold shadow-sm" 
                          size="sm"
                          onClick={() => handleAddToCart(product)}
                          disabled={product.totalStock <= 0}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Enhanced B2B List View */
            <div className="space-y-4">
              {paginatedProducts.map((product) => {
                const favorited = isInWishlist(product._id);
                const currentQty = getItemQty(product._id);
                const defaultVariant = product.colorVariants?.[0];
                const defaultSub = defaultVariant?.subVariants?.[0];
                const firstImg = defaultVariant?.images?.[0];
                const imgUrl = firstImg ? (typeof firstImg === "string" ? firstImg : firstImg.url || "") : "";
                const price = defaultSub?.price ?? 0;
                const mrp = defaultSub?.mrp ?? 0;
                const discount = defaultSub?.discount ?? 0;
                const sku = defaultSub?.sku || "NO SKU";

                return (
                  <div key={product._id} className="flex flex-col sm:flex-row items-center border border-border rounded-xl p-4 gap-6 bg-card hover:shadow-md hover:border-primary/20 transition-all duration-300 relative group text-foreground animate-in fade-in">
                    <button 
                      onClick={() => toggleWishlist(product)}
                      className="absolute top-4 right-4 bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive p-1.5 rounded-full shadow transition-colors"
                    >
                      <Heart className={`h-4 w-4 ${favorited ? "fill-destructive text-destructive" : ""}`} />
                    </button>

                    <div className="w-24 h-24 rounded-lg bg-secondary border overflow-hidden flex-shrink-0 relative">
                      <Link href={`/products/${product.slug}`}>
                        <Image src={imgUrl || "https://placehold.co/400x400/10b981/ffffff?text=Product"} alt={product.title} fill sizes="96px" className="object-cover group-hover:scale-105 transition-transform duration-300" />
                      </Link>
                      {discount > 0 && (
                        <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground text-[8px] font-extrabold px-1 rounded shadow">
                          {discount}% OFF
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                      <div className="space-y-0.5">
                        <Link href={`/products/${product.slug}`} className="hover:text-primary transition-colors">
                          <h3 className="font-bold text-base line-clamp-1 text-foreground">{product.title}</h3>
                        </Link>
                        <p className="text-xs font-mono text-muted-foreground">SKU: {sku}</p>
                        {/* Tiny Tag Pills */}
                        {product.cardTags && product.cardTags.length > 0 && (
                          <div className="flex flex-wrap justify-center sm:justify-start gap-1 pt-1">
                            {product.cardTags.map((tag, tIdx) => (
                              <span key={tIdx} className="bg-secondary text-muted-foreground text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 justify-center sm:justify-start">
                        {product.totalStock > 30 ? (
                          <span className="text-[10px] font-semibold text-success bg-success/10 px-2 py-0.5 rounded">
                            In Stock ({product.totalStock} units)
                          </span>
                        ) : product.totalStock > 0 ? (
                          <span className="text-[10px] font-semibold text-yellow-600 dark:text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded">
                            Low Stock ({product.totalStock} left)
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                            Out of Stock
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">MOQ: {product.moq || 1} units</span>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-center sm:text-left flex-shrink-0">
                      <div className="flex items-baseline gap-1.5 justify-center sm:justify-start">
                        <span className="text-xl font-extrabold text-primary">{formatPrice(price)}</span>
                        {mrp > price && (
                          <span className="text-xs text-muted-foreground line-through">{formatPrice(mrp)}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 font-semibold">+ 18% GST (B2B Claimable)</p>
                    </div>

                    {/* Action Block */}
                    <div className="flex flex-col gap-2 w-full sm:w-48 flex-shrink-0">
                      <div className="flex items-center gap-1.5 border rounded-lg p-0.5 bg-secondary/10 w-full justify-between">
                        <button
                          type="button"
                          onClick={() => adjustItemQty(product._id, -1)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          value={currentQty}
                          onChange={(e) => setItemQty(product._id, Number(e.target.value))}
                          className="w-12 text-center text-xs font-bold bg-transparent border-none outline-none focus:ring-0 text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => adjustItemQty(product._id, 1)}
                          className="p-1 rounded hover:bg-secondary transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <Button 
                        className="w-full flex items-center justify-center gap-2 font-bold" 
                        size="sm"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.totalStock <= 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={sortedProducts.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        </div>
      </div>
    </div>
  );
}
