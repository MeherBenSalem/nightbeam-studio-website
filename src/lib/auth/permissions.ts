import type { Role } from "@/lib/db/types";

export const PERMISSIONS = [
  "users.view",
  "users.manage",
  "roles.manage",
  "projects.manage",
  "content.manage",
  "sections.manage",
  "announcements.manage",
  "sync.manage",
  "cache.manage",
  "analytics.view",
  "errors.view",
  "audit.view",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  SUPER_ADMIN: "Super Admin",
  ADMIN: "Admin",
  CONTENT_MANAGER: "Content Manager",
  SUPPORT_AGENT: "Support Agent",
  USER: "User",
};

const MATRIX: Record<Role, ReadonlySet<Permission>> = {
  SUPER_ADMIN: new Set(PERMISSIONS),
  ADMIN: new Set<Permission>([
    "users.view",
    "users.manage",
    "projects.manage",
    "content.manage",
    "sections.manage",
    "announcements.manage",
    "sync.manage",
    "cache.manage",
    "analytics.view",
    "errors.view",
    "audit.view",
  ]),
  CONTENT_MANAGER: new Set<Permission>([
    "projects.manage",
    "content.manage",
    "sections.manage",
    "announcements.manage",
    "analytics.view",
  ]),
  SUPPORT_AGENT: new Set<Permission>(["users.view", "errors.view", "analytics.view"]),
  USER: new Set<Permission>([]),
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return MATRIX[role]?.has(permission) ?? false;
}

export function permissionsFor(role: Role): Permission[] {
  return PERMISSIONS.filter((p) => hasPermission(role, p));
}

export function isStaff(role: Role): boolean {
  return role !== "USER";
}
