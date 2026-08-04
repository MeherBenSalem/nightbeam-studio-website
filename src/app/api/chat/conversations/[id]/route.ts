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

/** Pin/unpin all messages in a conversation for the current identity. */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await parseJson(request);
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const parsed = pinSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });

  const user = await requireUser();
  const repo = await getRepo();
  const identity = identityFrom(request, user);
  const ok = await repo.updateChatConversationPin({
    conversationId: id,
    ...identity,
    pinned: parsed.data.pinned,
  });
  if (!ok) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}

/** Delete all messages in a conversation for the current identity. */
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const repo = await getRepo();
  const identity = identityFrom(request, user);
  const ok = await repo.deleteChatConversation({ conversationId: id, ...identity });
  if (!ok) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
