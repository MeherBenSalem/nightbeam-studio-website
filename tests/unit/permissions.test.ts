import { describe, expect, it } from "vitest";
import { hasPermission, permissionsFor, PERMISSIONS } from "@/lib/auth/permissions";

describe("RBAC permission matrix", () => {
  it("grants super admins every permission", () => {
    for (const permission of PERMISSIONS) {
      expect(hasPermission("SUPER_ADMIN", permission)).toBe(true);
    }
  });

  it("denies regular users everything", () => {
    expect(permissionsFor("USER")).toHaveLength(0);
    expect(hasPermission("USER", "analytics.view")).toBe(false);
  });

  it("keeps role escalation boundaries", () => {
    expect(hasPermission("ADMIN", "users.manage")).toBe(true);
    expect(hasPermission("ADMIN", "roles.manage")).toBe(false);
    expect(hasPermission("CONTENT_MANAGER", "sync.manage")).toBe(false);
    expect(hasPermission("CONTENT_MANAGER", "projects.manage")).toBe(true);
    expect(hasPermission("SUPPORT_AGENT", "errors.view")).toBe(true);
    expect(hasPermission("SUPPORT_AGENT", "users.manage")).toBe(false);
  });
});
