import { Coupon } from "@/types";
import { apiClient } from "@/lib/apiClient";

export const couponService = {
  async getCoupons(): Promise<Coupon[]> {
    return apiClient.get<Coupon[]>("/coupons");
  },

  async createCoupon(data: Omit<Coupon, "_id" | "createdAt">): Promise<Coupon> {
    return apiClient.post<Coupon>("/coupons", data);
  },

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<Coupon> {
    return apiClient.put<Coupon>(`/coupons/${id}`, data);
  },

  async deleteCoupon(id: string): Promise<void> {
    return apiClient.delete<void>(`/coupons/${id}`);
  },

  async validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discountAmount: number; coupon?: Coupon; message?: string }> {
    return apiClient.post<{ valid: boolean; discountAmount: number; coupon?: Coupon; message?: string }>("/coupons/validate", { code, orderAmount });
  }
};
