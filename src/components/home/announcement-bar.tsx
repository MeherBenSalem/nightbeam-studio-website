"use client";

import { useState } from "react";
import { CloseIcon } from "@/components/icons";

export function AnnouncementBar({ title, body, dismissible }: { title: string; body: string; dismissible: boolean }) {
  const [hidden, setHidden] = useState(false);
  if (hidden) return null;
  return (
    <div className="border-b border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-night-900 to-cyan-950/40">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2.5 sm:px-6">
        <span className="font-pixel text-[10px] text-pixel-purple">NEWS</span>
        <p className="min-w-0 flex-1 truncate text-sm text-slate-200">
          <span className="font-semibold text-white">{title}.</span> <span className="hidden text-slate-400 sm:inline">{body}</span>
        </p>
        {dismissible ? (
          <button type="button" onClick={() => setHidden(true)} aria-label="Dismiss announcement" className="rounded p-1 text-slate-400 hover:text-white">
            <CloseIcon />
          </button>
        ) : null}
      </div>
    </div>
  );
}
