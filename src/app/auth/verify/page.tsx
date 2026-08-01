import type { Metadata } from "next";
import Link from "next/link";
import { VerifyForm } from "@/components/auth/auth-forms";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = { title: "Verify email" };

export default async function VerifyPage({ searchParams }: { searchParams: Promise<{ token?: string; email?: string }> }) {
  const { token, email } = await searchParams;
  if (!token || !email) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center sm:px-6">
        <PixelHeading as="h1">Invalid Link</PixelHeading>
        <p className="mt-3 text-sm text-slate-400">This verification link is incomplete or expired.</p>
        <Link href="/auth/register" className="mt-6 inline-block text-sm text-pixel-cyan hover:underline">
          Create an account
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <PixelHeading as="h1">Verify Email</PixelHeading>
      <p className="mt-3 text-sm text-slate-400">Confirm your email address to activate your account.</p>
      <div className="pixel-panel mt-8 rounded-xl p-6">
        <VerifyForm token={token} email={email} />
      </div>
    </div>
  );
}
