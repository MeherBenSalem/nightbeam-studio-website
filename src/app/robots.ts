import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo/site";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/dashboard", "/api/", "/auth/", "/chat", "/community/success"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
