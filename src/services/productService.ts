import { Product } from "@/types";
import { apiClient } from "@/lib/apiClient";

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      const products = await ProductModel.find({}).sort({ createdAt: -1 }).lean();
      return JSON.parse(JSON.stringify(products));
    }
    
    return apiClient.get<Product[]>("/products");
  },

  async getProductById(id: string): Promise<Product> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      const product = await ProductModel.findById(id).lean();
      if (!product) throw new Error("Product not found");
      return JSON.parse(JSON.stringify(product));
    }
    return apiClient.get<Product>(`/products/${id}`);
  },

  async getProductBySlug(slug: string): Promise<Product> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      const product = await ProductModel.findOne({ slug }).lean();
      if (!product) throw new Error("Product not found");
      return JSON.parse(JSON.stringify(product));
    }
    return apiClient.get<Product>(`/products/slug/${slug}`);
  },

  async createProduct(
    productData: Omit<Product, "_id" | "createdAt">
  ): Promise<Product> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      const randomObjectId = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const product = await ProductModel.create({
        ...productData,
        _id: randomObjectId,
        isActive: true
      });
      return JSON.parse(JSON.stringify(product));
    }
    return apiClient.post<Product>("/products", productData);
  },

  async updateProduct(
    id: string,
    updatedFields: Partial<Product>
  ): Promise<Product> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      const product = await ProductModel.findByIdAndUpdate(
        id,
        { $set: updatedFields },
        { new: true }
      ).lean();
      if (!product) throw new Error("Product not found");
      return JSON.parse(JSON.stringify(product));
    }
    return apiClient.put<Product>(`/products/${id}`, updatedFields);
  },

  async deleteProduct(id: string): Promise<void> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      await ProductModel.findByIdAndDelete(id);
      return;
    }
    return apiClient.delete<void>(`/products/${id}`);
  },

  async bulkDeleteProducts(ids: string[]): Promise<void> {
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      await ProductModel.deleteMany({ _id: { $in: ids } });
      return;
    }
    return apiClient.delete<void>("/products/bulk", {
      body: JSON.stringify({ ids }),
      headers: { "Content-Type": "application/json" }
    });
  },
};
