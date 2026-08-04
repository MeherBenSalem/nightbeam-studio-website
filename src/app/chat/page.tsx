import type { Metadata } from "next";
import { ChatPanel } from "@/components/chat/chat-panel";
import { auth } from "@/lib/auth/auth";
import { isChatbotEnabled } from "@/lib/config/env";

export const metadata: Metadata = {
  title: "Assistant",
  description: "Ask the NightBeam Assistant about NightBeam Studio's mods.",
  robots: { index: false, follow: false },
};

export default async function ChatPage() {
  if (!isChatbotEnabled()) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-pixel text-lg text-pixel-cyan">NIGHTBEAM ASSISTANT</h1>
        <p className="mt-4 text-sm text-slate-400">The assistant is not available right now. Please check back later.</p>
      </div>
    );
  }

  const session = await auth();
  const user = session?.user
    ? { id: session.user.id, role: session.user.role ?? "USER" }
    : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-10">
      <div className="h-[calc(100dvh-11rem)] min-h-[480px] sm:h-[calc(100dvh-13rem)]">
        <ChatPanel mode="full" user={user} />
      </div>
    </div>
  );
}
