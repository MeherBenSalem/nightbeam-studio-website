import { publicConfig } from "@/lib/public-config";
import type { EventType } from "@/lib/db/types";

function hasConsent(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((part) => part.startsWith("nb-consent=all"));
}

export function trackEventClient(
  type: EventType,
  data: { projectSlug?: string; path?: string; search?: string } = {},
): void {
  if (!publicConfig.analyticsEnabled || !hasConsent()) return;
  const payload = {
    type,
    projectSlug: data.projectSlug,
    path: data.path ?? window.location.pathname + window.location.search,
    search: data.search,
  };
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => undefined);
}
