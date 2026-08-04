import "server-only";
import { checkRateLimit } from "@/lib/auth/rate-limit";
import { getProRoles, getServerEnv } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import type { ChatQuotaResult } from "@/lib/chatbot/types";

export interface ChatQuotaInput {
  userId: string | null;
  guestId: string | null;
  role: string | null;
  isPro: boolean;
}

/**
 * Pure window check — the quota decision for a single counter.
 * Exported for unit testing.
 */
export function windowQuota(used: number, limit: number): { allowed: boolean; remaining: number } {
  return { allowed: used < limit, remaining: Math.max(0, limit - used) };
}

/** In-flight concurrency guard (per identity, in-process). */
const inFlight = new Map<string, number>();
const MAX_IN_FLIGHT = 2;

export function acquireChatSlot(key: string): boolean {
  const current = inFlight.get(key) ?? 0;
  if (current >= MAX_IN_FLIGHT) return false;
  inFlight.set(key, current + 1);
  return true;
}

export function releaseChatSlot(key: string): void {
  const current = inFlight.get(key) ?? 0;
  if (current <= 1) inFlight.delete(key);
  else inFlight.set(key, current - 1);
}

export async function checkChatQuota(
  input: ChatQuotaInput,
  options: { includeBurst?: boolean } = {},
): Promise<ChatQuotaResult> {
  const env = getServerEnv();
  const identity = input.userId ?? input.guestId ?? "unknown";
  const proRoles = getProRoles();
  const isPro = input.isPro || (input.role !== null && proRoles.has(input.role));

  // Burst limit applies to everyone (cost protection). Read-only status
  // checks (quota display) skip it so they don't consume burst allowance.
  const includeBurst = options.includeBurst ?? true;
  if (includeBurst) {
    const burst = await checkRateLimit(`chat:burst:${identity}`, 5, 60_000);
    if (!burst.ok) {
      return { allowed: false, tier: isPro ? "pro" : input.userId ? "free" : "anonymous", used: 0, limit: null, remaining: 0, reason: "burst_limit" };
    }
  }

  if (isPro) {
    return { allowed: true, tier: "pro", used: 0, limit: null, remaining: Infinity };
  }

  const repo = await getRepo();
  if (input.userId) {
    const since = new Date(Date.now() - env.CHATBOT_FREE_WINDOW_MS);
    const used = await repo.countChatMessagesByUser(input.userId, since);
    const { allowed, remaining } = windowQuota(used, env.CHATBOT_FREE_WINDOW_LIMIT);
    return {
      allowed,
      tier: "free",
      used,
      limit: env.CHATBOT_FREE_WINDOW_LIMIT,
      remaining,
      reason: allowed ? "ok" : "window_limit",
    };
  }

  if (input.guestId) {
    const used = await repo.countChatMessagesByGuest(input.guestId);
    const { allowed, remaining } = windowQuota(used, env.CHATBOT_ANON_LIMIT);
    return {
      allowed,
      tier: "anonymous",
      used,
      limit: env.CHATBOT_ANON_LIMIT,
      remaining,
      reason: allowed ? "ok" : "anonymous_limit",
    };
  }

  return { allowed: false, tier: "anonymous", used: 0, limit: 0, remaining: 0, reason: "anonymous_limit" };
}
