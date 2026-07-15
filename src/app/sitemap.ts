import { MetadataRoute } from "next";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://flexsellwholesale.in";

  // Static routes
  const staticRoutes = [
    "",
    "/about",
    "/contact",
    "/faq",
    "/dropshipping",
    "/blogs",
    "/policies/shipping-policy",
    "/policies/privacy-policy",
    "/policies/terms-of-service",
    "/policies/return-policy",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1.0 : 0.8,
  }));

  try {
    // Dynamic products routes
    const products = await productService.getProducts();
    const productRoutes = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt ? new Date(product.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Dynamic categories routes
    const categories = await categoryService.getCategories();
    const categoryRoutes = categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: category.updatedAt ? new Date(category.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

    return [...staticRoutes, ...productRoutes, ...categoryRoutes];
  } catch (error) {
    console.error("Sitemap generation error, falling back to static routes:", error);
    return staticRoutes;
  }
}
