import { Coupon } from "@/types";
import { apiClient, isMockMode, delay } from "@/lib/apiClient";

const COUPONS_STORAGE_KEY = "flexsell-coupons-storage";

function getMockCoupons(): Coupon[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(COUPONS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Error parsing mock coupons", e);
    }
  }
  const defaultMock: Coupon[] = [
    {
      _id: "coup_1",
      code: "B2BINTRO",
      discountType: "percentage",
      discountValue: 10,
      minOrderValue: 2000,
      maxDiscount: 500,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      _id: "coup_2",
      code: "FLAT1000",
      discountType: "flat",
      discountValue: 1000,
      minOrderValue: 10000,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];
  saveMockCoupons(defaultMock);
  return defaultMock;
}

function saveMockCoupons(coupons: Coupon[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COUPONS_STORAGE_KEY, JSON.stringify(coupons));
}

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    if (isMockMode) {
      await delay();
      return getMockCoupons();
    }
    return apiClient.get<Coupon[]>("/coupons");
  },

  async createCoupon(data: Omit<Coupon, "_id" | "createdAt">): Promise<Coupon> {
    if (isMockMode) {
      await delay();
      const list = getMockCoupons();
      const newCoupon: Coupon = {
        ...data,
        _id: "coup_" + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString()
      };
      list.push(newCoupon);
      saveMockCoupons(list);
      return newCoupon;
    }
    return apiClient.post<Coupon>("/coupons", data);
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    if (isMockMode) {
      await delay();
      const list = getMockCoupons();
      let updated: Coupon | null = null;
      const updatedList = list.map(c => {
        if (c._id === id) {
          updated = { ...c, ...data };
          return updated;
        }
        return c;
      });
      if (!updated) throw new Error("Coupon not found");
      saveMockCoupons(updatedList);
      return updated;
    }
    return apiClient.put<Coupon>(`/coupons/${id}`, data);
  },

  async deleteCoupon(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const list = getMockCoupons();
      const filtered = list.filter(c => c._id !== id);
      saveMockCoupons(filtered);
      return;
    }
    return apiClient.delete<void>(`/coupons/${id}`);
  },

  async validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discountAmount: number; coupon?: Coupon; message?: string }> {
    if (isMockMode) {
      await delay();
      const list = getMockCoupons();
      const uppercase = code.toUpperCase().trim();
      const coupon = list.find(c => c.code === uppercase && c.isActive);
      
      if (!coupon) {
        return { valid: false, discountAmount: 0, message: "Invalid coupon code" };
      }

      const today = new Date().toISOString().split("T")[0];
      if (coupon.expiryDate < today) {
        return { valid: false, discountAmount: 0, message: "Coupon has expired" };
      }

      if (orderAmount < coupon.minOrderValue) {
        return { valid: false, discountAmount: 0, message: `Minimum order amount of ₹${coupon.minOrderValue} required` };
      }

      let discountAmount = 0;
      if (coupon.discountType === "flat") {
        discountAmount = coupon.discountValue;
      } else {
        discountAmount = (orderAmount * coupon.discountValue) / 100;
        if (coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, coupon.maxDiscount);
        }
      }

      return { valid: true, discountAmount: Math.round(discountAmount), coupon };
    }

    return apiClient.post<{ valid: boolean; discountAmount: number; coupon?: Coupon; message?: string }>("/coupons/validate", { code, orderAmount });
  }
};
