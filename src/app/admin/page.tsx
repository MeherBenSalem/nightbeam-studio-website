import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils/format";

export default async function AdminOverview() {
  const user = await requirePermission("analytics.view");
  if (!user) return null;
  const repo = await getRepo();
  const [users, projects, analytics, errors, audit] = await Promise.all([
    repo.listUsers("", 1, 1),
    repo.listProjects({ perPage: 1 }),
    repo.queryAnalytics({ limit: 1 }),
    repo.listApiErrors(1),
    repo.listAuditLogs(8),
  ]);

  const stats = [
    { label: "Users", value: users.total, href: "/admin/users" },
    { label: "Projects", value: projects.total, href: "/admin/projects" },
    { label: "Analytics events", value: analytics.length, href: "/admin/analytics" },
    { label: "API errors", value: errors.length, href: "/admin/errors" },
  ];

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="pixel-panel rounded-xl p-5 transition-colors hover:border-pixel-cyan/60">
            <div className="font-pixel text-2xl text-pixel-purple">{stat.value}</div>
            <div className="mt-2 text-xs uppercase tracking-widest text-slate-400">{stat.label}</div>
          </Link>
        ))}
      </div>
      <Card className="mt-8">
        <CardBody>
          <h2 className="font-semibold text-white">Recent audit log</h2>
          {audit.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">No audit entries yet.</p>
          ) : (
            <ul className="mt-3 divide-y divide-night-600/40">
              {audit.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="text-slate-300">
                    <span className="font-mono text-xs text-pixel-cyan">{entry.action}</span>
                    {entry.targetId ? <span className="ml-2 text-slate-500">→ {entry.targetId}</span> : null}
                  </span>
                  <span className="shrink-0 text-xs text-slate-500">
                    {entry.actorName ?? "system"} · {timeAgo(entry.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
