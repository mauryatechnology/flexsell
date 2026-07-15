import { Product } from "@/types";
import { products as staticProducts } from "@/data/products";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

const MOCK_STORAGE_KEY = "flexsell-products-storage";

function getMockProducts(): Product[] {
  if (typeof window === "undefined") return staticProducts;
  const stored = localStorage.getItem(MOCK_STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed?.state?.products) {
        return parsed.state.products;
      }
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      console.error("Error parsing mock products", e);
    }
  }
  saveMockProducts(staticProducts);
  return staticProducts;
}

function saveMockProducts(products: Product[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    MOCK_STORAGE_KEY,
    JSON.stringify({
      state: { products },
      version: 0,
    })
  );
}

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (isMockMode) {
      await delay();
      return getMockProducts();
    }
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
    if (isMockMode) {
      await delay();
      const products = getMockProducts();
      const product = products.find((p) => p._id === id);
      if (!product) throw new Error("Product not found");
      return product;
    }
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
    if (isMockMode) {
      await delay();
      const products = getMockProducts();
      const product = products.find((p) => p.slug === slug);
      if (!product) throw new Error("Product not found");
      return product;
    }
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
    if (isMockMode) {
      await delay();
      const products = getMockProducts();
      const randomObjectId = Array.from({ length: 24 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join("");
      const newProduct: Product = {
        ...productData,
        _id: randomObjectId,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      saveMockProducts([newProduct, ...products]);
      return newProduct;
    }
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
    if (isMockMode) {
      await delay();
      const products = getMockProducts();
      let updatedProduct: Product | null = null;
      
      const newProducts = products.map((p) => {
        if (p._id === id) {
          updatedProduct = { ...p, ...updatedFields };
          return updatedProduct;
        }
        return p;
      });

      if (!updatedProduct) throw new Error("Product not found");
      saveMockProducts(newProducts);
      return updatedProduct;
    }
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
    if (isMockMode) {
      await delay();
      const products = getMockProducts();
      const newProducts = products.filter((p) => p._id !== id);
      saveMockProducts(newProducts);
      return;
    }
    if (typeof window === "undefined") {
      const dbConnect = (await import("@/lib/dbConnect")).default;
      await dbConnect();
      const ProductModel = (await import("@/models/Product")).default;
      await ProductModel.findByIdAndDelete(id);
      return;
    }
    return apiClient.delete<void>(`/products/${id}`);
  },
};
