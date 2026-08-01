import { getServerEnv } from "@/lib/config/env";
import { sendDigestEmail } from "@/lib/auth/email";
import { getRepo } from "@/lib/db/repo";
import type { NotificationDto } from "@/lib/db/types";

export interface DigestItem {
  title: string;
  body: string;
  link?: string;
}

export function buildDigest(
  notifications: NotificationDto[],
  options: { now?: Date; days?: number; limit?: number } = {},
): DigestItem[] {
  const now = options.now ?? new Date();
  const days = options.days ?? 7;
  const limit = options.limit ?? 10;
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return notifications
    .filter((notification) => !notification.readAt && notification.createdAt >= cutoff)
    .slice(0, limit)
    .map((notification) => ({
      title: notification.title,
      body: (notification.body ?? "").slice(0, 160),
      link: notification.link ?? undefined,
    }));
}

export async function runDigestJob(): Promise<{ sent: number; skipped: number }> {
  const repo = await getRepo();
  const env = getServerEnv();
  if (!env.SMTP_HOST) {
    console.info("[digest] SMTP not configured — skipping digest job");
    return { sent: 0, skipped: 0 };
  }

  const { items: users } = await repo.listUsers("", 1, 10_000);
  let sent = 0;
  let skipped = 0;

  for (const user of users) {
    if (!user.email) {
      skipped += 1;
      continue;
    }
    const prefs = await repo.getNotificationPrefs(user.id);
    if (!prefs.emailEnabled || !prefs.digestEnabled || prefs.digestFrequency === "NEVER") {
      skipped += 1;
      continue;
    }
    const notifications = await repo.listNotifications(user.id);
    const items = buildDigest(notifications);
    if (items.length === 0) {
      skipped += 1;
      continue;
    }
    const result = await sendDigestEmail(user.email, items);
    if (result.sent) sent += 1;
    else skipped += 1;
  }

  return { sent, skipped };
}
