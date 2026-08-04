import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { verifyTurnstile } from "@/lib/auth/turnstile";
import { acquireChatSlot, checkChatQuota, releaseChatSlot } from "@/lib/chatbot/quota";
import { evaluateTopic } from "@/lib/chatbot/guard";
import { buildCatalogIndex, getKnowledgeDocs } from "@/lib/chatbot/knowledge";
import { buildChatMessages, buildKnowledgeBlock, buildSystemPrompt, REFUSAL_MESSAGE } from "@/lib/chatbot/prompt";
import { buildRetrievalQuery, chunkAll, retrieveChunks } from "@/lib/chatbot/retrieval";
import { streamDeepSeekChat } from "@/lib/chatbot/deepseek";
import type { ChatHistoryItem, ChatUsage } from "@/lib/chatbot/types";
import { getServerEnv, isChatbotEnabled } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import { GUEST_COOKIE, makeGuestCookie, newGuestId, parseGuestCookie } from "@/lib/chatbot/guest";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(2000),
      }),
    )
    .max(6)
    .default([]),
  turnstileToken: z.string().optional(),
});

// --- SSE helpers --------------------------------------------------------

function encodeSSE(event: string, data: unknown): Uint8Array {
  return new TextEncoder().encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  if (!isChatbotEnabled()) return jsonError("Chat is not available right now.", 503);

  const body = await parseJson(request);
  if (!body) return jsonError("Invalid request", 400);
  const parsed = chatRequestSchema.safeParse(body);
  if (!parsed.success) return jsonError("Message must be 1–2000 characters.", 400);

  const turnstile = await verifyTurnstile(parsed.data.turnstileToken);
  if (!turnstile.ok) return jsonError("Could not verify you are human. Please try again.", 403);

  const user = await requireUser();
  const repo = await getRepo();
  let isPro = false;
  let role: string | null = null;
  if (user) {
    const fresh = await repo.getUserById(user.id);
    if (!fresh || fresh.isBanned) return jsonError("Your account is not available.", 403);
    isPro = fresh.isPro;
    role = fresh.role;
  }

  // Anonymous identity: signed HttpOnly cookie, created on first visit.
  const existingGuest = parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value);
  const guestId = user ? null : (existingGuest ?? newGuestId());
  const identityKey = user?.id ?? guestId ?? "unknown";

  const quota = await checkChatQuota({ userId: user?.id ?? null, guestId: user ? null : guestId, role, isPro });
  if (!quota.allowed) {
    const message =
      quota.reason === "anonymous_limit"
        ? "You've used all your free questions. Sign in to keep chatting!"
        : quota.reason === "burst_limit"
          ? "You're sending messages too quickly. Please wait a moment."
          : quota.reason === "concurrency"
            ? "You already have an answer in progress."
            : "You've reached the limit for this window. Check back later!";
    return NextResponse.json({ error: message, code: quota.reason }, { status: 429 });
  }

  if (!acquireChatSlot(identityKey)) {
    return jsonError("You already have an answer in progress.", 429);
  }

  const startTime = Date.now();
  let assistantReply = "";
  let usage: ChatUsage = { promptTokens: 0, completionTokens: 0 };

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Persist the user's question first — quota is counted even when
        // the generation fails (abuse protection).
        await repo.addChatMessage({
          userId: user?.id ?? null,
          guestId: user ? null : guestId,
          role: "user",
          content: parsed.data.message,
        });

        // Topic gate: rule pre-filter + guard model. Refusals never call
        // the generation model (cost + safety).
        const verdict = await evaluateTopic(parsed.data.message);
        if (!verdict.allowed) {
          const remaining = quota.remaining > 0 ? quota.remaining - 1 : 0;
          await repo.addChatMessage({
            userId: user?.id ?? null,
            guestId: user ? null : guestId,
            role: "assistant",
            content: REFUSAL_MESSAGE,
            topic: "off_topic",
          });
          controller.enqueue(encodeSSE("delta", { content: REFUSAL_MESSAGE }));
          controller.enqueue(encodeSSE("done", { usage: { promptTokens: 0, completionTokens: 0 }, remaining }));
          controller.close();
          return;
        }

        // Knowledge assembly.
        const docs = await getKnowledgeDocs();
        const chunks = chunkAll(docs);
        // Follow-ups ("no, for the configs") inherit the previous user
        // message so retrieval targets the same topic.
        const historyUsers = (parsed.data.history as ChatHistoryItem[])
          .filter((item) => item.role === "user")
          .map((item) => item.content);
        const retrievalQuery = buildRetrievalQuery(
          parsed.data.message,
          historyUsers[historyUsers.length - 1],
        );
        const hits = retrieveChunks(retrievalQuery, chunks, 8);
        const env = getServerEnv();
        const knowledgeBlock = buildKnowledgeBlock(hits, env.CHATBOT_MAX_CONTEXT_TOKENS);
        const catalogIndex = await buildCatalogIndex();
        const systemPrompt = buildSystemPrompt(catalogIndex, knowledgeBlock);
        const messages = buildChatMessages({
          systemPrompt,
          history: parsed.data.history as ChatHistoryItem[],
          userMessage: parsed.data.message,
        });

        const upstream = await streamDeepSeekChat({
          messages,
          signal: request.signal,
        });
        const reader = upstream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          let sep = buffer.indexOf("\n\n");
          while (sep !== -1) {
            const eventBlock = buffer.slice(0, sep);
            buffer = buffer.slice(sep + 2);
            const dataLine = eventBlock.split("\n").find((line) => line.startsWith("data:"));
            if (dataLine) {
              try {
                const payload = JSON.parse(dataLine.slice(5).trim()) as {
                  content?: string;
                  usage?: ChatUsage;
                  message?: string;
                };
                if (typeof payload.content === "string") {
                  assistantReply += payload.content;
                  controller.enqueue(encodeSSE("delta", { content: payload.content }));
                }
                if (payload.usage) usage = payload.usage;
                if (payload.message) {
                  controller.enqueue(encodeSSE("error", { message: payload.message }));
                }
              } catch {
                // Ignore malformed frames.
              }
            }
            sep = buffer.indexOf("\n\n");
          }
        }

        // Persist the assistant reply for audit + quota bookkeeping.
        if (assistantReply) {
          await repo.addChatMessage({
            userId: user?.id ?? null,
            guestId: user ? null : guestId,
            role: "assistant",
            content: assistantReply,
            topic: "project",
            model: env.CHATBOT_MODEL,
            promptTokens: usage.promptTokens,
            completionTokens: usage.completionTokens,
            durationMs: Date.now() - startTime,
          });
        }

        const remaining = quota.remaining > 0 ? quota.remaining - 1 : quota.remaining;
        controller.enqueue(encodeSSE("done", { usage, remaining, tier: quota.tier }));
        controller.close();
      } catch {
        try {
          controller.enqueue(encodeSSE("error", { message: "The assistant hit an error. Please try again." }));
        } catch {
          // Controller already closed.
        }
        controller.close();
      } finally {
        releaseChatSlot(identityKey);
      }
    },
  });

  const response = new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });

  if (!user && guestId) {
    response.cookies.set(GUEST_COOKIE, makeGuestCookie(guestId), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  return response;
}
