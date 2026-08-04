import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { getServerEnv } from "@/lib/config/env";

// Tamper-proof anonymous guest identity. The cookie holds `<id>.<hmac>`;
// the HMAC key is the server secret, so users cannot forge or extend
// their anonymous quota.

export const GUEST_COOKIE = "nba_guest";

function guestSecret(): string {
  return getServerEnv().AUTH_SECRET ?? "nightbeam-chat-guest";
}

function signGuestId(id: string): string {
  return createHmac("sha256", guestSecret()).update(id).digest("hex");
}

export function parseGuestCookie(value: string | undefined): string | null {
  if (!value) return null;
  const sep = value.lastIndexOf(".");
  if (sep <= 0) return null;
  const id = value.slice(0, sep);
  const sig = value.slice(sep + 1);
  const expected = signGuestId(id);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  return id;
}

export function makeGuestCookie(id: string): string {
  return `${id}.${signGuestId(id)}`;
}

export function newGuestId(): string {
  return randomBytes(16).toString("hex");
}
