import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/auth/auth-forms";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string }> }) {
  const { token, email } = await searchParams;
  if (!token || !email) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <PixelHeading as="h1">Invalid Link</PixelHeading>
        <p className="mt-3 text-sm text-slate-400">This reset link is incomplete. Request a new one.</p>
        <Link href="/auth/forgot" className="mt-6 inline-block text-sm text-pixel-cyan hover:underline">
          Request a new link
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <PixelHeading as="h1">New Password</PixelHeading>
      <p className="mt-3 text-sm text-slate-400">Choose a strong password to replace the old one.</p>
      <div className="pixel-panel mt-8 rounded-xl p-6">
        <ResetForm token={token} email={email} />
      </div>
    </div>
  );
}
