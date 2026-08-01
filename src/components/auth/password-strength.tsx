"use client";

import { passwordStrength } from "@/lib/auth/schemas";
import { cn } from "@/lib/utils/cn";

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, checks } = passwordStrength(password);
  const labels = ["Too weak", "Weak", "Okay", "Good", "Strong"];
  const colors = ["bg-red-500", "bg-red-400", "bg-amber-400", "bg-cyan-400", "bg-green-400"];
  return (
    <div className="mt-2">
      <div className="flex gap-1" aria-hidden>
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className={cn("h-1 flex-1 rounded-full", index < score ? colors[score] : "bg-night-700")} />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px]">
        <span className="text-slate-400">{labels[score]}</span>
        <ul className="flex flex-wrap gap-x-3 gap-y-0.5 text-slate-500">
          {checks.map((check) => (
            <li key={check.label} className={check.ok ? "text-pixel-green" : undefined}>
              {check.ok ? "✓" : "○"} {check.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
