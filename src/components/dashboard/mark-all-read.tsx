"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function MarkAllReadButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: "{}" });
        router.refresh();
        setBusy(false);
      }}
      className="rounded-md border border-night-500/60 bg-night-900 px-3 py-1.5 text-xs text-slate-300 hover:border-pixel-cyan/60 hover:text-white disabled:opacity-50"
    >
      {busy ? "Working…" : "Mark all read"}
    </button>
  );
}
