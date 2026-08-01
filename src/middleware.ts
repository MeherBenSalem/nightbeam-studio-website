import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth/auth.config";
import { hasPermission } from "@/lib/auth/permissions";
import type { Role } from "@/lib/db/types";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const { nextUrl } = request;
  const loggedIn = Boolean(request.auth?.user);
  const role = (request.auth?.user as { role?: string } | undefined)?.role as Role | undefined;
  const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);

  if (nextUrl.pathname.startsWith("/dashboard") && !loggedIn) {
    return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl));
  }

  if (nextUrl.pathname.startsWith("/admin")) {
    if (!loggedIn) {
      return NextResponse.redirect(new URL(`/auth/login?callbackUrl=${callbackUrl}`, nextUrl));
    }
    if (!hasPermission(role ?? "USER", "analytics.view")) {
      return NextResponse.redirect(new URL("/dashboard", nextUrl));
    }
  }

  if ((nextUrl.pathname === "/auth/login" || nextUrl.pathname === "/auth/register") && loggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/auth/login", "/auth/register"],
};
