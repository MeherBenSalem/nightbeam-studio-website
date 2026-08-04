import { NextResponse } from "next/server";
import { getServerEnv } from "@/lib/config/env";
import { getDataBackendLabel, getRepo } from "@/lib/db/repo";

export async function GET() {
  const timestamp = new Date().toISOString();
  let status: "ok" | "degraded" = "ok";

  try {
    await getRepo();
    const env = getServerEnv();
    if (env.DATA_BACKEND === "prisma") {
      const backend = await getDataBackendLabel();
      if (backend === "memory") status = "degraded";
    }
  } catch {
    status = "degraded";
  }

  return NextResponse.json({ ok: true, status, timestamp });
}
