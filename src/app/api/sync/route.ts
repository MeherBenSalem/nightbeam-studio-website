import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/helpers";
import { requirePermission } from "@/lib/auth/guards";
import { runBuiltByBitSync } from "@/lib/builtbybit/sync";
import { runCurseForgeSync } from "@/lib/curseforge/sync";
import { getRepo } from "@/lib/db/repo";

export async function GET(request: Request) {
  return withErrorHandling(async () => {
    const user = await requirePermission("sync.manage");
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const repo = await getRepo();
    const source = new URL(request.url).searchParams.get("source");
    if (source === "builtbybit") {
      return NextResponse.json(await repo.getSyncState("builtbybit"));
    }
    if (source === "curseforge") {
      return NextResponse.json(await repo.getSyncState("curseforge"));
    }
    const [curseforge, builtbybit] = await Promise.all([
      repo.getSyncState("curseforge"),
      repo.getSyncState("builtbybit"),
    ]);
    return NextResponse.json({ curseforge, builtbybit });
  }, "/api/sync", "GET");
}

export async function POST(request: Request) {
  return withErrorHandling(async () => {
    const user = await requirePermission("sync.manage");
    if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    const source = new URL(request.url).searchParams.get("source");
    if (source === "builtbybit") {
      return NextResponse.json(await runBuiltByBitSync());
    }
    if (source === "curseforge") {
      return NextResponse.json(await runCurseForgeSync());
    }
    const [curseforge, builtbybit] = await Promise.all([runCurseForgeSync(), runBuiltByBitSync()]);
    return NextResponse.json({ curseforge, builtbybit });
  }, "/api/sync", "POST");
}
