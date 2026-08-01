"use client";

import { useSearchParams } from "next/navigation";
import { Dialog } from "@/components/ui/dialog";
import { LoginForm } from "@/components/auth/auth-forms";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? undefined;
  return (
    <Dialog open={open} onClose={onClose} title="SIGN IN">
      <LoginForm callbackUrl={callbackUrl} embedded />
    </Dialog>
  );
}
