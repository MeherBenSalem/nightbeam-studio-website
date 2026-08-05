"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { StoreCategory, StoreFilters } from "@/lib/db/types";
import { cn } from "@/lib/utils/cn";

const CATEGORIES: Array<{ value: StoreCategory | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "plugins", label: "Plugins" },
  { value: "models", label: "Models" },
  { value: "configs", label: "Configs" },
  { value: "setups", label: "Setups" },
  { value: "other", label: "Other" },
];

const SORTS: Array<{ value: NonNullable<StoreFilters["sort"]>; label: string }> = [
  { value: "purchases", label: "Popular" },
  { value: "downloads", label: "Downloads" },
  { value: "price", label: "Price" },
  { value: "updated", label: "Updated" },
  { value: "name", label: "Name" },
];

export function StoreFilterBar({ filters, total }: { filters: StoreFilters; total: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(`/store?${params.toString()}`);
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-night-500/40 bg-night-900/40 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <button
            key={category.label}
            type="button"
            onClick={() => updateParam("category", category.value)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-xs font-medium transition-colors",
              (filters.category ?? "") === category.value
                ? "border-pixel-cyan/60 bg-pixel-cyan/10 text-pixel-cyan"
                : "border-night-500/60 text-slate-400 hover:border-night-400 hover:text-white",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-slate-400">
          Sort
          <select
            value={filters.sort ?? "purchases"}
            onChange={(event) => updateParam("sort", event.target.value)}
            className="rounded-md border border-night-500/60 bg-night-950 px-2 py-1.5 text-sm text-slate-200"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>
        <span className="text-xs text-slate-500">{total} product{total === 1 ? "" : "s"}</span>
        <Link href="https://builtbybit.com/store/nightbeam-studio.272/" target="_blank" rel="noopener noreferrer" className="text-xs text-pixel-cyan hover:underline">
          View on BuiltByBit
        </Link>
      </div>
    </div>
  );
}
