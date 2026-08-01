import "server-only";
import { NextResponse } from "next/server";
import { getRepo } from "@/lib/db/repo";

export function jsonError(message: string, status = 400): NextResponse {
  return NextResponse.json({ error: message }, { status });
}

export function withErrorHandling(
  handler: () => Promise<NextResponse>,
  route: string,
  method: string,
): Promise<NextResponse> {
  return handler().catch(async (error: unknown) => {
    const message = error instanceof Error ? error.message : "Unknown error";
    try {
      const repo = await getRepo();
      await repo.logApiError({
        route,
        method,
        status: 500,
        message,
        stack: error instanceof Error ? (error.stack ?? null) : null,
      });
    } catch {
      // Logging must never break the response path.
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  });
}

export async function parseJson(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return typeof body === "object" && body !== null ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
