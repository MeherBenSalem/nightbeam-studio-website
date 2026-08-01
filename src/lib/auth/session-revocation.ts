import "server-only";
import { createCache } from "@/lib/curseforge/cache";

const revocationCache = createCache({ prefix: "revoked:", ttl: 60 * 60 * 24 * 30 });

export async function revokeAllSessions(userId: string, newVersion: number): Promise<void> {
  await revocationCache.set(userId, newVersion, 60 * 60 * 24 * 30);
}

export async function isSessionRevoked(userId: string | undefined, version: number | undefined): Promise<boolean> {
  if (!userId || !version) return false;
  const revoked = await revocationCache.get<number>(userId);
  return revoked !== null && version < revoked;
}
