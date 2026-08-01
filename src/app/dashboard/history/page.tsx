import Link from "next/link";
import { EmptyState } from "@/components/ui/state";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export const metadata = { title: "Recently viewed" };

export default async function HistoryPage() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const items = await repo.listRecentlyViewed(user.id);
  return (
    <div>
      <PixelHeading as="h1">Recently Viewed</PixelHeading>
      <p className="mt-2 text-sm text-slate-400">Your last 20 visited projects.</p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="Nothing here yet" body="Browse the catalog and your history will appear." />
        ) : (
          <ul className="divide-y divide-night-600/40 rounded-xl border border-night-500/40 bg-night-900/40">
            {items.map((project) => (
              <li key={project.id}>
                <Link href={`/projects/${project.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-night-800">
                  <span className="font-medium text-white">{project.name}</span>
                  <span className="text-xs text-slate-500">v{project.latestVersion ?? "—"}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
