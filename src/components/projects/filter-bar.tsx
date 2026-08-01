"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDownIcon, GridIcon, ListIcon, SearchIcon } from "@/components/icons";
import { LOADERS, MC_VERSIONS, PROJECT_TYPES, SORTS, serializeFilterParams } from "@/lib/utils/url-filters";
import type { ProjectFilters, ProjectType } from "@/lib/db/types";
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
  const activeCount =
    (filters.type ? 1 : 0) +
    (filters.loaders?.length ?? 0) +
    (filters.versions?.length ?? 0) +
    (filters.categories?.length ?? 0) +
    (filters.search ? 1 : 0);
  const [filtersOpen, setFiltersOpen] = useState(activeCount > 0);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (filters.search ?? "")) update({ search });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function update(patch: Partial<ProjectFilters>) {
    router.replace(`${pathname}${serializeFilterParams({ ...filters, ...patch, page: 1 })}`, { scroll: false });
  }

  function toggleList(key: "loaders" | "versions" | "categories", value: string) {
    const current = filters[key] ?? [];
    const next = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
    update({ [key]: next } as Partial<ProjectFilters>);
  }

  function clearAll() {
    router.replace(pathname, { scroll: false });
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs font-medium uppercase tracking-wide transition-colors",
      active
        ? "border-white bg-white text-black shadow-[0_0_14px_rgb(255_255_255/0.25)]"
        : "border-night-500/60 bg-night-900 text-slate-300 hover:border-white/60 hover:text-white",
    );

  return (
    <div className="pixel-panel rounded-xl p-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects…"
            aria-label="Search projects"
            className="w-full rounded-lg border border-night-500/60 bg-night-950 py-2.5 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-white/70 focus:outline-none focus:ring-1 focus:ring-white/40"
          />
        </div>
        <label className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500">
          Sort
          <select
            value={filters.sort ?? "downloads"}
            onChange={(event) => update({ sort: (event.target.value || "downloads") as ProjectFilters["sort"] })}
            aria-label="Sort projects"
            className="rounded-lg border border-night-500/60 bg-night-950 px-3 py-2.5 text-sm text-white focus:border-white/70 focus:outline-none"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex overflow-hidden rounded-lg border border-night-500/60">
          <button
            type="button"
            onClick={() => update({ view: "grid" })}
            aria-label="Grid view"
            aria-pressed={filters.view !== "list"}
            className={cn("p-2.5", filters.view !== "list" ? "bg-white text-black" : "bg-night-950 text-slate-400")}
          >
            <GridIcon />
          </button>
          <button
            type="button"
            onClick={() => update({ view: "list" })}
            aria-label="List view"
            aria-pressed={filters.view === "list"}
            className={cn("p-2.5", filters.view === "list" ? "bg-white text-black" : "bg-night-950 text-slate-400")}
          >
            <ListIcon />
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setFiltersOpen((open) => !open)}
        aria-expanded={filtersOpen}
        aria-controls="project-filter-options"
        className="mt-5 flex w-full items-center justify-between rounded-lg border border-night-500/60 bg-night-900/70 px-3 py-2.5 text-left text-xs uppercase tracking-wide text-slate-300 transition-colors hover:border-pixel-cyan/60 hover:text-white"
      >
        <span className="flex items-center gap-2">
          Filters
          {activeCount > 0 ? <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-black">{activeCount} active</span> : null}
        </span>
        <ChevronDownIcon className={cn("transition-transform", filtersOpen && "rotate-180")} />
      </button>

      {filtersOpen ? <div id="project-filter-options" className="mt-4">
      <div>
        <span className="text-xs uppercase tracking-wide text-slate-500">Type</span>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Project type">
          <button type="button" onClick={() => update({ type: undefined })} aria-pressed={!filters.type} className={chip(!filters.type)}>
            All
          </button>
          {PROJECT_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => update({ type: type === filters.type ? undefined : (type as ProjectType) })}
              aria-pressed={filters.type === type}
              className={chip(filters.type === type)}
            >
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs uppercase tracking-wide text-slate-500">Loaders</span>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Loaders">
          {LOADERS.map((loader) => (
            <button
              key={loader}
              type="button"
              onClick={() => toggleList("loaders", loader)}
              aria-pressed={(filters.loaders ?? []).includes(loader)}
              className={chip((filters.loaders ?? []).includes(loader))}
            >
              {loader.charAt(0) + loader.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs uppercase tracking-wide text-slate-500">Minecraft versions</span>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Minecraft versions">
          {MC_VERSIONS.map((version) => (
            <button
              key={version}
              type="button"
              onClick={() => toggleList("versions", version)}
              aria-pressed={(filters.versions ?? []).includes(version)}
              className={chip((filters.versions ?? []).includes(version))}
            >
              {version}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs uppercase tracking-wide text-slate-500">Categories</span>
        <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Categories">
          {categories.map((category) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => toggleList("categories", category.slug)}
              aria-pressed={(filters.categories ?? []).includes(category.slug)}
              className={chip((filters.categories ?? []).includes(category.slug))}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-night-600/40 pt-4">
        <p className="text-sm text-slate-400">
          <span className="font-pixel text-white">{total}</span> project{total === 1 ? "" : "s"}
          {activeCount > 0 ? (
            <>
              {" "}
              · <span className="text-white">{activeCount}</span> active filter{activeCount === 1 ? "" : "s"}
            </>
          ) : null}
        </p>
        {activeCount > 0 ? (
          <button
            type="button"
            onClick={clearAll}
            className="rounded-full border border-white/50 px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white hover:bg-white hover:text-black"
          >
            Clear filters
          </button>
        ) : null}
      </div>
      </div> : null}
    </div>
  );
}
