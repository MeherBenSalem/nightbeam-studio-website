import "server-only";
import { isTurnstileConfigured, getServerEnv } from "@/lib/config/env";

interface TurnstileResponse {
  success: boolean;
  "error-codes"?: string[];
}

export async function verifyTurnstile(token: string | undefined): Promise<{ ok: boolean; reason?: string }> {
  if (!isTurnstileConfigured()) return { ok: true };
  if (!token) return { ok: false, reason: "Missing Turnstile verification token" };

  const env = getServerEnv();
  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY ?? "",
        response: token,
        remoteip: "",
      }),
      cache: "no-store",
    });
    const data = (await response.json()) as TurnstileResponse;
    if (!data.success) {
      return { ok: false, reason: data["error-codes"]?.join(", ") ?? "Turnstile verification failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Could not reach Turnstile verification" };
  }
}
