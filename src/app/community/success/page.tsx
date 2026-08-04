import type { Metadata } from "next";
import Link from "next/link";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = {
  title: "Welcome to Pro",
  description: "Thank you for upgrading to NightBeam Pro.",
};

export default function CommunitySuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <PixelHeading as="h1">Thank you!</PixelHeading>
      <p className="mt-4 text-slate-400">
        Your Pro membership is being activated. Discord perks may take a few minutes to appear after payment is confirmed.
      </p>
      <Link
        href="/community"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-pixel-purple/60 bg-night-900 px-4 text-sm font-medium text-white transition-colors hover:border-pixel-purple"
      >
        Back to Membership
      </Link>
    </div>
  );
}
