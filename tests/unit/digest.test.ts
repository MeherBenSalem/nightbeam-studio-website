import { describe, expect, it } from "vitest";
import { buildDigest } from "@/lib/notifications/digest";
import type { NotificationDto } from "@/lib/db/types";

const now = new Date("2026-08-01T12:00:00Z");

function notification(overrides: Partial<NotificationDto>): NotificationDto {
  return {
    id: "n1",
    type: "PROJECT",
    title: "The Birth of Steve 0.5.0",
    body: "A new version is out",
    link: "/projects/the-birth-of-steve",
    projectId: null,
    readAt: null,
    createdAt: now,
    ...overrides,
  };
}

describe("notification digest builder", () => {
  it("includes only unread notifications from the window", () => {
    const items = buildDigest(
      [
        notification({ id: "a", createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2) }),
        notification({ id: "b", readAt: now }),
        notification({ id: "c", createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20) }),
      ],
      { now },
    );
    expect(items.map((item) => item.title)).toEqual(["The Birth of Steve 0.5.0"]);
  });

  it("caps the number of items", () => {
    const items = buildDigest(
      Array.from({ length: 25 }, (_, index) => notification({ id: `n${index}` })),
      { now, limit: 10 },
    );
    expect(items).toHaveLength(10);
  });

  it("truncates long bodies", () => {
    const items = buildDigest([notification({ body: "x".repeat(500) })], { now });
    expect(items[0].body.length).toBeLessThanOrEqual(160);
  });
});
