import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { clearApiErrorsAction } from "@/lib/admin/actions";
import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils/format";

export default async function AdminErrorsPage() {
  const user = await requirePermission("errors.view");
  if (!user) return null;
  const repo = await getRepo();
  const errors = await repo.listApiErrors(200);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-semibold text-white">API errors</h2>
        <form action={clearApiErrorsAction}>
          <button type="submit" className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
            Clear all
          </button>
        </form>
      </div>
      <Card className="mt-5">
        <CardBody className="px-0 py-0">
          {errors.length === 0 ? (
            <div className="p-6"><EmptyState title="No errors logged" body="API errors and sync failures land here automatically." /></div>
          ) : (
            <ul className="divide-y divide-night-600/40">
              {errors.map((error) => (
                <li key={error.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className={`rounded px-1.5 py-0.5 font-mono text-xs ${error.status >= 500 ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-300"}`}>
                      {error.status}
                    </span>
                    <span className="font-mono text-xs text-pixel-cyan">{error.method}</span>
                    <span className="text-slate-300">{error.route}</span>
                    <span className="ml-auto text-xs text-slate-500">{timeAgo(error.createdAt)}</span>
                  </div>
                  {error.message ? <p className="mt-1 text-xs text-slate-500">{error.message}</p> : null}
                </li>
              ))}
            </ul>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
