import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { verifyTurnstile } from "@/lib/auth/turnstile";
import { deepSeekJson } from "@/lib/chatbot/deepseek";
import { GUEST_COOKIE, parseGuestCookie } from "@/lib/chatbot/guest";
import { isChatbotEnabled } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const compactSchema = z.object({
  conversationId: z.string().regex(/^[a-zA-Z0-9-]{8,80}$/),
  turnstileToken: z.string().optional(),
});

const SUMMARY_SYSTEM_PROMPT = `You are helping a support chat for NightBeam Studio (Minecraft mods). The user asked to compact a long conversation and start a new one.

Summarize the conversation below in under 120 words as a single plain paragraph. Keep: the user's main question(s), the key answer (config paths, commands, API methods), and any open follow-ups. Do not use markdown. Write in English.`;

/**
 * Compacts a conversation: summarizes it with the model, saves the summary
 * as the first message of a NEW conversation, and returns the new id so the
 * client can switch to it. The old conversation stays intact in the sidebar.
 */
export async function POST(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return NextResponse.json({ error: "Chat is not available right now." }, { status: 503 });
  }

  const body = await parseJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const parsed = compactSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid conversation" }, { status: 400 });

  const turnstile = await verifyTurnstile(parsed.data.turnstileToken);
  if (!turnstile.ok) return NextResponse.json({ error: "Could not verify you are human." }, { status: 403 });

  const user = await requireUser();
  const repo = await getRepo();

  // Load the source conversation (identity-scoped).
  let rows;
  if (user) {
    rows = await repo.listChatMessages({ userId: user.id, conversationId: parsed.data.conversationId, limit: 100 });
  } else {
    const guestId = parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value);
    if (!guestId) return NextResponse.json({ error: "No conversation found" }, { status: 404 });
    rows = await repo.listChatMessages({ guestId, conversationId: parsed.data.conversationId, limit: 100 });
  }
  if (rows.length === 0) return NextResponse.json({ error: "No conversation found" }, { status: 404 });

  // Summarize with the model (best-effort — fall back to a plain new chat).
  const transcript = rows
    .slice(-40)
    .map((row) => `${row.role === "user" ? "User" : "Assistant"}: ${row.content.slice(0, 600)}`)
    .join("\n\n");
  let summary = "";
  try {
    const result = await deepSeekJson({
      messages: [
        { role: "system", content: SUMMARY_SYSTEM_PROMPT },
        { role: "user", content: transcript },
      ],
      maxTokens: 220,
      temperature: 0.2,
    });
    summary = (result?.content ?? "").trim();
  } catch {
    summary = "";
  }

  const newConversationId = crypto.randomUUID();
  const summaryMessage = summary
    ? `**Summary of your previous conversation:**\n${summary}`
    : "Here's a fresh conversation. The previous one is saved in the sidebar.";
  await repo.addChatMessage({
    conversationId: newConversationId,
    userId: user?.id ?? null,
    guestId: user ? null : (parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value) ?? null),
    role: "assistant",
    content: summaryMessage,
  });

  return NextResponse.json({ conversationId: newConversationId, summary });
}
