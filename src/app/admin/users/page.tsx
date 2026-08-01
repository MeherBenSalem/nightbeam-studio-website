import { UserRowActions } from "@/components/admin/user-row-actions";
import { Card, CardBody } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { requirePermission } from "@/lib/auth/guards";
import { ROLE_LABELS } from "@/lib/auth/permissions";
import { getRepo } from "@/lib/db/repo";
import { formatDate } from "@/lib/utils/format";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const user = await requirePermission("users.view");
  if (!user) return null;
  const repo = await getRepo();
  const { q, page } = await searchParams;
  const result = await repo.listUsers(q ?? "", Math.max(1, Number(page) || 1), 25);

  return (
    <div>
      <h2 className="font-semibold text-white">Users &amp; roles</h2>
      <form className="mt-4 flex gap-2" action="/admin/users" method="get">
        <input name="q" defaultValue={q ?? ""} placeholder="Search by name or email…" className="w-full max-w-72 rounded-md border border-night-500/60 bg-night-900 px-3 py-2 text-sm" />
        <button type="submit" className="rounded-md border border-night-500/60 bg-night-800 px-4 py-2 text-sm text-slate-200">Search</button>
      </form>
      <Card className="mt-5">
        <CardBody className="px-0 py-0">
          {result.items.length === 0 ? (
            <div className="p-6"><EmptyState title="No users found" /></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-200 text-left text-sm">
                <thead>
                  <tr className="border-b border-night-600/50 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-night-600/40">
                  {result.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{item.displayName ?? item.name ?? "—"}</div>
                        <div className="text-xs text-slate-500">{item.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded border border-purple-500/40 bg-purple-500/10 px-2 py-0.5 text-xs text-pixel-purple">
                          {ROLE_LABELS[item.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{formatDate(item.createdAt)}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded px-2 py-0.5 text-xs ${item.isBanned ? "bg-red-500/15 text-red-400" : "bg-green-500/15 text-pixel-green"}`}>
                          {item.isBanned ? "Banned" : "Active"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <UserRowActions user={item} canManageRoles={user.role === "SUPER_ADMIN" || user.role === "ADMIN"} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
