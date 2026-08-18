import type { Metadata } from "next";
import { SupportPageClient } from "@/components/support/support-page-client";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { isDonationsConfigured, getServerEnv } from "@/lib/config/env";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Support Us",
  description:
    "Support NightBeam Studio with a one-time donation or monthly subscription to keep our projects alive and growing.",
  alternates: { canonical: absoluteUrl("/support") },
};

export default function SupportPage() {
  const configured = isDonationsConfigured();
  const env = getServerEnv();

  const recurringTiers = configured
    ? [
        { priceId: env.STRIPE_PRICE_ID_DONATE_3 ?? "", amount: 3, label: "Supporter" },
        { priceId: env.STRIPE_PRICE_ID_DONATE_5 ?? "", amount: 5, label: "Backer" },
        { priceId: env.STRIPE_PRICE_ID_DONATE_10 ?? "", amount: 10, label: "Champion" },
      ].filter((t) => t.priceId)
    : [];

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <div className="mb-12 text-center">
        <PixelHeading as="h1" className="mb-4">
          Support Us
        </PixelHeading>
        <p className="mx-auto max-w-2xl text-slate-400">
          NightBeam Studio is community-driven. Your support helps us maintain servers, develop new
          projects, and keep everything free and open.
        </p>
      </div>

      {configured ? (
        <SupportPageClient recurringTiers={recurringTiers} />
      ) : (
        <div className="rounded-xl border border-night-500/40 bg-night-900/60 p-8 text-center">
          <p className="text-slate-400">Donations coming soon. Check back later!</p>
        </div>
      )}
    </main>
  );
}
