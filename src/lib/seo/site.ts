export const SITE_NAME = "NightBeam Studio";

export const DEFAULT_TITLE = "NightBeam Studio — The Birth of Steve & Minecraft Mods";

export const DEFAULT_DESCRIPTION =
  "NightBeam Studio crafts story-driven Minecraft mods and worlds — home of The Birth of Steve. Explore projects, the store, documentation, and membership.";

export const SITE_KEYWORDS = [
  "NightBeam Studio",
  "NightBeam",
  "The Birth of Steve",
  "Birth of Steve",
  "Minecraft mods",
  "Minecraft worlds",
  "NeoForge",
  "Fabric",
  "story-driven Minecraft",
  "Minecraft modpack",
];

export const noIndexRobots = { index: false, follow: false } as const;

export function getSiteUrl(): string {
  const raw = process.env.APP_URL ?? "http://localhost:3000";
  return raw.replace(/\/+$/, "");
}

export function absoluteUrl(path: string): string {
  const siteUrl = getSiteUrl();
  if (!path || path === "/") return siteUrl;
  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function organizationJsonLd({ name, sameAs }: { name: string; sameAs: string[] }) {
  const siteUrl = getSiteUrl();
  return {
    "@type": "Organization",
    "@id": `${siteUrl}/#org`,
    name,
    url: siteUrl,
    logo: `${siteUrl}/nb-logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: sameAs.filter(Boolean),
  };
}

export function websiteJsonLd({ name }: { name: string }) {
  const siteUrl = getSiteUrl();
  return {
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name,
    publisher: { "@id": `${siteUrl}/#org` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/projects?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function softwareApplicationJsonLd(project: {
  name: string;
  slug: string;
  summary: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  studioName: string;
  authorName: string;
  latestVersion?: string | null;
  updatedAt: Date;
}) {
  const siteUrl = getSiteUrl();
  const image = project.bannerUrl ?? project.iconUrl ?? undefined;
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    url: `${siteUrl}/projects/${project.slug}`,
    applicationCategory: "GameApplication",
    operatingSystem: "Minecraft Java Edition",
    description: project.summary,
    image,
    author: { "@type": "Organization", name: project.studioName },
    creator: { "@type": "Person", name: project.authorName },
    softwareVersion: project.latestVersion ?? undefined,
    dateModified: project.updatedAt.toISOString(),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function productJsonLd(product: {
  name: string;
  slug: string;
  summary: string;
  iconUrl?: string | null;
  bannerUrl?: string | null;
  isFree: boolean;
  finalPrice: number;
  currency: string;
}) {
  const siteUrl = getSiteUrl();
  const image = product.bannerUrl ?? product.iconUrl ?? undefined;
  const price = product.isFree ? "0" : product.finalPrice.toFixed(2);
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    url: `${siteUrl}/store/${product.slug}`,
    description: product.summary,
    image,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: product.currency,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/store/${product.slug}`,
    },
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
