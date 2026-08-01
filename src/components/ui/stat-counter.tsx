"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";
import { formatNumber } from "@/lib/utils/format";

export function StatCounter({ value, label, accent = "cyan" }: { value: number; label: string; accent?: "cyan" | "purple" | "blue" | "green" }) {
  const ref = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = textRef.current;
    if (!node) return;
    if (reduced || !inView) {
      node.textContent = formatNumber(value);
      return;
    }
    const controls = animate(0, value, { duration: 1.4, ease: "easeOut", onUpdate: (latest) => {
      node.textContent = formatNumber(Math.round(latest));
    } });
    return () => controls.stop();
  }, [inView, reduced, value]);

  const color =
    accent === "purple" ? "text-pixel-purple" : accent === "blue" ? "text-pixel-blue" : accent === "green" ? "text-pixel-green" : "text-pixel-cyan";

  return (
    <div ref={ref} className="text-center">
      <div ref={textRef} className={`font-pixel text-2xl sm:text-3xl ${color} text-glow`}>{formatNumber(0)}</div>
      <div className="mt-2 text-xs uppercase tracking-widest text-slate-400">{label}</div>
    </div>
  );
}
