import { BarChart } from "@/components/admin/bar-chart";
import { Card, CardBody } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils/format";

export default async function AdminAnalyticsPage({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
  const user = await requirePermission("analytics.view");
  if (!user) return null;
  const days = Math.min(30, Math.max(1, Number((await searchParams).days) || 14));
  // eslint-disable-next-line react-hooks/purity
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const repo = await getRepo();
  const events = await repo.queryAnalytics({ from: since, limit: 20_000 });

  const byType = new Map<string, number>();
  const byDay = new Map<string, number>();
  const dayLabels = Array.from({ length: days }, (_, index) => {
    // eslint-disable-next-line react-hooks/purity
    const date = new Date(Date.now() - (days - 1 - index) * 24 * 60 * 60 * 1000);
    return date.toISOString().slice(5, 10);
  });
  for (const event of events) {
    byType.set(event.type, (byType.get(event.type) ?? 0) + 1);
    const day = event.createdAt.toISOString().slice(5, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  const chartData = dayLabels.map((label) => ({ label, value: byDay.get(label) ?? 0 }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-white">Analytics</h2>
        <form action="/admin/analytics" method="get" className="flex items-center gap-2">
          <label htmlFor="days" className="text-xs text-slate-500">Last</label>
          <select id="days" name="days" defaultValue={days} className="rounded-md border border-night-500/60 bg-night-900 px-2 py-1.5 text-sm">
            {[7, 14, 30].map((value) => (
              <option key={value} value={value}>
                {value} days
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-md border border-night-500/60 bg-night-800 px-3 py-1.5 text-sm">Apply</button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[...byType.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([type, count]) => (
          <Card key={type}>
            <CardBody>
              <div className="font-pixel text-xl text-pixel-cyan">{count}</div>
              <div className="mt-1 text-xs uppercase tracking-wide text-slate-500">{type.toLowerCase()}</div>
            </CardBody>
          </Card>
        ))}
      </div>

      <Card>
        <CardBody>
          <BarChart data={chartData} label="Events per day" />
        </CardBody>
      </Card>

      <Card>
        <CardBody>
          <h2 className="font-semibold text-white">Recent events</h2>
          <ul className="mt-3 divide-y divide-night-600/40">
            {events.slice(0, 50).map((event) => (
              <li key={event.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="text-slate-300">
                  <span className="font-mono text-xs text-pixel-cyan">{event.type}</span>
                  <span className="ml-2 text-slate-500">{event.path ?? "—"}</span>
                </span>
                <span className="shrink-0 text-xs text-slate-500">{timeAgo(event.createdAt)}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
