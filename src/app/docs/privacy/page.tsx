import type { Metadata } from "next";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "NightBeam Studio privacy policy — what we collect, how accounts and cookies work, and how to contact us.",
  alternates: { canonical: absoluteUrl("/docs/privacy") },
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <PixelHeading as="h1">Privacy</PixelHeading>
      <div className="nb-prose mt-6">
        <h2>What we collect</h2>
        <p>
          NightBeam Studio runs its own privacy-friendly analytics. With your consent we record page views, downloads,
          searches, and favorite/follow activity to understand what players love. No third-party trackers are used and
          no data is sold.
        </p>
        <h2>Accounts</h2>
        <p>
          Account data (email, display name, preferences) is stored to provide sign-in, favorites, follows, and
          notifications. Passwords are stored only as salted hashes.
        </p>
        <h2>Cookies</h2>
        <p>
          We use an essential session cookie for sign-in and a consent cookie for your analytics choice. You can change
          your choice at any time by clearing the <code>nb-consent</code> cookie.
        </p>
        <h2>Contact</h2>
        <p>Questions about privacy? Reach the studio through the community links on the home page.</p>
      </div>
    </div>
  );
}
