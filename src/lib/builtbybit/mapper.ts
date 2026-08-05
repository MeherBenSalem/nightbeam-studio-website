import "server-only";
import type { BbbResource, BbbVersion } from "@/lib/builtbybit/types";
import type { StoreCategory, StoreProductDetail, StoreProductSummary, StoreProductVersionDto } from "@/lib/db/types";

/** Observed NightBeam store category_ids from the creator resources API. */
const CATEGORY_MAP: Record<number, StoreCategory> = {
  1: "plugins",
  4: "setups",
  6: "models",
  7: "configs",
};

const CATEGORY_LABELS: Record<StoreCategory, string> = {
  plugins: "Plugins",
  models: "Models",
  configs: "Configs",
  setups: "Setups",
  other: "Other",
};

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function slugFromUrl(url: string, fallbackTitle: string): string {
  try {
    const pathname = new URL(url).pathname.replace(/\/+$/, "");
    const segment = pathname.split("/").filter(Boolean).pop();
    if (segment) {
      // URLs look like labubu-dolls.71023 — drop the trailing resource id.
      return slugify(segment.replace(/\.\d+$/, ""));
    }
  } catch {
    // ignore malformed URLs
  }
  return slugify(fallbackTitle);
}

function toDate(value: string | number | undefined | null): Date {
  if (value == null) return new Date();
  if (typeof value === "number") {
    // BBB timestamps are unix seconds.
    return new Date(value > 1e12 ? value : value * 1000);
  }
  const asNumber = Number(value);
  if (Number.isFinite(asNumber) && /^\d+$/.test(value.trim())) {
    return new Date(asNumber > 1e12 ? asNumber : asNumber * 1000);
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function mapCategory(resource: BbbResource): { category: StoreCategory; categoryLabel: string | null } {
  const categoryId = resource.category_id ?? resource.Category?.category_id ?? resource.Category?.id;
  const category = categoryId ? (CATEGORY_MAP[categoryId] ?? "other") : "other";
  const label =
    resource.Category?.name ??
    resource.Category?.title ??
    CATEGORY_LABELS[category];
  return { category, categoryLabel: label };
}

function versionLabel(version: BbbVersion): string {
  return version.version_string ?? version.version ?? `v${version.version_id}`;
}

function mapVersion(version: BbbVersion, isLatest: boolean): StoreProductVersionDto {
  return {
    id: `bbb-ver-${version.version_id}`,
    builtbybitId: version.version_id,
    version: versionLabel(version),
    downloadCount: version.download_count ?? 0,
    releaseDate: toDate(version.release_date ?? version.created_at),
    isLatest,
  };
}

function descriptionFromResource(resource: BbbResource): string {
  if (resource.Description?.html) return resource.Description.html;
  if (resource.Description?.bbcode) return resource.Description.bbcode;
  return resource.summary ?? "";
}

export function mapBbbResourceToSummary(resource: BbbResource): StoreProductSummary {
  const { category, categoryLabel } = mapCategory(resource);
  const listPrice = resource.ListPrice?.value ?? 0;
  const finalPrice = resource.FinalPrice?.value ?? listPrice;
  const currency = resource.FinalPrice?.currency ?? resource.ListPrice?.currency ?? "USD";
  const carousel = resource.carousel_image_urls ?? [];

  return {
    id: `bbb-${resource.resource_id}`,
    builtbybitId: resource.resource_id,
    slug: slugFromUrl(resource.url, resource.title),
    name: resource.title,
    summary: resource.summary,
    category,
    categoryLabel,
    url: resource.url,
    iconUrl: resource.cover_image_url ?? null,
    bannerUrl: carousel[0] ?? resource.cover_image_url ?? null,
    listPrice,
    finalPrice,
    currency,
    purchases: resource.purchase_count ?? 0,
    downloads: resource.download_count ?? 0,
    rating: resource.review_average ?? 0,
    reviewCount: resource.review_count ?? 0,
    isFree: finalPrice <= 0,
    latestVersion:
      resource.LatestVersion?.version_string ??
      resource.LatestVersion?.version ??
      resource.LatestVersion?.name ??
      null,
    status: "ACTIVE",
    featured: false,
    lastSyncedAt: new Date(),
    publishedAt: resource.published_at != null ? toDate(resource.published_at) : null,
    updatedAt: toDate(resource.last_updated_at ?? resource.published_at),
  };
}

export function mapBbbResourceToDetail(resource: BbbResource, versions: BbbVersion[]): StoreProductDetail {
  const summary = mapBbbResourceToSummary(resource);
  const productVersions = versions
    .filter((v) => v.resource_id === resource.resource_id)
    .sort((a, b) => {
      const aDate = toDate(a.release_date ?? a.created_at).getTime();
      const bDate = toDate(b.release_date ?? b.created_at).getTime();
      return bDate - aDate;
    })
    .map((version, index) => mapVersion(version, index === 0));

  if (productVersions.length === 0 && resource.LatestVersion) {
    const latest = resource.LatestVersion;
    productVersions.push({
      id: `bbb-ver-${latest.version_id ?? resource.resource_id}`,
      builtbybitId: latest.version_id ?? resource.resource_id,
      version: latest.version_string ?? latest.version ?? latest.name ?? "latest",
      downloadCount: latest.download_count ?? 0,
      releaseDate: toDate(latest.release_date ?? latest.created_at),
      isLatest: true,
    });
  }

  if (productVersions.length > 0) {
    summary.latestVersion = productVersions[0].version;
  }

  return {
    ...summary,
    description: descriptionFromResource(resource),
    versions: productVersions,
  };
}
