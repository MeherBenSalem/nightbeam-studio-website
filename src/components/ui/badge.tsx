import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

const tones = {
  default: "bg-night-700/70 text-slate-300 border-night-500/50",
  purple: "bg-purple-500/15 text-pixel-purple border-purple-500/40",
  blue: "bg-blue-500/15 text-pixel-blue border-blue-500/40",
  cyan: "bg-cyan-500/15 text-pixel-cyan border-cyan-500/40",
  green: "bg-green-500/15 text-pixel-green border-green-500/40",
  pink: "bg-pink-500/15 text-pixel-pink border-pink-500/40",
  amber: "bg-amber-500/15 text-pixel-amber border-amber-500/40",
  danger: "bg-red-500/15 text-red-400 border-red-500/40",
};

export type BadgeTone = keyof typeof tones;

export function Badge({ tone = "default", className, ...props }: HTMLAttributes<HTMLSpanElement> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}
