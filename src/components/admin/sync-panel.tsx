"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function trigger(source?: "curseforge" | "builtbybit") {
    setBusy(true);
    setResult(null);
    try {
      const url = source ? `/api/sync?source=${source}` : "/api/sync";
      const response = await fetch(url, { method: "POST" });
      const data = (await response.json()) as { message?: string; error?: string; curseforge?: { message?: string }; builtbybit?: { message?: string } };
      if (data.error) {
        setResult(data.error);
      } else if (data.curseforge || data.builtbybit) {
        const parts = [data.curseforge?.message, data.builtbybit?.message].filter(Boolean);
        setResult(parts.join(" · ") || "Sync finished.");
      } else {
        setResult(data.message ?? "Sync finished.");
      }
      router.refresh();
    } catch {
      setResult("Sync request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => void trigger()}
        disabled={busy}
        className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Syncing…" : "Run all syncs"}
      </button>
      <button
        type="button"
        onClick={() => void trigger("curseforge")}
        disabled={busy}
        className="rounded-md border border-night-500/60 px-4 py-2 text-sm text-slate-200 disabled:opacity-50"
      >
        CurseForge
      </button>
      <button
        type="button"
        onClick={() => void trigger("builtbybit")}
        disabled={busy}
        className="rounded-md border border-amber-500/40 px-4 py-2 text-sm text-amber-200 disabled:opacity-50"
      >
        BuiltByBit
      </button>
      {result ? <span className="text-xs text-slate-400">{result}</span> : null}
    </div>
  );
}
