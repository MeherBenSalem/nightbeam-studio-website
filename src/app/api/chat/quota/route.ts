import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { checkChatQuota } from "@/lib/chatbot/quota";
import { GUEST_COOKIE, makeGuestCookie, newGuestId, parseGuestCookie } from "@/lib/chatbot/guest";
import { isChatbotEnabled } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Quota status for the chat widget: { tier, used, limit, remaining }.
 * Anonymous visitors get a guest cookie here so the counter is stable.
 */
export async function GET(request: NextRequest) {
  if (!isChatbotEnabled()) {
    return NextResponse.json({ enabled: false }, { status: 503 });
  }

  const user = await requireUser();
  const repo = await getRepo();
  let isPro = false;
  let role: string | null = null;
  if (user) {
    const fresh = await repo.getUserById(user.id);
    if (!fresh || fresh.isBanned) {
      return NextResponse.json({ tier: "anonymous", used: 0, limit: 0, remaining: 0 }, { status: 200 });
    }
    isPro = fresh.isPro;
    role = fresh.role;
  }

  const existingGuest = parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value);
  const guestId = user ? null : (existingGuest ?? newGuestId());

  const quota = await checkChatQuota(
    { userId: user?.id ?? null, guestId: user ? null : guestId, role, isPro },
    { includeBurst: false },
  );

  const response = NextResponse.json({
    tier: quota.tier,
    used: quota.used,
    limit: quota.limit,
    remaining: Number.isFinite(quota.remaining) ? quota.remaining : null,
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
