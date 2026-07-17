import { describe, it, expect, beforeEach, vi } from "vitest";

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

// Now import the service to test
import { couponService } from "@/services/couponService";

describe("CouponService", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should retrieve default coupons in mock mode", async () => {
    const coupons = await couponService.getCoupons();
    expect(coupons.length).toBeGreaterThan(0);
    expect(coupons[0].code).toBe("B2BINTRO");
  });

  it("should create a new coupon in mock mode", async () => {
    const newCouponData = {
      code: "TEST50",
      discountType: "percentage" as const,
      discountValue: 50,
      minOrderValue: 1000,
      maxDiscount: 500,
      expiryDate: "2030-12-31",
      isActive: true
    };

    const created = await couponService.createCoupon(newCouponData);
    expect(created._id).toBeDefined();
    expect(created.code).toBe("TEST50");

    const coupons = await couponService.getCoupons();
    expect(coupons.some(c => c.code === "TEST50")).toBe(true);
  });

  it("should validate a valid percentage coupon and compute discount", async () => {
    const validation = await couponService.validateCoupon("B2BINTRO", 3000);
    expect(validation.valid).toBe(true);
    expect(validation.discountAmount).toBe(300); // 10% of 3000
  });

  it("should cap percentage coupon discount at maxDiscount limit", async () => {
    const validation = await couponService.validateCoupon("B2BINTRO", 10000);
    expect(validation.valid).toBe(true);
    expect(validation.discountAmount).toBe(500); // Max discount is 500
  });

  it("should fail validation if order amount is below minOrderValue", async () => {
    const validation = await couponService.validateCoupon("B2BINTRO", 1500);
    expect(validation.valid).toBe(false);
    expect(validation.message).toContain("Minimum order amount of ₹2000 required");
  });

  it("should fail validation for non-existent coupon code", async () => {
    const validation = await couponService.validateCoupon("NOEXIST", 5000);
    expect(validation.valid).toBe(false);
    expect(validation.message).toBe("Invalid coupon code");
  });
});
