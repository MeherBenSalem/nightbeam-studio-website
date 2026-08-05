import { SyncPanel } from "@/components/admin/sync-panel";
import { Card, CardBody } from "@/components/ui/card";
import { flushCacheAction } from "@/lib/admin/actions";
import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export default async function AdminSyncPage() {
  const user = await requirePermission("sync.manage");
  if (!user) return null;
  const repo = await getRepo();
  const [syncState, cacheStats] = await Promise.all([repo.getSyncState("curseforge"), import("@/lib/curseforge/cache").then((m) => m.getCacheStats())]);
  const builtbybitSyncState = await repo.getSyncState("builtbybit");
  return (
    <div className="space-y-6">
      <Card>
        <CardBody>
          <h2 className="font-semibold text-white">CurseForge sync</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd className={`mt-1 font-semibold ${syncState.status === "SUCCESS" ? "text-pixel-green" : syncState.status === "ERROR" ? "text-red-400" : syncState.status === "RUNNING" ? "text-pixel-cyan" : "text-slate-300"}`}>
                {syncState.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Message</dt>
              <dd className="mt-1 text-slate-300">{syncState.message ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Projects synced</dt>
              <dd className="mt-1 text-slate-300">{syncState.projectsSynced}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Last run</dt>
              <dd className="mt-1 text-slate-300">{syncState.lastRunAt?.toISOString() ?? "never"}</dd>
            </div>
          </dl>
          <SyncPanel />
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h2 className="font-semibold text-white">BuiltByBit sync</h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Status</dt>
              <dd className={`mt-1 font-semibold ${builtbybitSyncState.status === "SUCCESS" ? "text-pixel-green" : builtbybitSyncState.status === "ERROR" ? "text-red-400" : builtbybitSyncState.status === "RUNNING" ? "text-pixel-cyan" : "text-slate-300"}`}>
                {builtbybitSyncState.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Message</dt>
              <dd className="mt-1 text-slate-300">{builtbybitSyncState.message ?? "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Products synced</dt>
              <dd className="mt-1 text-slate-300">{builtbybitSyncState.projectsSynced}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Last run</dt>
              <dd className="mt-1 text-slate-300">{builtbybitSyncState.lastRunAt?.toISOString() ?? "never"}</dd>
            </div>
          </dl>
        </CardBody>
      </Card>
      <Card>
        <CardBody>
          <h2 className="font-semibold text-white">Cache</h2>
          <p className="mt-2 text-sm text-slate-400">
            {cacheStats.kind === "redis" ? "Redis" : "In-memory"} cache · {cacheStats.keys} keys · {cacheStats.hits} hits · {cacheStats.misses} misses
          </p>
          <form action={flushCacheAction}>
            <button type="submit" className="mt-3 rounded-md border border-amber-500/40 px-3 py-1.5 text-xs text-amber-300 hover:bg-amber-500/10">
              Flush all caches
            </button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
