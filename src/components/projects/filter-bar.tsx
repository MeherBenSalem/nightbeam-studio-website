"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { GridIcon, ListIcon } from "@/components/icons";
import { Input, Select } from "@/components/ui/input";
import { LOADERS, MC_VERSIONS, PROJECT_TYPES, SORTS, serializeFilterParams } from "@/lib/utils/url-filters";
import type { ProjectFilters } from "@/lib/db/types";
import { cn } from "@/lib/utils/cn";

export function FilterBar({
  filters,
  categories,
  total,
}: {
  filters: ProjectFilters;
  categories: { slug: string; name: string }[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [search, setSearch] = useState(filters.search ?? "");

  function update(patch: Partial<ProjectFilters>) {
    const next = { ...filters, ...patch, page: 1 };
    router.replace(`${pathname}${serializeFilterParams(next)}`, { scroll: false });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters.search ?? "")) update({ search });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="pixel-panel rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          key={filters.search ?? ""}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search projects…"
          aria-label="Search projects"
          className="max-w-64"
        />
        <Select value={filters.type ?? ""} onChange={(event) => update({ type: (event.target.value || undefined) as ProjectFilters["type"] })} aria-label="Filter by type">
          <option value="">All types</option>
          {PROJECT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select value={filters.loader ?? ""} onChange={(event) => update({ loader: (event.target.value || undefined) as ProjectFilters["loader"] })} aria-label="Filter by loader">
          <option value="">All loaders</option>
          {LOADERS.map((loader) => (
            <option key={loader} value={loader}>
              {loader.charAt(0) + loader.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>
        <Select value={filters.version ?? ""} onChange={(event) => update({ version: event.target.value || undefined })} aria-label="Filter by Minecraft version">
          <option value="">All versions</option>
          {MC_VERSIONS.map((version) => (
            <option key={version} value={version}>
              MC {version}
            </option>
          ))}
        </Select>
        <Select value={filters.category ?? ""} onChange={(event) => update({ category: event.target.value || undefined })} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select value={filters.platform ?? ""} onChange={(event) => update({ platform: event.target.value || undefined })} aria-label="Filter by platform">
          <option value="">Any platform</option>
          <option value="curseforge">CurseForge</option>
          <option value="github">GitHub</option>
        </Select>
        <Select value={filters.sort ?? "downloads"} onChange={(event) => update({ sort: (event.target.value || "downloads") as ProjectFilters["sort"] })} aria-label="Sort projects">
          {SORTS.map((sort) => (
            <option key={sort.value} value={sort.value}>
              {sort.label}
            </option>
          ))}
        </Select>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">{total} project{total === 1 ? "" : "s"}</span>
          <div className="flex overflow-hidden rounded-md border border-night-500/60">
            <button
              type="button"
              onClick={() => update({ view: "grid" })}
              aria-label="Grid view"
              aria-pressed={filters.view !== "list"}
              className={cn("p-2", filters.view !== "list" ? "bg-night-700 text-pixel-cyan" : "bg-night-900 text-slate-400")}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              onClick={() => update({ view: "list" })}
              aria-label="List view"
              aria-pressed={filters.view === "list"}
              className={cn("p-2", filters.view === "list" ? "bg-night-700 text-pixel-cyan" : "bg-night-900 text-slate-400")}
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
