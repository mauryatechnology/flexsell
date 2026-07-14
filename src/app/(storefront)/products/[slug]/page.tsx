import * as React from "react";
import { products } from "@/data/products";
import { ProductDetailView } from "@/components/storefront/ProductDetailView";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) return {};
  const defaultVariant = product.colorVariants?.[0];
  const sku = defaultVariant?.sku || "NO SKU";
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
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <ProductDetailView slug={slug} initialProducts={products} />;
}
