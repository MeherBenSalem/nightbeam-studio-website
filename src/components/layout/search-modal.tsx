"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/state";
import { trackEventClient } from "@/lib/analytics/client";
import { formatNumber } from "@/lib/utils/format";

interface SearchResult {
  slug: string;
  name: string;
  summary: string;
  downloads: number;
  latestVersion: string | null;
  loaders: string[];
}

export function SearchModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        setQuery("");
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (!open) return;
      if (event.key === "/" && document.activeElement !== inputRef.current) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const { data, isFetching } = useQuery({
    queryKey: ["search", query],
    queryFn: async () => {
      const response = await fetch(`/api/projects?search=${encodeURIComponent(query)}&perPage=8`);
      if (!response.ok) throw new Error("Search failed");
      const json = (await response.json()) as { items: SearchResult[] };
      return json.items;
    },
    enabled: open && query.trim().length > 0,
    placeholderData: (previous) => previous,
  });

  const results = data ?? [];

  function onKeyDown(event: React.KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && results[activeIndex]) {
      event.preventDefault();
      trackEventClient("SEARCH", { search: query });
      onClose();
      window.location.href = `/projects/${results[activeIndex].slug}`;
    }
  }

  return (
    <Dialog open={open} onClose={onClose} title="SEARCH PROJECTS" wide>
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search mods, packs, tools…"
            aria-label="Search projects"
            className="w-full rounded-lg border border-night-500/70 bg-night-950 px-4 py-3 pl-11 text-base text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.05)] placeholder:text-slate-500 focus:border-pixel-cyan/80 focus:outline-none focus:ring-2 focus:ring-pixel-cyan/20"
          />
          {query ? <button type="button" onClick={() => setQuery("")} aria-label="Clear search" className="absolute right-3 top-1/2 -translate-y-1/2 rounded px-2 py-1 text-xs text-slate-500 hover:bg-night-800 hover:text-white">Clear</button> : null}
        </div>
        {query.trim().length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">Type to search the NightBeam catalog.</p>
        ) : isFetching ? (
          <p className="py-6 text-center text-sm text-slate-500">Searching…</p>
        ) : results.length === 0 ? (
          <EmptyState title="No matches" body={`Nothing found for “${query}”. Try another term.`} />
        ) : (
          <ul className="max-h-80 divide-y divide-night-600/40 overflow-y-auto" role="listbox" aria-label="Search results">
            {results.map((project, index) => (
              <li key={project.slug} role="option" aria-selected={index === activeIndex}>
                <Link
                  href={`/projects/${project.slug}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => {
                    trackEventClient("SEARCH", { search: query });
                    onClose();
                  }}
                  className={`block px-3 py-3 ${index === activeIndex ? "bg-night-800" : ""}`}
                >
                  <span className="flex items-center justify-between gap-3">
                    <span className="font-medium text-white">{project.name}</span>
                    <span className="text-xs text-slate-500">{formatNumber(project.downloads)} downloads</span>
                  </span>
                  <span className="mt-0.5 line-clamp-1 text-sm text-slate-400">{project.summary}</span>
                  <span className="mt-1.5 flex gap-1.5">
                    {project.loaders.map((loader) => (
                      <span key={loader} className="rounded border border-night-500/50 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">
                        {loader}
                      </span>
                    ))}
                    {project.latestVersion ? (
                      <span className="rounded border border-cyan-500/40 px-1.5 py-0.5 text-[10px] uppercase text-pixel-cyan">
                        v{project.latestVersion}
                      </span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Dialog>
  );
}
