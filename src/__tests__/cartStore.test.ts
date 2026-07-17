import { describe, it, expect, beforeEach } from "vitest";

// Mock localStorage and window before importing the stores
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

// Import store
import { useCartStore } from "@/stores/cartStore";
import { Product } from "@/types";

const mockProduct: Product = {
  _id: "prod_mock_1",
  title: "Mock B2B Sourced Item",
  slug: "mock-b2b-sourced-item",
  description: "High quality sourcing product",
  categoryId: "cat_1",
  rating: 4.5,
  reviewCount: 12,
  tags: ["sourcing", "bulk"],
  isActive: true,
  totalStock: 500,
  hsnCode: "3924",
  gstRate: 18,
  priceIncludesGst: true,
  moq: 5,
  colorVariants: [
    {
      color: "Blue",
      dimensions: "10x10x10",
      images: ["img_url_1"],
      subVariants: [
        {
          id: "sub_1",
          size: "Standard",
          weight: "250g",
          price: 200,
          mrp: 300,
          discount: 33,
          stock: 250,
          sku: "MSK-BLUE-STD",
        }
      ]
    }
  ]
};

describe("CartStore", () => {
  beforeEach(() => {
    localStorageMock.clear();
    useCartStore.getState().clearCart();
  });

  it("should initialize with an empty cart", () => {
    const state = useCartStore.getState();
    expect(state.items.length).toBe(0);
  });

  it("should add item to cart and calculate correct quantity", () => {
    const store = useCartStore.getState();
    
    store.addItem(mockProduct, { Color: "Blue", Size: "Standard", Weight: "250g" }, 10);
    
    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].quantity).toBe(10);
    expect(updatedState.items[0].pricePerUnit).toBe(200);
  });

  it("should increase quantity if adding the same item with identical variants", () => {
    const store = useCartStore.getState();
    
    store.addItem(mockProduct, { Color: "Blue", Size: "Standard", Weight: "250g" }, 5);
    store.addItem(mockProduct, { Color: "Blue", Size: "Standard", Weight: "250g" }, 5);
    
    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(1);
    expect(updatedState.items[0].quantity).toBe(10);
  });

  it("should create separate cart items for different variant configurations", () => {
    const store = useCartStore.getState();
    
    store.addItem(mockProduct, { Color: "Blue", Size: "Standard", Weight: "250g" }, 5);
    store.addItem(mockProduct, { Color: "Red", Size: "Standard", Weight: "250g" }, 5);
    
    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(2);
  });

  it("should update item quantity correctly", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, { Color: "Blue", Size: "Standard", Weight: "250g" }, 5);
    
    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().updateQuantity(itemId, 15);
    
    const updatedState = useCartStore.getState();
    expect(updatedState.items[0].quantity).toBe(15);
  });

  it("should remove item from cart", () => {
    const store = useCartStore.getState();
    store.addItem(mockProduct, { Color: "Blue", Size: "Standard", Weight: "250g" }, 5);
    
    const itemId = useCartStore.getState().items[0].id;
    useCartStore.getState().removeItem(itemId);
    
    const updatedState = useCartStore.getState();
    expect(updatedState.items.length).toBe(0);
  });
});
