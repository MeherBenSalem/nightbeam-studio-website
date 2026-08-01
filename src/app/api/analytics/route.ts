import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api/helpers";
import { getServerEnv } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

const eventSchema = z.object({
  type: z.enum(["VIEW", "DOWNLOAD", "REDIRECT", "SEARCH", "FAVORITE", "FOLLOW", "SIGNUP", "LOGIN"]),
  projectSlug: z.string().min(1).max(120).optional(),
  path: z.string().max(500).optional(),
  search: z.string().max(120).optional(),
});

export async function POST(request: NextRequest) {
  return withErrorHandling(async () => {
    const env = getServerEnv();
    if (!env.ANALYTICS_ENABLED) return NextResponse.json({ ok: true });
    const body = (await request.json().catch(() => null)) as unknown;
    const parsed = eventSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid analytics event" }, { status: 400 });
    }
    const repo = await getRepo();
    let projectId: string | null = null;
    if (parsed.data.projectSlug) {
      const project = await repo.getProjectBySlug(parsed.data.projectSlug);
      projectId = project?.id ?? null;
    }
    await repo.recordAnalyticsEvent({
      type: parsed.data.type,
      projectId,
      sessionId: request.headers.get("x-nb-session") ?? null,
      path: parsed.data.path ?? request.nextUrl.pathname,
      referrer: request.headers.get("referer"),
    });
    return NextResponse.json({ ok: true });
  }, "/api/analytics", "POST");
}
