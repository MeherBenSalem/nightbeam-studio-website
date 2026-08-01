import Link from "next/link";
import { EmptyState } from "@/components/ui/state";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils/format";
import { MarkAllReadButton } from "@/components/dashboard/mark-all-read";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const items = await repo.listNotifications(user.id);
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <PixelHeading as="h1">Notifications</PixelHeading>
        <MarkAllReadButton />
      </div>
      <p className="mt-2 text-sm text-slate-400">Project updates, follows, and replies.</p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="All caught up" body="New activity will appear here." />
        ) : (
          <ul className="divide-y divide-night-600/40 rounded-xl border border-night-500/40 bg-night-900/40">
            {items.map((notification) => (
              <li key={notification.id} className={`px-4 py-3 ${notification.readAt ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium text-white">{notification.title}</div>
                    {notification.body ? <p className="mt-0.5 text-sm text-slate-400">{notification.body}</p> : null}
                  </div>
                  <span className="shrink-0 text-xs text-slate-500">{timeAgo(notification.createdAt)}</span>
                </div>
                {notification.link ? (
                  <Link href={notification.link} className="mt-1 inline-block text-xs text-pixel-cyan hover:underline">
                    View →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
