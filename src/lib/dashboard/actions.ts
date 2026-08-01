"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth, signOut } from "@/lib/auth/auth";
import { notificationPrefsSchema, profileSchema } from "@/lib/auth/schemas";
import { getRepo } from "@/lib/db/repo";
import type { ActionState } from "@/lib/auth/actions";

export async function updateProfileAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in required" };
  const parsed = profileSchema.safeParse({
    displayName: formData.get("displayName") || undefined,
    bio: formData.get("bio") || undefined,
    website: formData.get("website") || "",
    preferredVersions: formData.getAll("preferredVersions"),
    preferredLoaders: formData.getAll("preferredLoaders"),
  });
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields.", fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const repo = await getRepo();
  await repo.updateProfile(session.user.id, parsed.data);
  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Profile saved." };
}

export async function updatePrefsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Sign in required" };
  const parsed = notificationPrefsSchema.safeParse({
    emailEnabled: formData.get("emailEnabled") === "on",
    digestEnabled: formData.get("digestEnabled") === "on",
    digestFrequency: formData.get("digestFrequency") ?? "WEEKLY",
    projectNotifications: formData.get("projectNotifications") === "on",
    follows: formData.get("follows") === "on",
    comments: formData.get("comments") === "on",
    announcements: formData.get("announcements") === "on",
  });
  if (!parsed.success) return { error: "Invalid preferences." };
  const repo = await getRepo();
  await repo.updateNotificationPrefs(session.user.id, parsed.data);
  revalidatePath("/dashboard/settings");
  return { ok: true, message: "Notification preferences saved." };
}

export async function deleteAccountAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return { error: "Sign in required" };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password !== confirm) return { error: "Passwords do not match." };
  const repo = await getRepo();
  const found = await repo.getUserAuthByEmail(session.user.email);
  if (!found || !found.passwordHash) return { error: "Password login is not enabled on this account." };
  const valid = await bcrypt.compare(password, found.passwordHash);
  if (!valid) return { error: "Incorrect password." };
  await repo.logAudit({ actorId: session.user.id, action: "user.delete" });
  await repo.deleteUser(session.user.id);
  await signOut({ redirectTo: "/" });
  return { ok: true };
}
