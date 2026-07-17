import { apiClient } from "@/lib/apiClient";
import { Review } from "@/types";

export const reviewService = {
  async getProductReviews(productId: string): Promise<Review[]> {
    return apiClient.get<Review[]>(`/reviews?productId=${productId}`);
  },

  async getCustomerReviews(): Promise<Review[]> {
    return apiClient.get<Review[]>("/reviews");
  },

  async submitReview(data: { productId: string; rating: number; title: string; comment: string }): Promise<Review> {
    return apiClient.post<Review>("/reviews", data);
  },

  async deleteReview(id: string): Promise<void> {
    return apiClient.delete<void>(`/reviews?id=${id}`);
  },

  async getAllReviewsAdmin(): Promise<Review[]> {
    return apiClient.get<Review[]>("/admin/reviews");
  },

  async moderateReviewAdmin(id: string, status: "pending" | "approved" | "rejected", adminResponse?: string): Promise<Review> {
    return apiClient.put<Review>("/admin/reviews", { _id: id, status, adminResponse });
  },

  async deleteReviewAdmin(id: string): Promise<void> {
    return apiClient.delete<void>(`/admin/reviews?id=${id}`);
  }
};
