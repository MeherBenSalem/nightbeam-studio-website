"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function getConsent(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)nb-consent=([^;]+)/);
  return match?.[1] ?? null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!getConsent()) setVisible(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function choose(value: "all" | "essential") {
    document.cookie = `nb-consent=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      role="region"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-2xl rounded-xl border border-night-500/60 bg-night-900/95 p-5 shadow-2xl backdrop-blur"
    >
      <h2 className="font-pixel text-xs text-pixel-cyan">COOKIE CONSENT</h2>
      <p className="mt-2 text-sm text-slate-300">
        NightBeam Studio uses only essential cookies for sign-in, plus privacy-friendly, self-hosted analytics when you
        allow them. No third-party trackers, ever.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" onClick={() => choose("all")}>
          Accept analytics
        </Button>
        <Button size="sm" variant="secondary" onClick={() => choose("essential")}>
          Essential only
        </Button>
      </div>
    </aside>
  );
}
