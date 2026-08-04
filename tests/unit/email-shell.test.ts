import { describe, expect, it } from "vitest";
import { emailShell } from "@/lib/auth/email";

describe("email shell — NightBeam pixel theme", () => {
  const html = emailShell({
    title: "VERIFY YOUR EMAIL",
    paragraphs: ["Welcome to NightBeam Studio."],
    ctaUrl: "https://nightbeam.dev/auth/verify?token=abc",
    ctaLabel: "VERIFY EMAIL",
    footnote: "The link expires in 24 hours.",
  });

  it("carries the brand wordmark and monochrome palette", () => {
    expect(html).toContain("NIGHTBEAM");
    expect(html).toContain("background:#05070f");
    expect(html).toContain("background:#0d0d0d");
    expect(html).toContain("Courier New");
  });

  it("includes the title, CTA and plain-link fallback", () => {
    expect(html).toContain("VERIFY YOUR EMAIL");
    expect(html).toContain("https://nightbeam.dev/auth/verify?token=abc");
    expect(html).toContain("Button not working?");
  });

  it("has no AI-slop styling: no rounded corners, gradients or external images", () => {
    expect(html).not.toContain("border-radius");
    expect(html).not.toContain("linear-gradient");
    expect(html).not.toContain("<img");
    expect(html).not.toContain("Press Start 2P");
  });

  it("escapes user content in paragraphs and digest items", () => {
    const escaped = emailShell({ title: "T", paragraphs: ["a <b>bold</b> & <script>alert(1)</script>"] });
    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("&lt;script&gt;");
    expect(escaped).toContain("&lt;b&gt;bold&lt;/b&gt;");
  });

  it("is table-based for mail clients", () => {
    expect(html).toContain('<table role="presentation"');
    expect(html).toContain('<td align="center"');
  });
});
