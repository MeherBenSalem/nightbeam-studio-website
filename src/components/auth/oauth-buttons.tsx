"use client";

import { signIn } from "next-auth/react";

const PROVIDERS: Array<{
  id: string;
  label: string;
  className: string;
}> = [
  {
    id: "builtbybit",
    label: "BuiltByBit",
    className: "border-amber-500/40 bg-amber-500/10 text-amber-200 hover:bg-amber-500/20",
  },
  {
    id: "google",
    label: "Google",
    className: "border-night-500/60 bg-night-900 text-slate-200 hover:bg-night-800",
  },
  {
    id: "discord",
    label: "Discord",
    className: "border-indigo-500/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20",
  },
  {
    id: "github",
    label: "GitHub",
    className: "border-night-500/60 bg-night-900 text-slate-200 hover:bg-night-800",
  },
];

export function OAuthButtons({
  providers,
  callbackUrl,
}: {
  providers: string[];
  callbackUrl?: string;
}) {
  const available = PROVIDERS.filter((provider) => providers.includes(provider.id));
  if (available.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-night-600/60" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-night-900 px-2 text-slate-500">Or continue with</span>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {available.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => void signIn(provider.id, { callbackUrl: callbackUrl || "/" })}
            className={`rounded-md border px-3 py-2 text-sm font-medium transition-colors ${provider.className}`}
          >
            {provider.label}
          </button>
        ))}
      </div>
    </div>
  );
}
