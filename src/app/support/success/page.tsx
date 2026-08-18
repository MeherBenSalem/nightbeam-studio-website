import type { Metadata } from "next";
import Link from "next/link";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { noIndexRobots } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for supporting NightBeam Studio.",
  robots: noIndexRobots,
};

export default function SupportSuccessPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
      <PixelHeading as="h1">Thank you!</PixelHeading>
      <p className="mt-4 text-slate-400">
        Your donation means the world to us. Thank you for supporting NightBeam Studio and helping
        us keep building awesome projects for the community.
      </p>
      <Link
        href="/support"
        className="mt-8 inline-flex h-10 items-center justify-center rounded-md border border-pixel-purple/60 bg-night-900 px-4 text-sm font-medium text-white transition-colors hover:border-pixel-purple"
      >
        Back to Support
      </Link>
    </div>
  );
}
