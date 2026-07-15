import * as React from "react";
import { productService } from "@/services/productService";
import { ProductDetailView } from "@/components/storefront/ProductDetailView";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await productService.getProductBySlug(slug);
    const defaultVariant = product.colorVariants?.[0];
    const sku = defaultVariant?.subVariants?.[0]?.sku || "NO SKU";
    const imgUrl = defaultVariant?.images?.[0] || "";
    return {
      title: `${product.title} - Factory Wholesale Price`,
      description: `Buy ${product.title} at factory direct wholesale rates. SKU: ${sku}. ${product.description.slice(0, 150)}...`,
      openGraph: {
        title: `${product.title} | FlexSell Wholesale`,
        description: product.description,
        images: [{ url: imgUrl }]
      }
    };
  } catch (error) {
    return {
      title: "Product Not Found | FlexSell Wholesale"
    };
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const product = await productService.getProductBySlug(slug);
    const products = await productService.getProducts();

    // Prepare JSON-LD Product Schema data
    const prices = product.colorVariants?.flatMap(cv => cv.subVariants?.map(sv => sv.price) || []) || [0];
    const lowPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const highPrice = prices.length > 0 ? Math.max(...prices) : 0;
    const offerCount = product.colorVariants?.flatMap(cv => cv.subVariants || []).length || 1;

    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": product.title,
      "image": product.colorVariants?.[0]?.images || [],
      "description": product.description,
      "sku": product.colorVariants?.[0]?.subVariants?.[0]?.sku || "NO SKU",
      "mpn": product.colorVariants?.[0]?.subVariants?.[0]?.sku || "NO SKU",
      "brand": {
        "@type": "Brand",
        "name": "FlexSell Wholesale"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating || 4.5,
        "reviewCount": product.reviewCount || 10
      },
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "INR",
        "lowPrice": lowPrice,
        "highPrice": highPrice,
        "offerCount": offerCount,
        "priceIncludesGst": product.priceIncludesGst ?? true,
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "Organization",
          "name": "FlexSell Wholesale"
        }
      }
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ProductDetailView slug={slug} initialProducts={products} />
      </>
    );
  } catch (error) {
    return notFound();
  }
}
