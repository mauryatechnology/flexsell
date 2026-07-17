import { describe, it, expect, vi } from "vitest";
import { GET } from "@/app/api/products/route";

vi.mock("@/lib/dbConnect", () => ({
  default: vi.fn().mockResolvedValue(true)
}));

vi.mock("@/models/Product", () => ({
  default: {
    find: vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnValue([
        { _id: "p1", title: "Test Product 1" },
        { _id: "p2", title: "Test Product 2" }
      ])
    })
  }
}));

describe("Products API Route", () => {
  it("should return list of products sorted by newest first", async () => {
    const request = new Request("http://localhost:3000/api/products");
    const response = await GET(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.length).toBe(2);
    expect(data[0].title).toBe("Test Product 1");
  });
});
