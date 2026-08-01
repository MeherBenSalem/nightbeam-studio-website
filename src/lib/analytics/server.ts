import "server-only";
import { getServerEnv } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import type { EventType } from "@/lib/db/types";

export async function trackEvent(input: {
  type: EventType;
  userId?: string | null;
  projectId?: string | null;
  sessionId?: string | null;
  path?: string | null;
  referrer?: string | null;
}): Promise<void> {
  const env = getServerEnv();
  if (!env.ANALYTICS_ENABLED) return;
  const repo = await getRepo();
  await repo.recordAnalyticsEvent(input);
}
