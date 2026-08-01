import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/helpers";
import { requirePermission } from "@/lib/auth/guards";
import { runCurseForgeSync } from "@/lib/curseforge/sync";
import { getRepo } from "@/lib/db/repo";

export async function GET() {
  return withErrorHandling(async () => {
    const user = await requirePermission("sync.manage");
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const repo = await getRepo();
    return NextResponse.json(await repo.getSyncState("curseforge"));
  }, "/api/sync", "GET");
}

export async function POST() {
  return withErrorHandling(async () => {
    const user = await requirePermission("sync.manage");
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const state = await runCurseForgeSync();
    return NextResponse.json(state);
  }, "/api/sync", "POST");
}
