import { describe, expect, it } from "vitest";
import { loginSchema, passwordStrength, registerSchema, verifyEmailSchema } from "@/lib/auth/schemas";

describe("registerSchema", () => {
  it("accepts a valid account", () => {
    const result = registerSchema.safeParse({
      name: "Mahou",
      email: "  MAHOU@NightBeam.Studio  ",
      password: "StrongPass1",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("mahou@nightbeam.studio");
      expect(result.data.name).toBe("Mahou");
    }
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({ name: "Mahou", email: "a@b.co", password: "weak" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = registerSchema.safeParse({ name: "Mahou", email: "nope", password: "StrongPass1" });
    expect(result.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("parses string rememberMe values from forms", () => {
    const result = loginSchema.safeParse({ email: "a@b.co", password: "x", rememberMe: "true" });
    expect(result.success).toBe(true);
  });

  it("parses boolean rememberMe values from clients", () => {
    const result = loginSchema.safeParse({ email: "a@b.co", password: "x", rememberMe: true });
    expect(result.success).toBe(true);
  });
});

describe("verifyEmailSchema", () => {
  it("requires email and token", () => {
    expect(verifyEmailSchema.safeParse({ token: "abc" }).success).toBe(false);
    expect(verifyEmailSchema.safeParse({ token: "abc", email: "a@b.co" }).success).toBe(true);
  });
});

describe("passwordStrength", () => {
  it("scores 0 for empty passwords", () => {
    expect(passwordStrength("").score).toBe(0);
  });

  it("scores 4 for strong passwords", () => {
    const strength = passwordStrength("NightBeam1");
    expect(strength.score).toBe(4);
    expect(strength.checks.every((check) => check.ok)).toBe(true);
  });
});
