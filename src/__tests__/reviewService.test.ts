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

// Mock active customer retrieval
vi.mock("@/services/customerService", () => ({
  customerService: {
    getActiveCustomer: vi.fn().mockResolvedValue({
      _id: "60c72b2f9b1d8e001c8e2001",
      name: "John Doe",
      email: "john@example.com"
    })
  }
}));

import { reviewService } from "@/services/reviewService";

describe("ReviewService (Mock Mode)", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("should retrieve product reviews", async () => {
    // Should return only approved reviews for matching product
    const reviews = await reviewService.getProductReviews("60c72b2f9b1d8e001c8e2008");
    expect(reviews.length).toBe(1);
    expect(reviews[0]._id).toBe("rev_1");
    expect(reviews[0].status).toBe("approved");
  });

  it("should submit a pending review successfully", async () => {
    const data = {
      productId: "prod_1",
      rating: 4,
      title: "Good Sourcing",
      comment: "Satisfactory wholesale product quality."
    };

    const created = await reviewService.submitReview(data);
    expect(created._id).toBeDefined();
    expect(created.status).toBe("pending");
    expect(created.rating).toBe(4);

    const adminReviews = await reviewService.getAllReviewsAdmin();
    expect(adminReviews.some(r => r._id === created._id)).toBe(true);
  });

  it("should moderate a review (approve and add admin response)", async () => {
    const list = await reviewService.getAllReviewsAdmin();
    const target = list[0];

    const moderated = await reviewService.moderateReviewAdmin(target._id, "approved", "Glad you liked it!");
    expect(moderated.status).toBe("approved");
    expect(moderated.adminResponse).toBe("Glad you liked it!");

    const activeList = await reviewService.getAllReviewsAdmin();
    const updated = activeList.find(r => r._id === target._id);
    expect(updated?.adminResponse).toBe("Glad you liked it!");
  });

  it("should delete a review successfully", async () => {
    const list = await reviewService.getAllReviewsAdmin();
    const target = list[0];

    await reviewService.deleteReview(target._id);

    const activeList = await reviewService.getAllReviewsAdmin();
    expect(activeList.some(r => r._id === target._id)).toBe(false);
  });
});
