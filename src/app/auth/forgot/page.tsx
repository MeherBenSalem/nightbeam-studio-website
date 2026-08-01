import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/auth-forms";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <PixelHeading as="h1">Reset Password</PixelHeading>
      <p className="mt-3 text-sm text-slate-400">Enter your email and we&apos;ll send a one-hour reset link.</p>
      <div className="pixel-panel mt-8 rounded-xl p-6">
        <ForgotForm />
      </div>
    </div>
  );
}
