"use server";

import { AuthError } from "next-auth";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth, signIn, signOut } from "@/lib/auth/auth";
import { sendPasswordResetEmail, sendVerificationEmail } from "@/lib/auth/email";
import { checkRateLimit, resetRateLimit } from "@/lib/auth/rate-limit";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "@/lib/auth/schemas";
import { revokeAllSessions } from "@/lib/auth/session-revocation";
import { verifyTurnstile } from "@/lib/auth/turnstile";
import { getServerEnv } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";

export interface ActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  message?: string;
  callbackUrl?: string;
}

function randomToken(): string {
  return randomBytes(32).toString("hex");
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const env = getServerEnv();
  if (!env.SIGNUPS_ENABLED) {
    return { error: "Sign-ups are temporarily unavailable. Please check back soon." };
  }
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    turnstileToken: formData.get("turnstileToken") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const limit = await checkRateLimit(`register:${parsed.data.email}`, 5, 60 * 60 * 1000);
  if (!limit.ok) return { error: "Too many registration attempts. Try again later." };
  const turnstile = await verifyTurnstile(parsed.data.turnstileToken);
  if (!turnstile.ok) return { error: turnstile.reason ?? "Verification failed." };

  const repo = await getRepo();
  const existing = await repo.getUserAuthByEmail(parsed.data.email);
  if (existing) return { error: "An account with this email already exists." };

  const autoVerify = env.DEV_AUTO_VERIFY && !env.SMTP_HOST;
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await repo.createUser({
    name: parsed.data.name,
    email: parsed.data.email,
    passwordHash,
    emailVerified: autoVerify ? new Date() : null,
  });

  if (!autoVerify) {
    const token = randomToken();
    await repo.createVerificationToken(parsed.data.email, token, new Date(Date.now() + 24 * 60 * 60 * 1000));
    await sendVerificationEmail(parsed.data.email, token);
  }

  await repo.logAudit({
    actorId: user.id,
    action: "user.register",
    targetType: "user",
    targetId: user.id,
  });

  if (autoVerify) {
    return { ok: true, message: "Account created. You can sign in now." };
  }
  return {
    ok: true,
    message: "Account created. Check your email to verify your address before signing in.",
  };
}

export async function verifyEmailAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = verifyEmailSchema.safeParse({ token: formData.get("token"), email: formData.get("email") });
  if (!parsed.success) return { error: "Invalid verification link." };
  const repo = await getRepo();
  const used = await repo.useVerificationToken(parsed.data.email, parsed.data.token);
  if (!used) return { error: "This verification link is invalid or has expired." };
  const user = await repo.getUserAuthByEmail(parsed.data.email);
  if (user) await repo.updateUser(user.user.id, { emailVerified: new Date() });
  return { ok: true, message: "Email verified. You can sign in now." };
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    rememberMe: formData.get("rememberMe") === "on",
    turnstileToken: formData.get("turnstileToken") ?? undefined,
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const limit = await checkRateLimit(`login:${parsed.data.email}`, 10, 15 * 60 * 1000);
  if (!limit.ok) return { error: "Too many login attempts. Try again in a few minutes." };
  const turnstile = await verifyTurnstile(parsed.data.turnstileToken);
  if (!turnstile.ok) return { error: turnstile.reason ?? "Verification failed." };

  const repo = await getRepo();
  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      rememberMe: parsed.data.rememberMe,
      redirect: false,
    });
    await resetRateLimit(`login:${parsed.data.email}`);
    revalidatePath("/", "layout");
    const callbackUrl = (formData.get("callbackUrl") as string | null) ?? "/dashboard";
    redirect(callbackUrl.startsWith("/") && !callbackUrl.startsWith("//") ? callbackUrl : "/dashboard");
  } catch (error) {
    const found = await repo.getUserAuthByEmail(parsed.data.email);
    if (found) {
      await repo.recordLogin(found.user.id, {
        provider: "credentials",
        success: false,
        reason: error instanceof AuthError ? "invalid-credentials" : "unknown",
      });
    }
    if (error instanceof AuthError) {
      return { error: "Invalid email or password, or the account is not verified." };
    }
    throw error;
  }
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirectTo: "/" });
}

export async function logoutAllAction(): Promise<void> {
  const session = await auth();
  const userId = session?.user?.id;
  if (userId) {
    const repo = await getRepo();
    await repo.revokeUserSessions(userId);
    const fresh = await repo.getUserById(userId);
    await revokeAllSessions(userId, fresh?.authVersion ?? 2);
    await repo.logAudit({ actorId: userId, action: "auth.logout_all" });
  }
  await signOut({ redirectTo: "/auth/login" });
}

export async function forgotPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
    turnstileToken: formData.get("turnstileToken") ?? undefined,
  });
  if (!parsed.success) return { error: "Enter a valid email address." };
  const limit = await checkRateLimit(`forgot:${parsed.data.email}`, 3, 60 * 60 * 1000);
  if (!limit.ok) return { error: "Too many requests. Try again later." };
  const turnstile = await verifyTurnstile(parsed.data.turnstileToken);
  if (!turnstile.ok) return { error: turnstile.reason ?? "Verification failed." };

  const repo = await getRepo();
  const user = await repo.getUserAuthByEmail(parsed.data.email);
  if (user) {
    const token = randomToken();
    await repo.createVerificationToken(parsed.data.email, token, new Date(Date.now() + 60 * 60 * 1000));
    await sendPasswordResetEmail(parsed.data.email, token);
  }
  return { ok: true, message: "If an account exists for that email, a reset link is on its way." };
}

export async function resetPasswordAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Password does not meet requirements.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const repo = await getRepo();
  const used = await repo.useVerificationToken(parsed.data.email, parsed.data.token);
  if (!used) return { error: "This reset link is invalid or has expired." };
  const user = await repo.getUserAuthByEmail(parsed.data.email);
  if (!user) return { error: "This reset link is invalid or has expired." };
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await repo.updateUser(user.user.id, { passwordHash, emailVerified: new Date() });
  await repo.revokeUserSessions(user.user.id);
  await revokeAllSessions(user.user.id, user.user.authVersion + 1);
  return { ok: true, message: "Password updated. Sign in with your new password." };
}
