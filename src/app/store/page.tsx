import type { Metadata } from "next";
import { Suspense } from "react";
import { StoreCard } from "@/components/store/store-card";
import { StoreFilterBar } from "@/components/store/store-filter-bar";
import { Pagination } from "@/components/ui/pagination";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { EmptyState } from "@/components/ui/state";
import type { StoreCategory, StoreFilters } from "@/lib/db/types";
import { getRepo } from "@/lib/db/repo";

export const revalidate = 60;

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Store",
  description: "Browse NightBeam Studio products on BuiltByBit — plugins, setups, configs, and more.",
  alternates: { canonical: `${siteUrl}/store` },
};

function parseStoreFilters(raw: Record<string, string | string[] | undefined>): StoreFilters {
  const get = (key: string) => {
    const value = raw[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const page = Number(get("page") ?? "1");
  const category = get("category");
  const sort = get("sort");
  const validCategories = new Set(["plugins", "models", "configs", "setups", "other"]);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    perPage: 12,
    category: category && validCategories.has(category) ? (category as StoreCategory) : undefined,
    sort: (sort as StoreFilters["sort"]) ?? "purchases",
    search: get("search"),
  };
}

function buildHref(filters: StoreFilters, page: number) {
  const params = new URLSearchParams();
  if (filters.category) params.set("category", filters.category);
  if (filters.sort && filters.sort !== "purchases") params.set("sort", filters.sort);
  if (filters.search) params.set("search", filters.search);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/store${query ? `?${query}` : ""}`;
}

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const filters = parseStoreFilters(raw);
  const repo = await getRepo();
  const result = await repo.listStoreProducts(filters);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <PixelHeading as="h1">Store</PixelHeading>
        <p className="mt-3 max-w-2xl text-slate-400">
          NightBeam Studio products on BuiltByBit. Purchases and downloads are handled on BuiltByBit — we never host paid files here.
        </p>
      </div>

      <Suspense fallback={<div className="h-16 rounded-xl border border-night-500/40 bg-night-900/40" />}>
        <StoreFilterBar filters={filters} total={result.total} />
      </Suspense>

      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="No products yet"
            body="Products appear here after BuiltByBit sync, or use memory mode with the seeded fixture catalog."
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((product) => (
              <StoreCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Pagination page={result.page} totalPages={result.totalPages} buildHref={(page) => buildHref(filters, page)} />
      </div>
    </div>
  );
}
