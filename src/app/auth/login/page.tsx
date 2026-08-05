import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/auth-forms";
import { LoginOAuthButtons } from "@/components/auth/login-oauth";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ callbackUrl?: string }> }) {
  const { callbackUrl } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <PixelHeading as="h1">Welcome Back</PixelHeading>
      <p className="mt-3 text-sm text-slate-400">Sign in to favorite mods, follow releases, and manage notifications.</p>
      <div className="pixel-panel mt-8 rounded-xl p-6">
        <LoginForm callbackUrl={callbackUrl} />
        <div className="mt-6">
          <LoginOAuthButtons callbackUrl={callbackUrl} />
        </div>
      </div>
    </div>
  );
}
