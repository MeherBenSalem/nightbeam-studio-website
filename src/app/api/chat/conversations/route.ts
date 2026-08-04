import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { GUEST_COOKIE, parseGuestCookie } from "@/lib/chatbot/guest";
import { isChatbotEnabled } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Conversation list for the current identity, most recent first. */
export async function GET(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 503 });
  }

  const user = await requireUser();
  const repo = await getRepo();

  if (user) {
    const conversations = await repo.listChatConversations({ userId: user.id });
    return NextResponse.json({ conversations });
  }

  const guestId = parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value);
  if (!guestId) {
    return NextResponse.json({ conversations: [] });
  }
  const conversations = await repo.listChatConversations({ guestId });
  return NextResponse.json({ conversations });
}
