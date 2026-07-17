import { apiClient, isMockMode, delay } from "@/lib/apiClient";
import { customerService } from "./customerService";
import { Review } from "@/types";

const REVIEWS_STORAGE_KEY = "flexsell-reviews-storage";

function getMockReviews(): Review[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(REVIEWS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Review[];
    } catch (e) {
      console.error("Error parsing mock reviews", e);
    }
  }
  const defaultMock: Review[] = [
    {
      _id: "rev_1",
      productId: "60c72b2f9b1d8e001c8e2008",
      customerId: "60c72b2f9b1d8e001c8e2001",
      customerName: "John Doe",
      rating: 5,
      title: "Excellent Wholesale Quality",
      comment: "The fabrics were packed neatly and delivered on time. High tensile strength and exactly as described in details.",
      status: "approved",
      adminResponse: "Thank you for choosing FlexSell! We value your feedback.",
      createdAt: new Date().toISOString()
    }
  ];
  saveMockReviews(defaultMock);
  return defaultMock;
}

function saveMockReviews(reviews: Review[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
}

export const reviewService = {
  async getProductReviews(productId: string): Promise<Review[]> {
    if (isMockMode) {
      await delay();
      return getMockReviews().filter(r => r.productId === productId && r.status === "approved");
    }
    return apiClient.get<Review[]>(`/reviews?productId=${productId}`);
  },

  async getCustomerReviews(): Promise<Review[]> {
    if (isMockMode) {
      await delay();
      try {
        const customer = await customerService.getActiveCustomer();
        return getMockReviews().filter(r => r.customerId === customer._id);
      } catch {
        return [];
      }
    }
    return apiClient.get<Review[]>("/reviews");
  },

  async submitReview(data: { productId: string; rating: number; title: string; comment: string }): Promise<Review> {
    if (isMockMode) {
      await delay();
      const list = getMockReviews();
      const newReview: Review = {
        _id: "rev_" + Math.random().toString(36).substring(2, 9),
        productId: data.productId,
        customerId: "60c72b2f9b1d8e001c8e2001",
        customerName: "John Doe",
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        status: "pending",
        createdAt: new Date().toISOString()
      };
      list.push(newReview);
      saveMockReviews(list);
      return newReview;
    }
    return apiClient.post<Review>("/reviews", data);
  },

  async deleteReview(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const list = getMockReviews();
      const filtered = list.filter(r => r._id !== id);
      saveMockReviews(filtered);
      return;
    }
    return apiClient.delete<void>(`/reviews?id=${id}`);
  },

  async getAllReviewsAdmin(): Promise<Review[]> {
    if (isMockMode) {
      await delay();
      return getMockReviews();
    }
    return apiClient.get<Review[]>("/admin/reviews");
  },

  async moderateReviewAdmin(id: string, status: "pending" | "approved" | "rejected", adminResponse?: string): Promise<Review> {
    if (isMockMode) {
      await delay();
      const list = getMockReviews();
      let updated: Review | null = null;
      const updatedList = list.map(r => {
        if (r._id === id) {
          updated = {
            ...r,
            status,
            adminResponse: adminResponse !== undefined ? adminResponse : r.adminResponse
          };
          return updated;
        }
        return r;
      });
      if (!updated) {
        throw new Error("Review not found");
      }
      saveMockReviews(updatedList);
      return updated;
    }
    return apiClient.put<Review>("/admin/reviews", { _id: id, status, adminResponse });
  },

  async deleteReviewAdmin(id: string): Promise<void> {
    if (isMockMode) {
      await delay();
      const list = getMockReviews();
      const filtered = list.filter(r => r._id !== id);
      saveMockReviews(filtered);
      return;
    }
    return apiClient.delete<void>(`/admin/reviews?id=${id}`);
  }
};
