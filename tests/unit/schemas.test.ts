import { describe, expect, it } from "vitest";
import { loginSchema, passwordStrength, registerSchema, verifyEmailSchema } from "@/lib/auth/schemas";

describe("registerSchema", () => {
  const valid = {
    name: "Mahou",
    email: "  MAHOU@NightBeam.Studio  ",
    password: "StrongPass1",
    confirmPassword: "StrongPass1",
    acceptTerms: "on",
  };

  it("accepts a valid account", () => {
    const result = registerSchema.safeParse(valid);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("mahou@nightbeam.studio");
      expect(result.data.name).toBe("Mahou");
      expect(result.data.versions).toEqual([]);
      expect(result.data.loaders).toEqual([]);
    }
  });

  it("accepts version/loader preferences", () => {
    const result = registerSchema.safeParse({ ...valid, versions: ["26.2", "1.21.1"], loaders: ["FABRIC", "NEOFORGE"] });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.versions).toEqual(["26.2", "1.21.1"]);
      expect(result.data.loaders).toEqual(["FABRIC", "NEOFORGE"]);
    }
  });

  it("rejects mismatched confirmation passwords", () => {
    const result = registerSchema.safeParse({ ...valid, confirmPassword: "StrongPass2" });
    expect(result.success).toBe(false);
  });

  it("requires accepting the privacy policy", () => {
    const result = registerSchema.safeParse({ ...valid, acceptTerms: undefined });
    expect(result.success).toBe(false);
  });

  it("rejects weak passwords", () => {
    const result = registerSchema.safeParse({ ...valid, password: "weak", confirmPassword: "weak" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid emails", () => {
    const result = registerSchema.safeParse({ ...valid, email: "nope" });
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
