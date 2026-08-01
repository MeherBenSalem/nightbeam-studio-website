import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/helpers";
import { getRepo } from "@/lib/db/repo";
import { parseFilterParams } from "@/lib/utils/url-filters";

export async function GET(request: NextRequest) {
  return withErrorHandling(async () => {
    const repo = await getRepo();
    const result = await repo.listProjects(parseFilterParams(request.nextUrl.searchParams));
    return NextResponse.json(result);
  }, "/api/projects", "GET");
}
