import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = {
  title: "Membership",
  description: "Choose a free or Pro NightBeam Studio membership.",
};

const FREE_BENEFITS = [
  "Browse and download public releases",
  "Standard Discord community access",
  "Follow and favorite projects",
  "Community and release updates",
];

const PRO_BENEFITS = [
  "Priority Discord support",
  "Dedicated support agent",
  "Early access to upcoming versions and projects",
  "Discord Premium Role",
  "Discord Premium Badge",
];

export default function CommunityPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PixelHeading as="h1">Membership</PixelHeading>
      <p className="mt-4 max-w-2xl text-slate-400">
        Choose the level of NightBeam access that fits you. Everyone is welcome, and Pro members will get closer support
        and early looks as the studio grows.
      </p>

      <section className="mt-10 grid gap-5 md:grid-cols-2" aria-label="Membership tiers">
        <Card className="flex flex-col p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-pixel text-xs text-pixel-cyan">FREE</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">NightBeam Free</h2>
            </div>
            <p className="font-pixel text-xl text-white">$0</p>
          </div>
          <p className="mt-4 text-sm text-slate-400">The essentials for exploring NightBeam and joining the conversation.</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {FREE_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3"><span className="text-pixel-cyan">✓</span><span>{benefit}</span></li>
            ))}
          </ul>
          <Link href="/auth/register" className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-night-500/70 bg-night-900 px-4 text-sm font-medium text-white transition-colors hover:border-pixel-cyan/60">
            Create Free Account
          </Link>
        </Card>

        <Card className="relative flex flex-col border-white/50 p-6">
          <span className="absolute right-5 top-5 rounded-full border border-white/40 px-2.5 py-1 text-[10px] uppercase tracking-widest text-slate-300">Coming soon</span>
          <div>
            <div>
              <p className="font-pixel text-xs text-pixel-purple">PRO</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">NightBeam Pro</h2>
            </div>
          </div>
          <p className="mt-4 font-pixel text-xl text-white">$2<span className="text-xs text-slate-500">/month</span></p>
          <p className="mt-4 text-sm text-slate-400">Extra support and first access for the players closest to the studio.</p>
          <ul className="mt-6 space-y-3 text-sm text-slate-300">
            {PRO_BENEFITS.map((benefit) => (
              <li key={benefit} className="flex gap-3"><span className="text-pixel-purple">✦</span><span>{benefit}</span></li>
            ))}
          </ul>
          <button type="button" disabled aria-disabled="true" className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-night-500/60 bg-night-900 px-4 text-sm font-medium text-slate-500">
            Pro membership coming soon
          </button>
        </Card>
      </section>

      <Card className="mt-8">
        <CardBody>
          <h2 className="font-pixel text-sm text-pixel-cyan">A clear path forward</h2>
          <p className="mt-3 text-sm text-slate-400">
            Start free today. When Pro opens, existing members will have a simple way to upgrade without losing their
            account or project follows.
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
