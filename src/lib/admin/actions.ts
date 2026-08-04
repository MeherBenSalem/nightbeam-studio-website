"use server";

import { revalidatePath } from "next/cache";
import { adminUserSchema, announcementSchema, projectOverrideSchema } from "@/lib/auth/schemas";
import { requirePermission } from "@/lib/auth/guards";
import { flushAllCaches } from "@/lib/curseforge/cache";
import { getRepo } from "@/lib/db/repo";
import type { ActionState } from "@/lib/auth/actions";
import { normalizeYouTubeVideoId } from "@/lib/utils/youtube";

export async function setUserRoleAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("roles.manage");
  if (!actor) return { error: "Forbidden" };
  const parsed = adminUserSchema.safeParse({ userId: formData.get("userId"), role: formData.get("role") });
  if (!parsed.success) return { error: "Invalid input" };
  const repo = await getRepo();
  const target = await repo.getUserById(parsed.data.userId);
  if (!target) return { error: "User not found" };
  if (target.role === "SUPER_ADMIN" && actor.role !== "SUPER_ADMIN") return { error: "Only a super admin can change this user" };
  await repo.updateUser(target.id, { role: parsed.data.role });
  await repo.logAudit({
    actorId: actor.id,
    action: "user.role_change",
    targetType: "user",
    targetId: target.id,
    details: { from: target.role, to: parsed.data.role },
  });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserBannedAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("users.manage");
  if (!actor) return { error: "Forbidden" };
  const userId = String(formData.get("userId") ?? "");
  const banned = formData.get("banned") === "1";
  const repo = await getRepo();
  const target = await repo.getUserById(userId);
  if (!target) return { error: "User not found" };
  if (target.role === "SUPER_ADMIN") return { error: "Cannot ban a super admin" };
  await repo.updateUser(userId, { isBanned: banned });
  await repo.logAudit({ actorId: actor.id, action: banned ? "user.ban" : "user.unban", targetType: "user", targetId: userId });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function setUserProAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("users.manage");
  if (!actor) return { error: "Forbidden" };
  const userId = String(formData.get("userId") ?? "");
  const pro = formData.get("pro") === "1";
  const repo = await getRepo();
  const target = await repo.getUserById(userId);
  if (!target) return { error: "User not found" };
  await repo.updateUser(userId, { isPro: pro });
  await repo.logAudit({ actorId: actor.id, action: pro ? "user.pro_grant" : "user.pro_revoke", targetType: "user", targetId: userId });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function deleteUserAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("users.manage");
  if (!actor) return { error: "Forbidden" };
  const userId = String(formData.get("userId") ?? "");
  const repo = await getRepo();
  const target = await repo.getUserById(userId);
  if (!target) return { error: "User not found" };
  if (target.role === "SUPER_ADMIN") return { error: "Cannot delete a super admin" };
  await repo.deleteUser(userId);
  await repo.logAudit({ actorId: actor.id, action: "user.delete", targetType: "user", targetId: userId });
  revalidatePath("/admin/users");
  return { ok: true };
}

export async function saveProjectOverrideAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("projects.manage");
  if (!actor) return { error: "Forbidden" };
  const raw = {
    projectId: formData.get("projectId"),
    name: formData.get("name") || null,
    summary: formData.get("summary") || null,
    description: formData.get("description") || null,
    iconUrl: formData.get("iconUrl") || null,
    bannerUrl: formData.get("bannerUrl") || null,
    featured: formData.get("featured") === "on" ? true : null,
    status: formData.get("status") || null,
    downloads: formData.get("downloads") === "" ? null : Number(formData.get("downloads")),
    followers: formData.get("followers") === "" ? null : Number(formData.get("followers")),
    views: formData.get("views") === "" ? null : Number(formData.get("views")),
    rating: formData.get("rating") === "" ? null : Number(formData.get("rating")),
  };
  const parsed = projectOverrideSchema.safeParse(raw);
  if (!parsed.success) return { error: "Invalid override values", fieldErrors: parsed.error.flatten().fieldErrors };
  const repo = await getRepo();
  await repo.upsertProjectOverride(parsed.data.projectId, {
    name: parsed.data.name ?? null,
    summary: parsed.data.summary ?? null,
    description: parsed.data.description ?? null,
    iconUrl: parsed.data.iconUrl ?? null,
    bannerUrl: parsed.data.bannerUrl ?? null,
    featured: parsed.data.featured ?? null,
    status: parsed.data.status ?? null,
    downloads: parsed.data.downloads ?? null,
    followers: parsed.data.followers ?? null,
    views: parsed.data.views ?? null,
    rating: parsed.data.rating ?? null,
  });
  await repo.logAudit({ actorId: actor.id, action: "project.override", targetType: "project", targetId: parsed.data.projectId });
  revalidatePath("/admin/projects");
  return { ok: true, message: "Project override saved." };
}

export async function upsertSectionAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("sections.manage");
  if (!actor) return { error: "Forbidden" };
  const key = String(formData.get("key") ?? "");
  const title = String(formData.get("title") ?? "");
  const subtitle = String(formData.get("subtitle") ?? "") || null;
  const enabled = formData.get("enabled") === "on";
  if (!key || title.length < 2) return { error: "Key and title are required" };
  const repo = await getRepo();
  const existing = (await repo.listAllSections()).find((section) => section.key === key);
  await repo.upsertSection({
    id: existing?.id ?? `section-${key}`,
    key,
    title,
    subtitle,
    enabled,
    sortOrder: existing?.sortOrder ?? 99,
    content: existing?.content ?? null,
  });
  await repo.logAudit({ actorId: actor.id, action: "section.update", targetType: "section", targetId: key });
  revalidatePath("/admin/sections");
  return { ok: true };
}

export async function saveHomepageVideoAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("sections.manage");
  if (!actor) return { error: "Forbidden" };

  const rawVideo = String(formData.get("videoId") ?? "").trim();
  const videoId = normalizeYouTubeVideoId(rawVideo);
  if (rawVideo && !videoId) return { error: "Enter a valid YouTube video URL or 11-character video ID." };

  const repo = await getRepo();
  const sections = await repo.listAllSections();
  const existing = sections.find((section) => section.key === "hero");
  const content = { ...(existing?.content ?? {}) };
  if (videoId) content.youtubeVideoId = videoId;
  else delete content.youtubeVideoId;

  await repo.upsertSection({
    id: existing?.id ?? "section-hero",
    key: "hero",
    title: existing?.title ?? "Featured release",
    subtitle: existing?.subtitle ?? null,
    enabled: existing?.enabled ?? true,
    sortOrder: existing?.sortOrder ?? 0,
    content,
  });
  await repo.logAudit({
    actorId: actor.id,
    action: videoId ? "homepage.video_update" : "homepage.video_clear",
    targetType: "section",
    targetId: "hero",
    details: videoId ? { videoId } : null,
  });
  revalidatePath("/");
  revalidatePath("/admin/sections");
  return { ok: true, message: videoId ? "Homepage video saved." : "Homepage video cleared; automatic selection restored." };
}

export async function upsertAnnouncementAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("announcements.manage");
  if (!actor) return { error: "Forbidden" };
  const parsed = announcementSchema.safeParse({
    slug: formData.get("slug"),
    title: formData.get("title"),
    body: formData.get("body"),
    active: formData.get("active") === "on",
    dismissible: formData.get("dismissible") === "on",
    startsAt: formData.get("startsAt") || null,
    endsAt: formData.get("endsAt") || null,
  });
  if (!parsed.success) return { error: "Invalid announcement", fieldErrors: parsed.error.flatten().fieldErrors };
  const repo = await getRepo();
  const existing = (await repo.listAllAnnouncements()).find((a) => a.slug === parsed.data.slug);
  await repo.upsertAnnouncement({
    id: existing?.id ?? `ann-${parsed.data.slug}`,
    slug: parsed.data.slug,
    title: parsed.data.title,
    body: parsed.data.body,
    active: parsed.data.active,
    dismissible: parsed.data.dismissible,
    startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
    endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    createdAt: existing?.createdAt ?? new Date(),
  });
  await repo.logAudit({ actorId: actor.id, action: "announcement.upsert", targetType: "announcement", targetId: parsed.data.slug });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function deleteAnnouncementAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("announcements.manage");
  if (!actor) return { error: "Forbidden" };
  const slug = String(formData.get("slug") ?? "");
  const repo = await getRepo();
  await repo.deleteAnnouncement(slug);
  await repo.logAudit({ actorId: actor.id, action: "announcement.delete", targetType: "announcement", targetId: slug });
  revalidatePath("/admin/announcements");
  return { ok: true };
}

export async function clearApiErrorsAction(): Promise<void> {
  const actor = await requirePermission("errors.view");
  if (!actor) return;
  const repo = await getRepo();
  await repo.clearApiErrors();
  await repo.logAudit({ actorId: actor.id, action: "errors.clear" });
  revalidatePath("/admin/errors");
}

export async function flushCacheAction(): Promise<void> {
  const actor = await requirePermission("cache.manage");
  if (!actor) return;
  await flushAllCaches();
  const repo = await getRepo();
  await repo.logAudit({ actorId: actor.id, action: "cache.flush" });
  revalidatePath("/admin/sync");
}

export async function upsertSocialAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("sections.manage");
  if (!actor) return { error: "Forbidden" };
  const platform = String(formData.get("platform") ?? "");
  const label = String(formData.get("label") ?? "") || null;
  const url = String(formData.get("url") ?? "");
  if (!platform || !url) return { error: "Platform and URL are required" };
  const repo = await getRepo();
  const existing = (await repo.listAllSocials()).find((social) => social.platform === platform);
  await repo.upsertSocial({
    id: existing?.id ?? `social-${platform.toLowerCase()}`,
    platform: platform as never,
    label,
    url,
    sortOrder: existing?.sortOrder ?? 99,
  });
  revalidatePath("/admin/sections");
  return { ok: true };
}

export async function deleteSocialAction(formData: FormData): Promise<ActionState> {
  const actor = await requirePermission("sections.manage");
  if (!actor) return { error: "Forbidden" };
  const platform = String(formData.get("platform") ?? "");
  const repo = await getRepo();
  await repo.deleteSocial(platform);
  revalidatePath("/admin/sections");
  return { ok: true };
}
