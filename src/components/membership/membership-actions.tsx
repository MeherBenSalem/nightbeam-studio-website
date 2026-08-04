"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function MembershipActions({
  loggedIn,
  isPro,
  stripeCustomerId,
  stripeSubscriptionId,
  stripeConfigured,
}: {
  loggedIn: boolean;
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeConfigured: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canManage = loggedIn && (stripeCustomerId || (isPro && stripeSubscriptionId));

  async function startCheckout() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Checkout is temporarily unavailable.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  async function openPortal() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !data.url) {
        setError(data.error ?? "Billing portal is temporarily unavailable.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Billing portal is temporarily unavailable.");
    } finally {
      setBusy(false);
    }
  }

  if (!loggedIn) {
    return (
      <Link
        href="/auth/login?callbackUrl=/community"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-pixel-purple/60 bg-night-900 px-4 text-sm font-medium text-white transition-colors hover:border-pixel-purple"
      >
        Upgrade to Pro
      </Link>
    );
  }

  if (canManage) {
    return (
      <div className="mt-8">
        <Button type="button" onClick={() => void openPortal()} disabled={busy}>
          Manage subscription
        </Button>
        {error ? <p className="mt-2 text-xs text-amber-300">{error}</p> : null}
      </div>
    );
  }

  if (!stripeConfigured) {
    return (
      <button
        type="button"
        disabled
        aria-disabled="true"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-night-500/60 bg-night-900 px-4 text-sm font-medium text-slate-500"
      >
        Pro unavailable
      </button>
    );
  }

  return (
    <div className="mt-8">
      <Button type="button" onClick={() => void startCheckout()} disabled={busy}>
        Upgrade to Pro
      </Button>
      {error ? <p className="mt-2 text-xs text-amber-300">{error}</p> : null}
    </div>
  );
}
