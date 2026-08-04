import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { parseJson } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { GUEST_COOKIE, parseGuestCookie } from "@/lib/chatbot/guest";
import { getRepo } from "@/lib/db/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const pinSchema = z.object({ pinned: z.boolean() });

function identityFrom(request: NextRequest, user: { id: string } | null) {
  return user
    ? { userId: user.id, guestId: null }
    : { userId: null, guestId: parseGuestCookie(request.cookies.get(GUEST_COOKIE)?.value) ?? null };
}

/** Pin/unpin a message in the current user's (or guest's) conversation. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await parseJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const parsed = pinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const user = await requireUser();
  const repo = await getRepo();
  const identity = identityFrom(request, user);
  const ok = await repo.updateChatMessagePin({ messageId: id, ...identity, pinned: parsed.data.pinned });
  if (!ok) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** Delete a message from the current user's (or guest's) conversation. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const repo = await getRepo();
  const identity = identityFrom(request, user);
  const ok = await repo.deleteChatMessage({ messageId: id, ...identity });
  if (!ok) return NextResponse.json({ error: "Message not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
