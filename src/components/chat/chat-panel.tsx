"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Turnstile } from "@/components/auth/turnstile";
import { publicConfig } from "@/lib/public-config";
import type { ChatHistoryItem, ChatTier } from "@/lib/chatbot/types";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatQuotaStatus {
  tier: ChatTier;
  used: number;
  limit: number | null;
  remaining: number | null;
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the NightBeam Assistant. Ask me anything about our mods — RPG Attribute System (installation, config, commands, permissions) or The Birth of Steve!",
};

function quotaLine(quota: ChatQuotaStatus | null, loggedIn: boolean): string {
  if (!quota || quota.tier === "pro") return "Pro · unlimited questions";
  if (quota.tier === "anonymous") {
    if (quota.remaining === null) return loggedIn ? "Free tier" : "Free questions";
    const left = quota.remaining;
    return `${left} free ${left === 1 ? "question" : "questions"} left${loggedIn ? "" : " · sign in for more"}`;
  }
  // logged-in free tier: 10 questions per rolling 5h window
  const left = quota.remaining ?? 0;
  const limit = quota.limit ?? 10;
  return `${left} of ${limit} free questions left · resets every 5 hours`;
}

export function ChatPanel({
  mode,
  user,
  onClose,
}: {
  mode: "floating" | "full";
  user: { id: string; role: string } | null;
  onClose?: () => void;
}) {
  const { data: session } = useSession();
  // Server-rendered prop is authoritative; useSession covers client-side
  // session changes after soft navigation.
  const loggedIn = Boolean(user ?? session?.user);

  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loginPrompt, setLoginPrompt] = useState(false);
  const [quota, setQuota] = useState<ChatQuotaStatus | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Refresh the quota display whenever the panel mounts (i.e. opens).
  useEffect(() => {
    let cancelled = false;
    fetch("/api/chat/quota", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.tier === "string") setQuota(data as ChatQuotaStatus);
      })
      .catch(() => {
        // Quota is cosmetic — ignore failures.
      });
    return () => {
      cancelled = true;
    };
  }, []);

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
                tier?: ChatTier;
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
              if (data.remaining !== undefined && data.tier) {
                setQuota((prev) => ({
                  tier: data.tier as ChatTier,
                  used: prev?.used ?? 0,
                  limit: prev?.limit ?? null,
                  remaining: data.remaining ?? 0,
                }));
              }
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
          if (data.remaining !== undefined)
            setQuota((prev) => (prev ? { ...prev, remaining: data.remaining ?? 0 } : prev));
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

  return (
    <div
      className={
        mode === "full"
          ? "flex h-full flex-col overflow-hidden rounded-xl border border-night-600 bg-night-900 shadow-2xl shadow-black/60"
          : "mb-3 flex h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-lg border border-night-600 bg-night-900 shadow-2xl shadow-black/60"
      }
    >
      <div className="flex items-center justify-between gap-2 border-b border-night-600 bg-night-800 px-4 py-3">
        <div className="min-w-0">
          <div className="font-pixel text-xs text-pixel-cyan">NIGHTBEAM ASSISTANT</div>
          <div data-testid="chat-quota" className="truncate text-[11px] text-slate-400">
            {quota ? quotaLine(quota, loggedIn) : "Checking quota…"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {mode === "floating" ? (
            <Link
              href="/chat"
              aria-label="Expand chat to full page"
              title="Expand to full page"
              className="rounded p-1 text-slate-400 hover:bg-night-700 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          ) : (
            <Link
              href="/"
              aria-label="Back to site"
              title="Back to site"
              className="rounded p-1 text-slate-400 hover:bg-night-700 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          )}
          {mode === "floating" ? (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close chat"
              className="rounded p-1 text-slate-400 hover:bg-night-700 hover:text-white"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          ) : null}
        </div>
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
        {!loggedIn ? (
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>Free: {quota?.remaining ?? 2} questions before login</span>
            <Link href="/auth/register" className="hover:text-white">
              Sign up
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
