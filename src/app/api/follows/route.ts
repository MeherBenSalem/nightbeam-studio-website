import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJson, withErrorHandling } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

const slugSchema = z.object({ slug: z.string().min(1).max(120) });

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user) return jsonError("Sign in required", 401);
    const repo = await getRepo();
    return NextResponse.json({ items: await repo.listFollows(user.id) });
  }, "/api/follows", "GET");
}

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user) return jsonError("Sign in required", 401);
    const body = await parseJson(request);
    const parsed = slugSchema.safeParse(body);
    if (!parsed.success) return jsonError("A project slug is required");
    const repo = await getRepo();
    const added = await repo.toggleFollow(user.id, parsed.data.slug, true);
    if (!added) return jsonError("Project not found", 404);
    await repo.recordAnalyticsEvent({ type: "FOLLOW", userId: user.id, path: `/projects/${parsed.data.slug}` });
    return NextResponse.json({ follow: true });
  }, "/api/follows", "POST");
}

export async function DELETE(request: NextRequest) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user) return jsonError("Sign in required", 401);
    const body = await parseJson(request);
    const parsed = slugSchema.safeParse(body);
    if (!parsed.success) return jsonError("A project slug is required");
    const repo = await getRepo();
    await repo.toggleFollow(user.id, parsed.data.slug, false);
    return NextResponse.json({ follow: false });
  }, "/api/follows", "DELETE");
}
