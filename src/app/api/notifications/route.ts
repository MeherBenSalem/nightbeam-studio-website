import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJson, withErrorHandling } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

const markSchema = z.object({ ids: z.array(z.string()).max(100).optional() });

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user) return jsonError("Sign in required", 401);
    const repo = await getRepo();
    const [items, unread] = await Promise.all([repo.listNotifications(user.id), repo.getUnreadCount(user.id)]);
    return NextResponse.json({ items, unread });
  }, "/api/notifications", "GET");
}

export async function PATCH(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user) return jsonError("Sign in required", 401);
    const body = await parseJson(request);
    const parsed = markSchema.safeParse(body);
    if (!parsed.success) return jsonError("Invalid payload");
    const repo = await getRepo();
    await repo.markNotificationsRead(user.id, parsed.data.ids);
    return NextResponse.json({ ok: true });
  }, "/api/notifications", "PATCH");
}
