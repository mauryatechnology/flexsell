import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage and window before importing the services
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => mockStorage[key] || null,
  setItem: (key: string, value: string) => { mockStorage[key] = value; },
  removeItem: (key: string) => { delete mockStorage[key]; },
  clear: () => {
    for (const key in mockStorage) {
      delete mockStorage[key];
    }
  },
};

global.window = {} as any;
global.localStorage = localStorageMock as any;

import { productService } from "@/services/productService";
import { Product } from "@/types";

const sampleProductData = {
  title: "Test Wholesale Product",
  slug: "test-wholesale-product",
  description: "Test description",
  categoryId: "cat_1",
  rating: 0,
  reviewCount: 0,
  tags: ["test"],
  isActive: true,
  totalStock: 100,
  hsnCode: "1234",
  gstRate: 18,
  priceIncludesGst: true,
  moq: 1,
  colorVariants: []
};

describe("ProductService (Mock Mode)", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should create a product successfully", async () => {
    const created = await productService.createProduct(sampleProductData);
    expect(created._id).toBeDefined();
    expect(created.title).toBe("Test Wholesale Product");

    const fetched = await productService.getProductById(created._id);
    expect(fetched.title).toBe("Test Wholesale Product");
  });

  it("should update a product successfully", async () => {
    const created = await productService.createProduct(sampleProductData);
    const updated = await productService.updateProduct(created._id, { title: "Updated Title" });
    
    expect(updated.title).toBe("Updated Title");

    const fetched = await productService.getProductBySlug(created.slug);
    expect(fetched.title).toBe("Updated Title");
  });

  it("should delete a product successfully", async () => {
    const created = await productService.createProduct(sampleProductData);
    
    // Delete product
    await productService.deleteProduct(created._id);

    await expect(productService.getProductById(created._id)).rejects.toThrow("Product not found");
  });

  it("should bulk delete products successfully", async () => {
    const p1 = await productService.createProduct({ ...sampleProductData, slug: "p1" });
    const p2 = await productService.createProduct({ ...sampleProductData, slug: "p2" });

    const beforeList = await productService.getProducts();
    expect(beforeList.length).toBeGreaterThanOrEqual(2);

    await productService.bulkDeleteProducts([p1._id, p2._id]);

    const afterList = await productService.getProducts();
    expect(afterList.some(p => p._id === p1._id || p._id === p2._id)).toBe(false);
  });
});
