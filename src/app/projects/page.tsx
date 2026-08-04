import type { Metadata } from "next";
import { FilterBar } from "@/components/projects/filter-bar";
import { ProjectCard } from "@/components/projects/project-card";
import { Pagination } from "@/components/ui/pagination";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { EmptyState } from "@/components/ui/state";
import { getRepo } from "@/lib/db/repo";
import { parseFilterParams, serializeFilterParams } from "@/lib/utils/url-filters";

export const revalidate = 60;

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse the NightBeam Studio catalog — mods, packs, and tools for Minecraft.",
  alternates: { canonical: `${siteUrl}/projects` },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (Array.isArray(value)) value.forEach((entry) => params.append(key, entry));
    else if (value) params.set(key, value);
  }
  const filters = parseFilterParams(params);
  const repo = await getRepo();
  const [result, categories] = await Promise.all([repo.listProjects(filters), repo.listCategories()]);

  function buildHref(page: number) {
    return `/projects${serializeFilterParams({ ...filters, page })}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <PixelHeading as="h1">Projects</PixelHeading>
        <p className="mt-3 max-w-2xl text-slate-400">
          Every release from NightBeam Studio in one place. Filter by loader, Minecraft version, or category — the URL
          shares your exact view.
        </p>
      </div>

      <FilterBar filters={filters} categories={categories} total={result.total} />

      <div className="mt-8">
        {result.items.length === 0 ? (
          <EmptyState
            title="No projects match"
            body="Try clearing a filter or two — new releases land here regularly."
          />
        ) : filters.view === "list" ? (
          <ul className="divide-y divide-night-600/40 rounded-xl border border-night-500/40 bg-night-900/40">
            {result.items.map((project) => (
              <li key={project.id}>
                <ProjectCard project={project} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <Pagination page={result.page} totalPages={result.totalPages} buildHref={buildHref} />
      </div>
    </div>
  );
}
