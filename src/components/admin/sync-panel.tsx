"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function SyncPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function trigger() {
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch("/api/sync", { method: "POST" });
      const data = (await response.json()) as { message?: string; error?: string };
      setResult(data.error ?? data.message ?? "Sync finished.");
      router.refresh();
    } catch {
      setResult("Sync request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex items-center gap-3">
      <button
        type="button"
        onClick={() => void trigger()}
        disabled={busy}
        className="rounded-md bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {busy ? "Syncing…" : "Run sync now"}
      </button>
      {result ? <span className="text-xs text-slate-400">{result}</span> : null}
    </div>
  );
}
