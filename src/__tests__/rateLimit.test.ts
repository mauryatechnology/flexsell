import { describe, it, expect, vi, beforeEach } from "vitest";
import { rateLimit } from "@/lib/rateLimit";

describe("Rate Limiter Utility", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("should allow requests under the limit", () => {
    const ip = "192.168.1.1";
    
    // First 4 requests should be allowed
    for (let i = 1; i <= 4; i++) {
      const res = rateLimit(ip, 5, 60000);
      expect(res.allowed).toBe(true);
      expect(res.remaining).toBe(5 - i);
    }
  });

  it("should block requests when exceeding limit and reset after window", () => {
    const ip = "192.168.1.2";

    // 5 requests allowed
    for (let i = 0; i < 5; i++) {
      rateLimit(ip, 5, 60000);
    }

    // 6th request should be blocked
    const blockedRes = rateLimit(ip, 5, 60000);
    expect(blockedRes.allowed).toBe(false);
    expect(blockedRes.remaining).toBe(0);

    // Advance time by 61 seconds (beyond windowMs)
    vi.advanceTimersByTime(61000);

    // Request should be allowed again
    const allowedRes = rateLimit(ip, 5, 60000);
    expect(allowedRes.allowed).toBe(true);
    expect(allowedRes.remaining).toBe(4);
  });
});
