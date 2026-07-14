import Image from "next/image";
import Link from "next/link";
import { categories } from "@/data/categories";
import { products } from "@/data/products";
import { pagesContent } from "@/data/pagesContent";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { ShoppingCart } from "lucide-react";

import { TrendingProducts } from "@/components/storefront/TrendingProducts";

export default function HomePage() {
  const homeData = pagesContent.homepage;
  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* Hero Banner (Placeholder for Carousel) */}
      <section className="w-full h-[300px] md:h-[450px] bg-secondary relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent z-0" />
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-xl space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {homeData.heroTitlePrefix} <span className="text-primary">{homeData.heroTitleHighlight}</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {homeData.heroSubtitle}
            </p>
            <Button size="lg" className="mt-4">
              {homeData.heroButtonText}
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-foreground">{homeData.categoriesHeading}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.filter(c => !c.parentId).map((category) => (
            <Link key={category._id} href={`/categories/${category.slug}`}>
              <Card className="hover:border-primary transition-colors cursor-pointer text-center overflow-hidden h-full flex flex-col">
                <div className="aspect-square relative bg-secondary">
                  {/* Using standard img for placeholder since domains aren't configured for next/image */}
                  <img
                    src={category.image || `https://placehold.co/400x400/10b981/ffffff?text=${encodeURIComponent(category.name)}`}
                    alt={category.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="p-3 mt-auto">
                  <p className="text-xs font-medium line-clamp-2">{category.name}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products */}
      <section className="container mx-auto px-4">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold text-foreground">{homeData.trendingHeading}</h2>
          <Link href="/products" className="text-sm font-medium text-primary hover:underline">
            {homeData.viewAllText} &rarr;
          </Link>
        </div>
        
        <TrendingProducts initialProducts={products} />
      </section>
    </div>
  );
}
