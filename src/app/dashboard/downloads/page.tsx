import Link from "next/link";
import { EmptyState } from "@/components/ui/state";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils/format";

export const metadata = { title: "Downloads" };

export default async function DownloadsPage() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const items = await repo.listUserDownloads(user.id);
  return (
    <div>
      <PixelHeading as="h1">Downloads</PixelHeading>
      <p className="mt-2 text-sm text-slate-400">Files you have grabbed.</p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="No downloads yet" body="When you download a file while signed in, it shows up here." />
        ) : (
          <ul className="divide-y divide-night-600/40 rounded-xl border border-night-500/40 bg-night-900/40">
            {items.map((item, index) => (
              <li key={`${item.project.id}-${index}`}>
                <Link href={`/projects/${item.project.slug}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-night-800">
                  <div>
                    <div className="font-medium text-white">{item.project.name}</div>
                    <div className="text-xs text-slate-500">{item.fileId ?? "primary file"}</div>
                  </div>
                  <span className="text-xs text-slate-500">{timeAgo(item.downloadedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
