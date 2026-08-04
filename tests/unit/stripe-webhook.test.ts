import { describe, expect, it } from "vitest";
import { isProStatus } from "@/lib/stripe/client";
import { mapSubscriptionToPro } from "@/lib/stripe/webhook";

describe("stripe subscription status mapping", () => {
  it("treats active and trialing as Pro", () => {
    expect(isProStatus("active")).toBe(true);
    expect(isProStatus("trialing")).toBe(true);
    expect(mapSubscriptionToPro("active")).toBe(true);
    expect(mapSubscriptionToPro("trialing")).toBe(true);
  });

  it("treats non-active statuses as not Pro", () => {
    for (const status of ["past_due", "canceled", "unpaid", "incomplete", "incomplete_expired", "paused"]) {
      expect(isProStatus(status)).toBe(false);
      expect(mapSubscriptionToPro(status)).toBe(false);
    }
  });

  it("handles null and undefined", () => {
    expect(isProStatus(null)).toBe(false);
    expect(isProStatus(undefined)).toBe(false);
    expect(mapSubscriptionToPro(null)).toBe(false);
    expect(mapSubscriptionToPro(undefined)).toBe(false);
  });
});
