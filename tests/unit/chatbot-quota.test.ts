import { describe, expect, it } from "vitest";
import { windowQuota } from "@/lib/chatbot/quota";
import { makeGuestCookie, parseGuestCookie } from "@/lib/chatbot/guest";

describe("chatbot quota — window logic", () => {
  it("allows up to the limit", () => {
    expect(windowQuota(0, 10)).toEqual({ allowed: true, remaining: 10 });
    expect(windowQuota(9, 10)).toEqual({ allowed: true, remaining: 1 });
  });

  it("blocks at the limit", () => {
    expect(windowQuota(10, 10)).toEqual({ allowed: false, remaining: 0 });
    expect(windowQuota(11, 10)).toEqual({ allowed: false, remaining: 0 });
  });

  it("handles the anonymous limit of 2", () => {
    expect(windowQuota(1, 2).allowed).toBe(true);
    expect(windowQuota(2, 2).allowed).toBe(false);
  });

  it("clamps remaining to zero", () => {
    expect(windowQuota(15, 10).remaining).toBe(0);
  });
});

describe("chatbot guest cookie", () => {
  it("rejects tampered signatures", () => {
    const value = "abc123.deadbeef";
    expect(parseGuestCookie(value)).toBeNull();
  });

  it("round-trips a valid cookie", () => {
    const cookie = makeGuestCookie("guest-123");
    expect(parseGuestCookie(cookie)).toBe("guest-123");
  });

  it("rejects a cookie with a modified id", () => {
    const cookie = makeGuestCookie("guest-123");
    const tampered = `guest-999${cookie.slice("guest-123".length)}`;
    expect(parseGuestCookie(tampered)).toBeNull();
  });

  it("rejects malformed values", () => {
    expect(parseGuestCookie(undefined)).toBeNull();
    expect(parseGuestCookie("")).toBeNull();
    expect(parseGuestCookie("no-separator")).toBeNull();
  });
});
