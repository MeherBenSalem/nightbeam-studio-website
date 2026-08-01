import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ProjectSummary } from "@/lib/db/types";
import { formatNumber } from "@/lib/utils/format";

export function ProjectCard({ project }: { project: ProjectSummary }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="pixel-panel group block rounded-xl p-5 transition-transform hover:-translate-y-0.5 focus-visible:-translate-y-0.5"
    >
      <div className="flex items-start gap-4">
        {project.iconUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.iconUrl} alt="" className="h-14 w-14 rounded-lg border border-night-500/60 object-cover" />
        ) : (
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-lg border border-night-500/60 bg-gradient-to-br from-purple-600/40 via-night-800 to-cyan-500/30 font-pixel text-xl text-white">
            {project.name.slice(0, 1)}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-white group-hover:text-pixel-cyan">{project.name}</h3>
          <p className="text-xs text-slate-500">
            by {project.authorName} · v{project.latestVersion ?? "—"}
          </p>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-slate-400">{project.summary}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge tone="purple">{project.type}</Badge>
        {project.loaders.slice(0, 2).map((loader) => (
          <Badge key={loader} tone="blue">
            {loader}
          </Badge>
        ))}
        {project.minecraftVersions.slice(0, 2).map((version) => (
          <Badge key={version} tone="cyan">
            MC {version}
          </Badge>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
        <span>⬇ {formatNumber(project.downloads)}</span>
        <span>★ {formatNumber(project.followers)}</span>
        <span>👁 {formatNumber(project.views)}</span>
      </div>
    </Link>
  );
}
