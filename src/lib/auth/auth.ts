import "server-only";
import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { authConfig } from "@/lib/auth/auth.config";
import { memoryAdapter } from "@/lib/auth/memory-adapter";
import { isSessionRevoked, revokeAllSessions } from "@/lib/auth/session-revocation";
import { loginSchema } from "@/lib/auth/schemas";
import { getRepo } from "@/lib/db/repo";
import { isDatabaseReachable, getPrisma } from "@/lib/db/prisma";

async function resolveAdapter() {
  return (await isDatabaseReachable()) && getPrisma() ? PrismaAdapter(getPrisma()!) : memoryAdapter;
}

const credentialsProvider = Credentials({
  name: "Email & password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
    rememberMe: { label: "Remember me", type: "checkbox" },
  },
  async authorize(credentials) {
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) return null;
    const repo = await getRepo();
    const found = await repo.getUserAuthByEmail(parsed.data.email);
    if (!found || !found.passwordHash) return null;
    const valid = await bcrypt.compare(parsed.data.password, found.passwordHash);
    if (!valid) return null;
    if (found.user.isBanned) return null;
    if (!found.user.emailVerified) return null;
    return {
      id: found.user.id,
      name: found.user.displayName ?? found.user.name ?? undefined,
      email: found.user.email ?? undefined,
      image: found.user.image ?? undefined,
      role: found.user.role,
      authVersion: found.user.authVersion,
      rememberMe: parsed.data.rememberMe,
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: await resolveAdapter(),
  providers: [...authConfig.providers, credentialsProvider],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (trigger === "signIn" && user) {
        token.id = user.id;
        token.role = user.role;
        token.authVersion = user.authVersion;
        token.rememberMe = user.rememberMe ?? false;
        token.softExpiry = user.rememberMe ? undefined : Date.now() + 7 * 24 * 60 * 60 * 1000;
        token.name = user.name;
        token.picture = user.image;
      }
      if (await isSessionRevoked(token.id as string | undefined, token.authVersion as number | undefined)) return null;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "USER";
        session.user.authVersion = token.authVersion as number | undefined;
      }
      return session;
    },
  },
  events: {
    async signIn({ user, account }) {
      if (!user.email) return;
      const repo = await getRepo();
      const found = await repo.getUserAuthByEmail(user.email);
      if (!found) return;
      if (account?.provider === "credentials" && user.rememberMe === false) {
        // Extend JWT soft-expiry is handled in the jwt callback; nothing to do here.
      }
      await repo.recordLogin(found.user.id, {
        provider: account?.provider ?? "credentials",
        success: true,
      });
    },
  },
});

// Awaited adapter resolution — re-exported for tests.
export { isSessionRevoked, revokeAllSessions };
