"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { BellIcon } from "@/components/icons";
import { EmptyState } from "@/components/ui/state";
import { timeAgo } from "@/lib/utils/format";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationCenter({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("Failed to load notifications");
      const json = (await response.json()) as { items: Notification[]; unread: number };
      return json;
    },
    enabled: Boolean(userId),
  });

  async function markAllRead() {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    void queryClient.invalidateQueries({ queryKey: ["notifications", userId] });
  }

  const unread = data?.unread ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unread ? ` (${unread} unread)` : ""}`}
        aria-expanded={open}
        className="relative rounded-md border border-night-500/60 bg-night-900 p-2.5 text-slate-300 hover:border-pixel-cyan/60 hover:text-white"
      >
        <BellIcon />
        {unread > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-pixel-cyan px-1 text-[10px] font-bold text-night-950">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="pixel-panel absolute right-0 z-50 mt-2 w-80 rounded-lg py-2">
          <div className="flex items-center justify-between border-b border-night-600/50 px-4 pb-2 pt-1">
            <span className="font-pixel text-[10px] text-pixel-cyan">NOTIFICATIONS</span>
            <button type="button" onClick={() => void markAllRead()} className="text-xs text-slate-400 hover:text-white">
              Mark all read
            </button>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {isLoading ? <p className="px-4 py-6 text-center text-sm text-slate-500">Loading…</p> : null}
            {!isLoading && (data?.items.length ?? 0) === 0 ? (
              <div className="px-4 py-6">
                <EmptyState title="All quiet" body="New project updates and replies will show up here." />
              </div>
            ) : null}
            {(data?.items ?? []).map((notification) => (
              <div key={notification.id} className={`px-4 py-3 ${notification.readAt ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-slate-100">{notification.title}</span>
                  <span className="shrink-0 text-[11px] text-slate-500">{timeAgo(notification.createdAt)}</span>
                </div>
                {notification.body ? <p className="mt-0.5 text-xs text-slate-400">{notification.body}</p> : null}
                {notification.link ? (
                  <Link href={notification.link} className="mt-1 inline-block text-xs text-pixel-cyan hover:underline">
                    View →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
          <Link href="/dashboard/notifications" className="block border-t border-night-600/50 px-4 py-2.5 text-center text-xs text-slate-400 hover:text-white">
            View all
          </Link>
        </div>
      ) : null}
    </div>
  );
}
