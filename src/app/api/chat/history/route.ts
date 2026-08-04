import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { GUEST_COOKIE, parseGuestCookie } from "@/lib/chatbot/guest";
import { isChatbotEnabled } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Recent chat history for the current identity (logged-in user or the
 * signed guest cookie). Returns messages oldest-first, up to 50.
 */
export async function GET(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 503 });
  }

  const user = await requireUser();
  const repo = await getRepo();

  if (user) {
    const rows = await repo.listChatMessages({ userId: user.id, limit: 50 });
    return NextResponse.json({
      messages: rows.map((row) => ({ role: row.role, content: row.content, createdAt: row.createdAt })),
    });
  }

  // Guests: history follows the signed guest cookie (no cookie yet → empty).
  const existingGuest = parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value);
  if (!existingGuest) {
    return NextResponse.json({ messages: [] });
  }
  const rows = await repo.listChatMessages({ guestId: existingGuest, limit: 50 });
  return NextResponse.json({
    messages: rows.map((row) => ({ role: row.role, content: row.content, createdAt: row.createdAt })),
  });
}
