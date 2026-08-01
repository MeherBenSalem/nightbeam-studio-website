"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ChevronDownIcon } from "@/components/icons";
import type { NavUser } from "@/components/layout/navbar";
import { logoutAction, logoutAllAction } from "@/lib/auth/actions";

export function UserMenu({ user }: { user: NavUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isStaff = user.role !== "USER";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex h-10 items-center gap-2 rounded-md border border-night-500/60 bg-night-900 px-2.5 text-sm text-slate-200 hover:border-pixel-cyan/60"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-6 w-6 rounded-full" />
        ) : (
          <span className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-purple-600 to-cyan-500 font-pixel text-[10px] text-white">
            {(user.name ?? "U").slice(0, 1).toUpperCase()}
          </span>
        )}
        <span className="hidden max-w-28 truncate sm:inline">{user.name ?? "Account"}</span>
        <ChevronDownIcon width={14} height={14} />
      </button>

      {open ? (
        <div
          role="menu"
          className="pixel-panel absolute right-0 z-50 mt-2 w-60 rounded-lg py-2"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
          }}
        >
          <div className="border-b border-night-600/50 px-4 pb-2 pt-1">
            <div className="truncate text-sm font-semibold text-white">{user.name ?? "Player"}</div>
            <div className="truncate text-xs text-slate-500">{user.email}</div>
          </div>
          <Link href="/dashboard" role="menuitem" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-night-800 hover:text-white">
            Dashboard
          </Link>
          <Link href="/dashboard/settings" role="menuitem" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-slate-300 hover:bg-night-800 hover:text-white">
            Settings
          </Link>
          {isStaff ? (
            <Link href="/admin" role="menuitem" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm text-pixel-purple hover:bg-night-800">
              Admin panel
            </Link>
          ) : null}
          <div className="my-1 border-t border-night-600/50" />
          <button
            type="button"
            role="menuitem"
            onClick={() => void logoutAction()}
            className="block w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-night-800 hover:text-white"
          >
            Sign out
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={() => void logoutAllAction()}
            className="block w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-night-800 hover:text-white"
          >
            Sign out all devices
          </button>
        </div>
      ) : null}
    </div>
  );
}
