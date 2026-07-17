import Image from "next/image";
import Link from "next/link";
import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";
import { pagesContent } from "@/config/pagesContent";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShieldCheck, BadgePercent, Truck } from "lucide-react";
import dbConnect from "@/lib/dbConnect";
import CmsContent from "@/models/CmsContent";

import { TrendingProducts } from "@/components/storefront/TrendingProducts";
import { HeroCarousel } from "@/components/storefront/HeroCarousel";

export const revalidate = 3600; // ISR revalidation every hour

export default async function HomePage() {
  await dbConnect();

  // Fetch CMS sections
  const cmsHeroSlides = await CmsContent.findOne({ key: "hero_slides" });
  const cmsWhyChooseUs = await CmsContent.findOne({ key: "why_choose_us" });

  const homeData = pagesContent.homepage;
  const categories = await categoryService.getCategories();
  const products = await productService.getProducts();

  // Hero carousel slides dynamic or fallback
  const heroSlides = cmsHeroSlides?.value || [
    {
      title: homeData.heroTitlePrefix,
      highlight: homeData.heroTitleHighlight,
      subtitle: homeData.heroSubtitle,
      buttonText: homeData.heroButtonText,
      buttonLink: "/products",
      imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80"
    }
  ];

  // Why choose us items dynamic or fallback
  const whyChooseUsItems = cmsWhyChooseUs?.value || pagesContent.about.whyChooseUsItems.map((item, idx) => ({
    ...item,
    icon: idx === 0 ? "price" : idx === 1 ? "quality" : "shipping"
  }));

  // Map icon strings to lucide elements
  const getWhyIcon = (iconName: string) => {
    switch (iconName) {
      case "price":
        return <BadgePercent className="h-8 w-8 text-primary" />;
      case "quality":
        return <ShieldCheck className="h-8 w-8 text-primary" />;
      case "shipping":
        return <Truck className="h-8 w-8 text-primary" />;
      default:
        return <ShieldCheck className="h-8 w-8 text-primary" />;
    }
  };

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Dynamic Hero Carousel */}
      <HeroCarousel slides={heroSlides} />

      {/* Categories Grid Section with Navbar Match Padding */}
      <section className="mx-auto max-w-8xl px-4 md:px-6 w-full">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-border/60">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {homeData.categoriesHeading}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Sourced direct from global factory lines.</p>
          </div>
          <Link href="/categories" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            View All Categories &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.filter(c => !c.parentId).slice(0, 6).map((category) => (
            <Link key={category._id} href={`/categories/${category.slug}`}>
              <Card className="hover:border-primary/50 transition-all hover:shadow-md cursor-pointer text-center overflow-hidden h-full flex flex-col group bg-card border-border">
                <div className="aspect-square relative bg-secondary overflow-hidden">
                  <Image
                    src={category.image || `https://placehold.co/400x400/10b981/ffffff?text=${encodeURIComponent(category.name)}`}
                    alt={category.name}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3 mt-auto bg-card border-t border-border">
                  <p className="text-xs font-bold text-foreground line-clamp-2">{category.name}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary/15 py-16">
        <div className="mx-auto max-w-8xl px-4 md:px-6 w-full">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {pagesContent.about.whyChooseUsTitle}
            </h2>
            <p className="text-sm text-muted-foreground mt-2">Connecting global manufacturers directly to retail sellers.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyChooseUsItems.map((item: any, idx: number) => (
              <Card key={idx} className="bg-card border-border p-6 space-y-4 hover:shadow-md transition-shadow">
                <div className="p-3 bg-primary/10 rounded-full w-max">
                  {getWhyIcon(item.icon)}
                </div>
                <h3 className="font-bold text-lg text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Trending Products Grid Section */}
      <section className="mx-auto max-w-8xl px-4 md:px-6 w-full">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-border/60">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              {homeData.trendingHeading}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">Our fastest selling consumer products and gadgets.</p>
          </div>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
            {homeData.viewAllText} &rarr;
          </Link>
        </div>

        <TrendingProducts initialProducts={products} />
      </section>
    </div>
  );
}
