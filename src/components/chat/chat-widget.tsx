"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Turnstile } from "@/components/auth/turnstile";
import { publicConfig } from "@/lib/public-config";
import type { ChatHistoryItem } from "@/lib/chatbot/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6" aria-hidden>
      <path d="M12 3c-4.5 0-8 2.9-8 6.5 0 1.9 1 3.6 2.6 4.8L6 19l3.4-2c.8.2 1.7.3 2.6.3 4.5 0 8-2.9 8-6.5S16.5 3 12 3Z" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" strokeLinecap="round" />
    </svg>
  );
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the NightBeam Assistant. Ask me anything about our mods — RPG Attribute System (installation, config, commands, permissions) or The Birth of Steve!",
};

export function ChatWidget() {
  const { data: session } = useSession();
  const loggedIn = Boolean(session?.user);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [remaining, setRemaining] = useState<number | null | undefined>(undefined);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function send() {
    if (busyRef.current) return;
    const message = input.trim();
    if (!message) return;
    busyRef.current = true;
    setBusy(true);
    setError(null);
    setNotice(null);
    setLoginPrompt(false);
    setInput("");

    const history: ChatHistoryItem[] = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history, turnstileToken }),
      });
      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream") && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantStarted = false;
        let streamError: string | null = null;

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let sep = buffer.indexOf("\n\n");
          while (sep !== -1) {
            const block = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            const dataLine = block.split("\n").find((line) => line.startsWith("data:"));
            if (!dataLine) {
              sep = buffer.indexOf("\n\n");
              continue;
            }
            try {
              const data = JSON.parse(dataLine.slice(5).trim()) as {
                content?: string;
                remaining?: number | null;
                message?: string;
              };
              if (typeof data.content === "string") {
                const delta: string = data.content;
                if (!assistantStarted) {
                  assistantStarted = true;
                  setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
                }
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role !== "assistant") return prev;
                  return [...prev.slice(0, -1), { role: "assistant", content: last.content + delta }];
                });
              }
              if (data.remaining !== undefined) setRemaining(data.remaining);
              if (typeof data.message === "string") {
                streamError = data.message;
                setError(data.message);
              }
            } catch {
              // Ignore malformed frames.
            }
            sep = buffer.indexOf("\n\n");
          }
        }
        if (!assistantStarted) setError(streamError ?? "No response received. Please try again.");
      } else {
        const data = (await response.json()) as {
          reply?: string;
          error?: string;
          code?: string;
          remaining?: number | null;
        };
        if (data.reply) {
          const reply: string = data.reply;
          setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
          if (data.remaining !== undefined) setRemaining(data.remaining);
        } else if (data.code === "anonymous_limit") {
          setLoginPrompt(true);
          setNotice(data.error ?? null);
        } else if (data.code === "window_limit" || data.code === "burst_limit") {
          setNotice(data.error ?? null);
        } else {
          setError(data.error ?? "Something went wrong. Please try again.");
        }
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      busyRef.current = false;
      setBusy(false);
      // Turnstile tokens are single-use — remount for a fresh one.
      setTurnstileToken(undefined);
      setTurnstileNonce((n) => n + 1);
    }
  }

  const onToken = useCallback((token: string) => setTurnstileToken(token), []);

  const quotaLabel =
    remaining === null || remaining === undefined
      ? null
      : remaining > 0
        ? `${remaining} ${remaining === 1 ? "question" : "questions"} left`
        : "Limit reached";

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end">
      {open ? (
        <div className="mb-3 flex h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-lg border border-night-600 bg-night-900 shadow-2xl shadow-black/60">
          <div className="flex items-center justify-between border-b border-night-600 bg-night-800 px-4 py-3">
            <div>
              <div className="font-pixel text-xs text-pixel-cyan">NIGHTBEAM ASSISTANT</div>
              <div className="text-[11px] text-slate-500">Powered by DeepSeek — AI may make mistakes</div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded p-1 text-slate-400 hover:bg-night-700 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ${
                    message.role === "user"
                      ? "bg-night-700 text-white"
                      : "border border-night-600 bg-night-850 text-slate-200"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {busy ? (
              <div className="flex justify-start">
                <div className="rounded-lg border border-night-600 bg-night-850 px-3 py-2 text-sm text-slate-400">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
                  </span>
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-night-600 px-4 py-3">
            {loginPrompt ? (
              <div className="mb-3 rounded-lg border border-pixel-cyan/30 bg-night-800 p-3 text-center">
                <p className="mb-2 text-xs text-slate-300">
                  You&apos;ve used all your free questions. Sign in for 10 questions every 5 hours — or go Pro for unlimited!
                </p>
                <Link
                  href="/auth/login"
                  data-testid="chat-login-cta"
                  className="inline-block rounded-md bg-white px-4 py-1.5 text-xs font-semibold text-black hover:bg-slate-200"
                >
                  Sign in
                </Link>
              </div>
            ) : null}
            {notice ? <p data-testid="chat-notice" className="mb-2 text-xs text-slate-400">{notice}</p> : null}
            {error ? <p data-testid="chat-error" className="mb-2 text-xs text-red-400">{error}</p> : null}
            {publicConfig.turnstileSiteKey ? (
              <div key={turnstileNonce} className="mb-2">
                <Turnstile onToken={onToken} />
              </div>
            ) : null}
            <div className="flex gap-2">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    void send();
                  }
                }}
                placeholder={loggedIn ? "Ask about our mods…" : "Ask 2 questions free…"}
                disabled={busy}
                maxLength={2000}
                className="min-w-0 flex-1 rounded-md border border-night-500/60 bg-night-800 px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:border-pixel-cyan focus:outline-none"
              />
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                aria-label="Send message"
                className="rounded-md bg-white px-3 text-sm font-semibold text-black hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>
                {loggedIn ? (remaining === null || remaining === undefined ? "Free: 10 / 5h" : quotaLabel) : "Free: 2 before login"}
              </span>
              {!loggedIn ? (
                <Link href="/auth/register" className="hover:text-white">
                  Sign up
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
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
