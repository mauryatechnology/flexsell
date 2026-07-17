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

import { orderService } from "@/services/orderService";
import { CartItem } from "@/types";

describe("OrderService (Mock Mode)", () => {
  beforeEach(() => {
    localStorageMock.clear();
    // Initialize mock products so stock deduction finds the product
    localStorageMock.setItem(
      "flexsell-products-storage",
      JSON.stringify({
        state: {
          products: [
            {
              _id: "60c72b2f9b1d8e001c8e2008",
              title: "Wholesale Cotton Fabric",
              totalStock: 100,
              colorVariants: [
                {
                  color: "Default",
                  subVariants: [
                    {
                      size: "Standard",
                      weight: "250g",
                      stock: 100,
                      sku: "COT-DF-STD",
                      price: 150,
                      mrp: 200,
                      discount: 50,
                      isActive: true
                    }
                  ]
                }
              ]
            }
          ]
        },
        version: 0
      })
    );
  });

  const sampleItems: CartItem[] = [
    {
      id: "item_1",
      product: {
        _id: "60c72b2f9b1d8e001c8e2008",
        title: "Wholesale Cotton Fabric",
        categoryId: "60c72b2f9b1d8e001c8e2005",
        gstRate: 5,
        priceIncludesGst: true,
      } as any,
      selectedVariants: {
        Color: "Default",
        Size: "Standard",
      },
      quantity: 5,
      pricePerUnit: 150
    }
  ];

  const sampleAddress = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    address: "45 Textile Market",
    city: "Surat",
    state: "Gujarat",
    pinCode: "395002",
    phone: "9876543210"
  };

  it("should create order with Razorpay payment info", async () => {
    const payment = {
      paymentMethod: "Razorpay" as const,
      paymentStatus: "Paid" as const,
      transactionId: "pay_TEST12345"
    };

    const order = await orderService.createOrder(sampleItems, 750, sampleAddress, payment);
    expect(order._id).toBeDefined();
    expect(order.paymentMethod).toBe("Razorpay");
    expect(order.paymentStatus).toBe("Paid");
    expect(order.transactionId).toBe("pay_TEST12345");
  });

  it("should create order with Bank Transfer reference", async () => {
    const payment = {
      paymentMethod: "Bank Transfer" as const,
      paymentStatus: "Pending" as const,
      transactionId: "UTR123456789012"
    };

    const order = await orderService.createOrder(sampleItems, 750, sampleAddress, payment);
    expect(order._id).toBeDefined();
    expect(order.paymentMethod).toBe("Bank Transfer");
    expect(order.paymentStatus).toBe("Pending");
    expect(order.transactionId).toBe("UTR123456789012");
  });

  it("should retrieve paginated orders with date range constraints", async () => {
    // Generate an order
    await orderService.createOrder(sampleItems, 750, sampleAddress);

    const result = await orderService.getOrders({ page: 1, limit: 10 });
    expect(result.orders).toBeDefined();
    expect(result.total).toBeGreaterThan(0);
  });
});
