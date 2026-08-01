import { NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/helpers";
import { getRepo } from "@/lib/db/repo";

export async function GET() {
  return withErrorHandling(async () => {
    const repo = await getRepo();
    return NextResponse.json(await repo.getCommunityStats());
  }, "/api/community/stats", "GET");
}
