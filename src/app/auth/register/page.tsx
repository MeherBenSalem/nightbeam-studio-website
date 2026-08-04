import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/auth-forms";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <PixelHeading as="h1">Join NightBeam</PixelHeading>
      <p className="mt-3 text-sm text-slate-400">
        One account for favorites, follows, downloads, and notifications. Verify your email to sign in, and tell us
        your preferred versions and loaders to get relevant mods.
      </p>
      <div className="pixel-panel mt-8 rounded-xl p-6">
        <RegisterForm />
      </div>
    </div>
  );
}
