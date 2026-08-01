import "server-only";
import { auth } from "@/lib/auth/auth";
import { hasPermission, type Permission } from "@/lib/auth/permissions";
import { getServerEnv } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import type { Role } from "@/lib/db/types";

export interface SessionUser {
  id: string;
  role: Role;
  email?: string | null;
  name?: string | null;
}

export async function requireUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return {
    id: session.user.id,
    role: (session.user.role as Role) ?? "USER",
    email: session.user.email,
    name: session.user.name,
  };
}

export async function requirePermission(permission: Permission): Promise<SessionUser | null> {
  const user = await requireUser();
  if (!user) return null;
  if (!hasPermission(user.role, permission)) return null;

  // Re-check against the live user record so role/bans apply immediately.
  const repo = await getRepo();
  const fresh = await repo.getUserById(user.id);
  if (!fresh || fresh.isBanned) return null;
  if (!hasPermission(fresh.role, permission)) return null;
  return { ...user, role: fresh.role };
}

export async function requireAdmin(): Promise<SessionUser | null> {
  return requirePermission("analytics.view");
}

export function getIpAddress(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export function isProduction(): boolean {
  return getServerEnv().APP_URL !== "http://localhost:3000" || process.env.NODE_ENV === "production";
}
