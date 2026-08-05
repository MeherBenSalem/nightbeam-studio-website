import type { NextAuthConfig } from "next-auth";
import Discord from "next-auth/providers/discord";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { BuiltByBitProvider } from "@/lib/auth/providers/builtbybit";
import { isBuiltByBitOAuthConfigured, isOAuthConfigured } from "@/lib/config/env";

// Edge-safe Auth.js configuration used by middleware. The credentials
// provider and data adapter live in auth.ts (Node runtime).
export const authConfig: NextAuthConfig = {
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV === "production" ? undefined : "nightbeam-dev-only-secret"),
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 30, // 30 days; non-remember sessions soft-expire at 7 days
  },
  providers: [
    ...(isOAuthConfigured("google")
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
          }),
        ]
      : []),
    ...(isOAuthConfigured("discord")
      ? [
          Discord({
            clientId: process.env.AUTH_DISCORD_ID ?? "",
            clientSecret: process.env.AUTH_DISCORD_SECRET ?? "",
          }),
        ]
      : []),
    ...(isOAuthConfigured("github")
      ? [
          GitHub({
            clientId: process.env.AUTH_GITHUB_ID ?? "",
            clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
          }),
        ]
      : []),
    ...(isBuiltByBitOAuthConfigured() ? [BuiltByBitProvider()] : []),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.authVersion = user.authVersion;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "USER";
      }
      return session;
    },
  },
};
