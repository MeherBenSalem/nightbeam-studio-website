import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { GUEST_COOKIE, parseGuestCookie } from "@/lib/chatbot/guest";
import { isChatbotEnabled } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Chat history for the current identity. With ?conversationId=X it returns
 * that conversation's messages (oldest-first, up to 50); without it, the
 * most recent conversation's messages (or an empty list).
 */
export async function GET(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 503 });
  }

  const conversationId = request.nextUrl.searchParams.get("conversationId")?.trim() ?? null;
  if (conversationId !== null && !/^[a-zA-Z0-9-]{8,80}$/.test(conversationId)) {
    return NextResponse.json({ messages: [] });
  }

  const user = await requireUser();
  const repo = await getRepo();

  if (user) {
    let id = conversationId;
    if (!id) {
      const conversations = await repo.listChatConversations({ userId: user.id });
      id = conversations[0]?.id ?? null;
    }
    if (!id) return NextResponse.json({ messages: [] });
    const rows = await repo.listChatMessages({ userId: user.id, conversationId: id, limit: 50 });
    return NextResponse.json({
      conversationId: id,
      messages: rows.map((row) => ({
        id: row.id,
        role: row.role,
        content: row.content,
        pinned: row.pinned,
        createdAt: row.createdAt,
      })),
    });
  }

  const guestId = parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value);
  if (!guestId) return NextResponse.json({ messages: [] });
  let id = conversationId;
  if (!id) {
    const conversations = await repo.listChatConversations({ guestId });
    id = conversations[0]?.id ?? null;
  }
  if (!id) return NextResponse.json({ messages: [] });
  const rows = await repo.listChatMessages({ guestId, conversationId: id, limit: 50 });
  return NextResponse.json({
    conversationId: id,
    messages: rows.map((row) => ({
      id: row.id,
      role: row.role,
      content: row.content,
      pinned: row.pinned,
      createdAt: row.createdAt,
    })),
  });
}
