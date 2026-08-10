const fs = require("fs");
const path = "src/lib/auth/auth.ts";
let s = fs.readFileSync(path, "utf8");

const start = s.indexOf("  callbacks: {");
const end = s.indexOf("  events: {");
if (start < 0 || end < 0) {
  console.error("markers not found", { start, end });
  process.exit(1);
}

const replacement = `  callbacks: {
    async signIn({ account }) {
      // Allow credentials + OAuth (including BuiltByBit). Missing accounts are
      // created by the Prisma/memory adapter on first BuiltByBit sign-in.
      return Boolean(account);
    },
    async jwt({ token, user, trigger, account }) {
      if (user) {
        token.id = user.id;
        token.role = (user.role as string | undefined) ?? "USER";
        token.authVersion = (user.authVersion as number | undefined) ?? 1;
        token.rememberMe = user.rememberMe ?? false;
        token.softExpiry = user.rememberMe ? undefined : Date.now() + 7 * 24 * 60 * 60 * 1000;
        token.name = user.name;
        token.picture = user.image;
        if (account?.provider) token.provider = account.provider;
      }
      if (trigger === "signIn" && account?.provider === "builtbybit") {
        token.provider = "builtbybit";
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
`;

s = s.slice(0, start) + replacement + s.slice(end);
fs.writeFileSync(path, s);
console.log("auth.ts callbacks replaced");
