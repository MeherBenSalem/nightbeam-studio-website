"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteUserAction, setUserBannedAction, setUserProAction, setUserRoleAction } from "@/lib/admin/actions";
import type { Role, UserDto } from "@/lib/db/types";

const ROLES: Role[] = ["USER", "SUPPORT_AGENT", "CONTENT_MANAGER", "ADMIN", "SUPER_ADMIN"];

type ConfirmKind = "role" | "pro" | "ban" | "delete";

const CONFIRM_TIMEOUT_MS = 6000;

export function UserRowActions({ user, canManageRoles }: { user: UserDto; canManageRoles: boolean }) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{ kind: ConfirmKind; role?: string } | null>(null);
  const [roleDraft, setRoleDraft] = useState<Role>(user.role);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep the role select in sync after a successful role change.
  useEffect(() => {
    setRoleDraft(user.role);
  }, [user.role]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  function arm(kind: ConfirmKind, role?: string) {
    setConfirm({ kind, role });
    setMessage(null);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setConfirm(null), CONFIRM_TIMEOUT_MS);
  }

  function disarm() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setConfirm(null);
    setRoleDraft(user.role);
  }

  async function run(action: (formData: FormData) => Promise<{ ok?: boolean; error?: string }>, formData: FormData) {
    const result = await action(formData);
    setMessage(result.error ?? (result.ok ? "Saved." : null));
    if (result.ok) router.refresh();
  }

  async function togglePro() {
    const formData = new FormData();
    formData.set("userId", user.id);
    formData.set("pro", user.isPro ? "0" : "1");
    await run(setUserProAction, formData);
  }

  async function runConfirmed() {
    if (!confirm) return;
    if (confirm.kind === "pro") {
      await togglePro();
      disarm();
      return;
    }
    const formData = new FormData();
    formData.set("userId", user.id);
    if (confirm.kind === "role" && confirm.role) formData.set("role", confirm.role);
    if (confirm.kind === "ban") formData.set("banned", user.isBanned ? "0" : "1");
    const action =
      confirm.kind === "role"
        ? setUserRoleAction
        : confirm.kind === "ban"
          ? setUserBannedAction
          : deleteUserAction;
    await run(action, formData);
    disarm();
  }

  const confirmLabel = confirm
    ? ({
        role: `Set role to ${confirm.role}?`,
        pro: user.isPro ? "Remove Pro status?" : "Grant Pro status?",
        ban: user.isBanned ? "Unban this user?" : "Ban this user?",
        delete: "Delete this user permanently?",
      })[confirm.kind]
    : null;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {canManageRoles ? (
          <select
            aria-label={`Role for ${user.email}`}
            value={roleDraft}
            onChange={(event) => {
              const value = event.target.value as Role;
              setRoleDraft(value);
              if (value !== user.role) arm("role", value);
              else disarm();
            }}
            className="rounded-md border border-night-500/60 bg-night-900 px-2 py-1 text-xs"
          >
            {ROLES.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        ) : null}
        <button
          type="button"
          onClick={() => (confirm?.kind === "pro" ? void runConfirmed() : arm("pro"))}
          className={`rounded-md border px-2 py-1 text-xs ${
            user.isPro ? "border-amber-500/40 text-amber-400" : "border-night-500/60 text-slate-400"
          }`}
        >
          {user.isPro ? "Pro ✓" : "Pro"}
        </button>
        {user.role !== "SUPER_ADMIN" ? (
          <>
            <button
              type="button"
              onClick={() => (confirm?.kind === "ban" ? void runConfirmed() : arm("ban"))}
              className={`rounded-md border px-2 py-1 text-xs ${
                user.isBanned ? "border-green-500/40 text-pixel-green" : "border-red-500/40 text-red-400"
              }`}
            >
              {user.isBanned ? "Unban" : "Ban"}
            </button>
            <button
              type="button"
              onClick={() => (confirm?.kind === "delete" ? void runConfirmed() : arm("delete"))}
              className="rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-400"
            >
              Delete
            </button>
          </>
        ) : null}
        {message ? <span className="text-xs text-slate-500">{message}</span> : null}
      </div>
      {confirm ? (
        <div className="mt-2 flex items-center gap-2 rounded-md border border-amber-500/40 bg-amber-950/20 px-2 py-1.5">
          <span className="text-xs text-amber-200">{confirmLabel}</span>
          <button
            type="button"
            onClick={() => void runConfirmed()}
            data-testid="confirm-action"
            className="rounded bg-amber-400 px-2 py-0.5 text-xs font-semibold text-black hover:bg-amber-300"
          >
            Confirm
          </button>
          <button
            type="button"
            onClick={disarm}
            className="rounded border border-night-500/60 px-2 py-0.5 text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
        </div>
      ) : null}
    </div>
  );
}
