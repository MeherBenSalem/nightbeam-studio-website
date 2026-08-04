"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChatPanel } from "@/components/chat/chat-panel";

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
      <path d="M12 3c-4.5 0-8 2.9-8 6.5 0 1.9 1 3.6 2.6 4.8L6 19l3.4-2c.8.2 1.7.3 2.6.3 4.5 0 8-2.9 8-6.5S16.5 3 12 3Z" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" strokeLinecap="round" />
    </svg>
  );
}

export function ChatWidget({ user }: { user: { id: string; role: string } | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Open when the navbar Chat tab is clicked.
  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("nightbeam:open-chat", handler);
    return () => window.removeEventListener("nightbeam:open-chat", handler);
  }, []);

  // The full-page chat already renders the panel — hide the floating button there.
  if (pathname === "/chat") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open ? <ChatPanel mode="floating" user={user} onClose={() => setOpen(false)} /> : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className="flex h-13 w-13 items-center justify-center rounded-full border border-night-500 bg-night-800 p-3 text-pixel-cyan shadow-lg shadow-black/50 transition-colors hover:border-pixel-cyan hover:bg-night-700"
      >
        {open ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        ) : (
          <ChatIcon />
        )}
      </button>
    </div>
  );
}
