import "server-only";
import type { Adapter } from "next-auth/adapters";
import { memoryStore } from "@/lib/db/memory-store";

// Minimal Auth.js adapter over the in-memory store, used when PostgreSQL
// is not reachable. Mirrors the Prisma adapter surface.
export const memoryAdapter: Adapter = {
  async createUser(user) {
    const record = memoryStore.createUser({
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified ?? null,
      image: user.image ?? null,
    });
    return {
      id: record.id,
      name: record.name,
      email: record.email ?? "",
      emailVerified: record.emailVerified,
      image: record.image,
    };
  },

  async getUser(id) {
    const record = memoryStore.getUserById(id);
    return record
      ? { id: record.id, name: record.name, email: record.email ?? "", emailVerified: record.emailVerified, image: record.image }
      : null;
  },

  async getUserByEmail(email) {
    const record = memoryStore.getUserByEmail(email);
    return record
      ? { id: record.id, name: record.name, email: record.email ?? "", emailVerified: record.emailVerified, image: record.image }
      : null;
  },

  async getUserByAccount({ provider, providerAccountId }) {
    const account = memoryStore.getAccount(provider, providerAccountId);
    if (!account) return null;
    const record = memoryStore.getUserById(account.userId);
    return record
      ? { id: record.id, name: record.name, email: record.email ?? "", emailVerified: record.emailVerified, image: record.image }
      : null;
  },

  async updateUser(user) {
    if (!user.id) throw new Error("updateUser requires an id");
    const record = memoryStore.updateUser(user.id, {
      name: user.name ?? undefined,
      email: user.email ?? undefined,
      emailVerified: user.emailVerified ?? undefined,
      image: user.image ?? undefined,
    });
    if (!record) throw new Error("updateUser: user not found");
    return { id: record.id, name: record.name, email: record.email ?? "", emailVerified: record.emailVerified, image: record.image };
  },

  async deleteUser(userId) {
    memoryStore.deleteUser(userId);
  },

  async linkAccount(account) {
    memoryStore.linkAccount({
      userId: account.userId,
      type: account.type,
      provider: account.provider,
      providerAccountId: account.providerAccountId,
      refresh_token: (account.refresh_token as string | null) ?? null,
      access_token: (account.access_token as string | null) ?? null,
      expires_at: (account.expires_at as number | null) ?? null,
      token_type: (account.token_type as string | null) ?? null,
      scope: (account.scope as string | null) ?? null,
      id_token: (account.id_token as string | null) ?? null,
      session_state: (account.session_state as string | null) ?? null,
    });
  },

  async unlinkAccount({ provider, providerAccountId }) {
    memoryStore.unlinkAccount(provider, providerAccountId);
  },

  async createSession(session) {
    return memoryStore.createSession(session.sessionToken, session.userId, session.expires);
  },

  async getSessionAndUser(sessionToken) {
    const session = memoryStore.getSession(sessionToken);
    if (!session) return null;
    const user = memoryStore.getUserById(session.userId);
    if (!user) return null;
    return {
      session: { sessionToken: session.sessionToken, userId: session.userId, expires: session.expires },
      user: { id: user.id, name: user.name, email: user.email ?? "", emailVerified: user.emailVerified, image: user.image },
    };
  },

  async updateSession(session) {
    if (!session.expires) return null;
    return memoryStore.updateSession(session.sessionToken, session.expires);
  },

  async deleteSession(sessionToken) {
    memoryStore.deleteSession(sessionToken);
  },

  async createVerificationToken(token) {
    return memoryStore.createVerificationToken(token.identifier, token.token, token.expires);
  },

  async useVerificationToken({ identifier, token }) {
    const entry = memoryStore.useVerificationToken(identifier, token);
    return entry
      ? { identifier: entry.identifier, token: entry.token, expires: entry.expires }
      : null;
  },
};
