"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteUserAction, setUserBannedAction, setUserRoleAction } from "@/lib/admin/actions";
import type { Role, UserDto } from "@/lib/db/types";

const ROLES: Role[] = ["USER", "SUPPORT_AGENT", "CONTENT_MANAGER", "ADMIN", "SUPER_ADMIN"];

export function UserRowActions({ user, canManageRoles }: { user: UserDto; canManageRoles: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  async function run(action: (formData: FormData) => Promise<{ ok?: boolean; error?: string }>, role?: string) {
    const formData = new FormData();
    formData.set("userId", user.id);
    if (role) formData.set("role", role);
    if (user.isBanned) formData.set("banned", "0");
    else formData.set("banned", "1");
    const result = await action(formData);
    setMessage(result.error ?? (result.ok ? "Saved." : null));
    if (result.ok) router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canManageRoles ? (
        <select
          aria-label={`Role for ${user.email}`}
          defaultValue={user.role}
          onChange={(event) => void run(setUserRoleAction, event.target.value)}
          className="rounded-md border border-night-500/60 bg-night-900 px-2 py-1 text-xs"
        >
          {ROLES.map((role) => (
            <option key={role} value={role}>
              {role}
            </option>
          ))}
        </select>
      ) : null}
      {user.role !== "SUPER_ADMIN" ? (
        <>
          <button
            type="button"
            onClick={() => void run(setUserBannedAction)}
            className={`rounded-md border px-2 py-1 text-xs ${user.isBanned ? "border-green-500/40 text-pixel-green" : "border-red-500/40 text-red-400"}`}
          >
            {user.isBanned ? "Unban" : "Ban"}
          </button>
          <button
            type="button"
            onClick={() => void run(deleteUserAction)}
            className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-400"
          >
            Delete
          </button>
        </>
      ) : null}
      {message ? <span className="text-xs text-slate-500">{message}</span> : null}
    </div>
  );
}
