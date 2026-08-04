"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Turnstile } from "@/components/auth/turnstile";
import { ChatMarkdown } from "@/components/chat/chat-markdown";
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

export interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! I'm the NightBeam Assistant. Ask me anything about our mods — RPG Attribute System (installation, config, commands, permissions) or The Birth of Steve!",
};

function newConversationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `conv-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function formatRelativeTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function estimateTokens(content: string): number {
  return Math.ceil(content.length / 4);
}

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
  const [conversations, setConversations] = useState<ConversationSummary[] | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [compacting, setCompacting] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>(undefined);
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef(true);
  const busyRef = useRef(false);
  const loadedRef = useRef(false);

  // Estimated conversation length (client-side token approximation).
  const estimatedTokens = useMemo(
    () => messages.reduce((sum, m) => sum + estimateTokens(m.content), 0),
    [messages],
  );
  const tooLong = activeConversationId !== null && estimatedTokens > publicConfig.chatbotCompactAtTokens;

  // Scroll the message list only (never the page) when new content arrives,
  // and only if the user was already near the bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && pinnedRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, busy]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    pinnedRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  }, []);

  const refreshConversations = useCallback(async () => {
    try {
      const response = await fetch("/api/chat/conversations", { cache: "no-store" });
      if (!response.ok) return;
      const data = (await response.json()) as { conversations?: ConversationSummary[] };
      if (Array.isArray(data.conversations)) setConversations(data.conversations);
    } catch {
      // Cosmetic — ignore failures.
    }
  }, []);

  const loadConversation = useCallback(async (conversationId: string) => {
    setActiveConversationId(conversationId);
    setSidebarOpen(false);
    setError(null);
    setLoginPrompt(false);
    pinnedRef.current = true;
    try {
      const response = await fetch(`/api/chat/history?conversationId=${encodeURIComponent(conversationId)}`, {
        cache: "no-store",
      });
      if (!response.ok) {
        setMessages([WELCOME]);
        return;
      }
      const data = (await response.json()) as { messages?: Array<{ role: string; content: string }> };
      const history = data.messages ?? [];
      setMessages(
        history.length > 0
          ? history.map((m) => ({ role: m.role === "user" ? "user" : "assistant", content: m.content }))
          : [WELCOME],
      );
    } catch {
      setMessages([WELCOME]);
    }
  }, []);

  // Initial load: quota + conversation list + the most recent conversation.
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    let cancelled = false;

    fetch("/api/chat/quota", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.tier === "string") setQuota(data as ChatQuotaStatus);
      })
      .catch(() => {
        // Quota is cosmetic — ignore failures.
      });

    (async () => {
      try {
        const response = await fetch("/api/chat/conversations", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { conversations?: ConversationSummary[] };
        const list = data.conversations ?? [];
        if (cancelled) return;
        setConversations(list);
        if (list.length > 0) {
          await loadConversation(list[0].id);
        }
      } catch {
        // Fall back to the legacy flat history so saved chats still show.
        try {
          const response = await fetch("/api/chat/history", { cache: "no-store" });
          if (!response.ok) return;
          const data = (await response.json()) as { messages?: Array<{ role: string; content: string }> };
          const history = (data.messages ?? []).filter((m) => m.role === "user" || m.role === "assistant");
          if (!cancelled && history.length > 0) {
            setMessages(history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
          }
        } catch {
          // No history available — welcome message stays.
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    pinnedRef.current = true;

    // Every message belongs to a conversation; start one lazily.
    const conversationId = activeConversationId ?? newConversationId();
    if (!activeConversationId) setActiveConversationId(conversationId);

    const history: ChatHistoryItem[] = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .slice(-6)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { role: "user", content: message }]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationId, history, turnstileToken }),
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
      setTurnstileToken(undefined);
      setTurnstileNonce((n) => n + 1);
      // The conversation list may have gained/changed a conversation.
      void refreshConversations();
    }
  }

  function startNewConversation() {
    setActiveConversationId(newConversationId());
    setMessages([WELCOME]);
    setError(null);
    setNotice(null);
    setLoginPrompt(false);
    setSidebarOpen(false);
    pinnedRef.current = true;
  }

  async function compactAndStartNew() {
    if (compacting || !activeConversationId) return;
    setCompacting(true);
    try {
      const response = await fetch("/api/chat/compact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId: activeConversationId, turnstileToken }),
      });
      if (response.ok) {
        const data = (await response.json()) as { conversationId?: string };
        if (data.conversationId) {
          await loadConversation(data.conversationId);
          await refreshConversations();
          return;
        }
      }
    } catch {
      // Fall through to a plain new conversation.
    } finally {
      setCompacting(false);
    }
    startNewConversation();
    void refreshConversations();
  }

  const onToken = useCallback((token: string) => setTurnstileToken(token), []);

  const sidebarContent = (
    <>
      <div className="p-3">
        <button
          type="button"
          onClick={startNewConversation}
          disabled={busy}
          className="w-full rounded-md bg-white px-3 py-2 text-sm font-semibold text-black hover:bg-slate-200 disabled:opacity-50"
        >
          + New conversation
        </button>
      </div>
      <div className="flex-1 space-y-1 overflow-y-auto px-2 pb-3">
        {conversations === null ? (
          <p className="px-2 py-1 text-xs text-slate-500">Loading conversations…</p>
        ) : conversations.length === 0 ? (
          <p className="px-2 py-1 text-xs text-slate-500">No conversations yet.</p>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              type="button"
              onClick={() => void loadConversation(conversation.id)}
              disabled={busy}
              className={`w-full rounded-md px-2 py-2 text-left transition-colors disabled:opacity-50 ${
                conversation.id === activeConversationId
                  ? "bg-night-800 text-white"
                  : "text-slate-300 hover:bg-night-800/60"
              }`}
            >
              <span className="block truncate text-xs font-medium">{conversation.title || "New conversation"}</span>
              <span className="block text-[10px] text-slate-500">
                {formatRelativeTime(conversation.updatedAt)}
                {conversation.messageCount > 0 ? ` · ${conversation.messageCount} messages` : ""}
              </span>
            </button>
          ))
        )}
      </div>
    </>
  );

  return (
    <div
      className={
        mode === "full"
          ? "flex h-full overflow-hidden bg-night-900"
          : "mb-3 flex h-[560px] w-[min(92vw,380px)] flex-col overflow-hidden rounded-lg border border-night-600 bg-night-900 shadow-2xl shadow-black/60"
      }
    >
      {mode === "full" ? (
        <>
          {/* Desktop sidebar */}
          <aside className="hidden w-64 shrink-0 flex-col border-r border-night-600 bg-night-950 md:flex">
            {sidebarContent}
          </aside>
          {/* Mobile sidebar drawer */}
          {sidebarOpen ? (
            <div className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
              <aside className="absolute left-0 top-0 flex h-full w-72 flex-col border-r border-night-600 bg-night-950 shadow-2xl">
                <div className="flex items-center justify-between border-b border-night-600 px-3 py-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Conversations</span>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    aria-label="Close conversations"
                    className="rounded p-1 text-slate-400 hover:bg-night-700 hover:text-white"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
                <div className="flex min-h-0 flex-1 flex-col">{sidebarContent}</div>
              </aside>
            </div>
          ) : null}
        </>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-2 border-b border-night-600 bg-night-800 px-4 py-3">
          <div className="flex min-w-0 items-center gap-2">
            {mode === "full" ? (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open conversations"
                className="rounded p-1 text-slate-400 hover:bg-night-700 hover:text-white md:hidden"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5" aria-hidden>
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              </button>
            ) : null}
            <div className="min-w-0">
              <div className="font-pixel text-xs text-pixel-cyan">NIGHTBEAM ASSISTANT</div>
              <div data-testid="chat-quota" className="truncate text-[11px] text-slate-400">
                {quota ? quotaLine(quota, loggedIn) : "Checking quota…"}
              </div>
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

        <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto">
          <div className={mode === "full" ? "mx-auto w-full max-w-3xl space-y-3 px-4 py-4 sm:px-6" : "space-y-3 px-4 py-4"}>
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={
                    message.role === "user"
                      ? "max-w-[85%] whitespace-pre-wrap rounded-lg bg-night-700 px-3 py-2 text-sm text-white"
                      : "max-w-[85%] rounded-lg border border-night-600 bg-night-850 px-3 py-2 text-sm leading-relaxed text-slate-200"
                  }
                >
                  {message.role === "user" ? message.content : <ChatMarkdown content={message.content} />}
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
          </div>
        </div>

        <div className="border-t border-night-600">
          <div className={mode === "full" ? "mx-auto w-full max-w-3xl px-4 py-3 sm:px-6" : "px-4 py-3"}>
            {tooLong ? (
              <div data-testid="chat-compact" className="mb-3 rounded-lg border border-amber-500/40 bg-amber-950/30 p-3">
                <p className="mb-2 text-xs text-amber-200">
                  This conversation is getting long. Start a new one to keep answers fast — the current chat is saved in
                  the sidebar.
                </p>
                <button
                  type="button"
                  onClick={() => void compactAndStartNew()}
                  disabled={compacting || busy}
                  className="rounded-md bg-amber-400 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
                >
                  {compacting ? "Compacting…" : "Compact & start new conversation"}
                </button>
              </div>
            ) : null}
            {loginPrompt ? (
              <div className="mb-3 rounded-lg border border-pixel-cyan/30 bg-night-800 p-3 text-center">
                <p className="mb-2 text-xs text-slate-300">
                  You&apos;ve used all your free questions. Sign in for 10 questions every 5 hours — or go Pro for
                  unlimited!
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
            {notice ? (
              <p data-testid="chat-notice" className="mb-2 text-xs text-slate-400">
                {notice}
              </p>
            ) : null}
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
      </div>
    </div>
  );
}
