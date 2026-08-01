import "server-only";
import bcrypt from "bcryptjs";
import {
  SEED_ANNOUNCEMENTS,
  SEED_CATEGORIES,
  SEED_PROJECTS,
  SEED_SECTIONS,
  SEED_SOCIALS,
  SEED_TAGS,
} from "@/lib/db/catalog";
import type {
  AnalyticsRow,
  AnnouncementDto,
  AuditLogDto,
  CommunityStatsDto,
  EventType,
  HomeSectionDto,
  LoginHistoryDto,
  NotificationDto,
  NotificationPreferenceDto,
  NotificationType,
  ProjectDetail,
  ProjectFilters,
  ProjectListResult,
  ProjectOverrideDto,
  ProjectSummary,
  Role,
  SocialLinkDto,
  SyncStateDto,
  UserDto,
} from "@/lib/db/types";
import { getServerEnv } from "@/lib/config/env";
import { getYouTubeSubscribers } from "@/lib/youtube";

export interface MemoryUserRecord {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  passwordHash: string | null;
  role: Role;
  isBanned: boolean;
  authVersion: number;
  displayName: string | null;
  avatar: string | null;
  createdAt: Date;
  updatedAt: Date;
  prefs: NotificationPreferenceDto;
  profile: {
    displayName: string | null;
    bio: string | null;
    website: string | null;
    preferredVersions: string[];
    preferredLoaders: string[];
  };
}

export interface MemoryAccount {
  id: string;
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token: string | null;
  access_token: string | null;
  expires_at: number | null;
  token_type: string | null;
  scope: string | null;
  id_token: string | null;
  session_state: string | null;
}

export interface MemorySession {
  id: string;
  sessionToken: string;
  userId: string;
  expires: Date;
}

export interface MemoryVerificationToken {
  identifier: string;
  token: string;
  expires: Date;
}

function uid(): string {
  return crypto.randomUUID();
}

function cloneSeedProject(seed: (typeof SEED_PROJECTS)[number]): ProjectDetail {
  const detail: ProjectDetail = {
    ...seed,
    type: seed.type as ProjectDetail["type"],
    curseforgeId: seed.curseforgeId,
    loaders: seed.loaders as ProjectDetail["loaders"],
    versions: seed.versions as ProjectDetail["versions"],
    screenshots: seed.screenshots as ProjectDetail["screenshots"],
    changelogs: seed.changelogs as ProjectDetail["changelogs"],
    docs: seed.docs as ProjectDetail["docs"],
    dependencies: seed.dependencies as ProjectDetail["dependencies"],
    comments: seed.comments as ProjectDetail["comments"],
    latestVersion: seed.versions[0]?.version ?? null,
    lastSyncedAt: null,
    updatedAt: new Date("2026-01-12T00:00:00Z"),
  };
  return structuredClone(detail);
}

export class MemoryDataStore {
  users = new Map<string, MemoryUserRecord>();
  emailIndex = new Map<string, string>();
  accounts = new Map<string, MemoryAccount>();
  accountIndex = new Map<string, string>();
  sessions = new Map<string, MemorySession>();
  sessionIndex = new Map<string, string>();
  verificationTokens = new Map<string, MemoryVerificationToken>();
  verificationIndex = new Map<string, string>();

  projects = new Map<string, ProjectDetail>();
  slugIndex = new Map<string, string>();
  categories = new Map<string, { slug: string; name: string }>();
  tags = new Map<string, { slug: string; name: string }>();

  favorites = new Map<string, Map<string, Date>>();
  follows = new Map<string, Map<string, Date>>();
  recentlyViewed = new Map<string, Array<{ projectId: string; viewedAt: Date }>>();
  userDownloads = new Map<string, Array<{ projectId: string; fileId: string | null; downloadedAt: Date }>>();
  notifications = new Map<string, NotificationDto[]>();
  loginHistory = new Map<string, LoginHistoryDto[]>();
  analytics: AnalyticsRow[] = [];
  announcements = new Map<string, AnnouncementDto>();
  syncStates = new Map<string, SyncStateDto>();
  auditLogs: AuditLogDto[] = [];
  apiErrors: Array<{ id: string; route: string; method: string; status: number; message: string | null; stack: string | null; createdAt: Date }> = [];
  sections = new Map<string, HomeSectionDto>();
  socials = new Map<string, SocialLinkDto>();
  overrides = new Map<string, ProjectOverrideDto>();

  seeded = false;
  seeding: Promise<void> | null = null;

  async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    if (this.seeding) return this.seeding;
    this.seeding = this.seed();
    await this.seeding;
  }

  private async seed(): Promise<void> {
    if (this.seeded) return;
    for (const category of SEED_CATEGORIES) this.categories.set(category.slug, { slug: category.slug, name: category.name });
    for (const tag of SEED_TAGS) this.tags.set(tag.slug, { slug: tag.slug, name: tag.name });
    for (const project of SEED_PROJECTS) {
      const detail = cloneSeedProject(project);
      this.projects.set(detail.id, detail);
      this.slugIndex.set(detail.slug, detail.id);
    }
    for (const announcement of SEED_ANNOUNCEMENTS) {
      this.announcements.set(announcement.slug, {
        id: `seed-ann-${announcement.slug}`,
        ...announcement,
        active: true,
        startsAt: null,
        endsAt: null,
        createdAt: new Date("2026-01-12T00:00:00Z"),
      });
    }
    for (const section of SEED_SECTIONS) {
      this.sections.set(section.key, { id: `seed-sec-${section.key}`, ...section });
    }
    for (const social of SEED_SOCIALS) {
      this.socials.set(social.platform, {
        id: `seed-social-${social.platform.toLowerCase()}`,
        platform: social.platform as SocialLinkDto["platform"],
        label: social.label,
        url: social.url,
        sortOrder: social.sortOrder,
      });
    }
    await this.seedAdminUser();
    this.seeded = true;
  }

  private async seedAdminUser(): Promise<void> {
    const env = getServerEnv();
    const email = env.AUTH_ADMIN_EMAIL.toLowerCase();
    if (this.emailIndex.has(email)) return;
    const hash = await bcrypt.hash(env.AUTH_ADMIN_PASSWORD, 10);
    this.users.set("seed-admin", {
      id: "seed-admin",
      name: "NightBeam Admin",
      email,
      emailVerified: new Date(),
      image: null,
      passwordHash: hash,
      role: "SUPER_ADMIN",
      isBanned: false,
      authVersion: 1,
      displayName: "NightBeam Admin",
      avatar: null,
      createdAt: new Date("2026-01-01T00:00:00Z"),
      updatedAt: new Date("2026-01-01T00:00:00Z"),
      prefs: defaultPrefs(),
      profile: { displayName: "NightBeam Admin", bio: null, website: null, preferredVersions: [], preferredLoaders: [] },
    });
    this.emailIndex.set(email, "seed-admin");
  }

  // --- Users ---------------------------------------------------------

  getUserByEmail(email: string | null | undefined): MemoryUserRecord | null {
    if (!email) return null;
    const id = this.emailIndex.get(email.toLowerCase());
    return id ? (this.users.get(id) ?? null) : null;
  }

  getUserById(id: string): MemoryUserRecord | null {
    return this.users.get(id) ?? null;
  }

  createUser(input: {
    name?: string | null;
    email?: string | null;
    passwordHash?: string | null;
    emailVerified?: Date | null;
    role?: Role;
    image?: string | null;
  }): MemoryUserRecord {
    const id = uid();
    const email = input.email?.toLowerCase() ?? null;
    const user: MemoryUserRecord = {
      id,
      name: input.name ?? null,
      email,
      emailVerified: input.emailVerified ?? null,
      image: null,
      passwordHash: input.passwordHash ?? null,
      role: input.role ?? "USER",
      isBanned: false,
      authVersion: 1,
      displayName: input.name ?? null,
      avatar: input.image ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
      prefs: defaultPrefs(),
      profile: { displayName: input.name ?? null, bio: null, website: null, preferredVersions: [], preferredLoaders: [] },
    };
    this.users.set(id, user);
    if (email) this.emailIndex.set(email, id);
    return user;
  }

  updateUser(id: string, patch: Partial<Pick<MemoryUserRecord, "name" | "email" | "emailVerified" | "image" | "passwordHash" | "role" | "isBanned" | "authVersion" | "displayName" | "avatar">>): MemoryUserRecord | null {
    const user = this.users.get(id);
    if (!user) return null;
    if (patch.email && patch.email !== user.email) {
      if (user.email) this.emailIndex.delete(user.email.toLowerCase());
      user.email = patch.email.toLowerCase();
      this.emailIndex.set(user.email, id);
    }
    if (patch.name !== undefined) user.name = patch.name;
    if (patch.emailVerified !== undefined) user.emailVerified = patch.emailVerified;
    if (patch.image !== undefined) user.image = patch.image;
    if (patch.passwordHash !== undefined) user.passwordHash = patch.passwordHash;
    if (patch.role !== undefined) user.role = patch.role;
    if (patch.isBanned !== undefined) user.isBanned = patch.isBanned;
    if (patch.authVersion !== undefined) user.authVersion = patch.authVersion;
    if (patch.displayName !== undefined) user.displayName = patch.displayName;
    if (patch.avatar !== undefined) user.avatar = patch.avatar;
    user.updatedAt = new Date();
    return user;
  }

  deleteUser(id: string): void {
    const user = this.users.get(id);
    if (!user) return;
    if (user.email) this.emailIndex.delete(user.email.toLowerCase());
    this.users.delete(id);
    for (const [accountId, account] of this.accounts) {
      if (account.userId === id) {
        this.accounts.delete(accountId);
        this.accountIndex.delete(`${account.provider}:${account.providerAccountId}`);
      }
    }
    for (const [token, session] of this.sessions) {
      if (session.userId === id) this.sessions.delete(token);
    }
    this.favorites.delete(id);
    this.follows.delete(id);
    this.recentlyViewed.delete(id);
    this.userDownloads.delete(id);
    this.notifications.delete(id);
    this.loginHistory.delete(id);
  }

  listUsers(search: string, page: number, perPage: number): { items: UserDto[]; total: number } {
    let users = [...this.users.values()];
    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => (u.email ?? "").toLowerCase().includes(q) || (u.name ?? "").toLowerCase().includes(q));
    }
    users.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = users.length;
    const start = (page - 1) * perPage;
    return { items: users.slice(start, start + perPage).map(toUserDto), total };
  }

  getProfile(id: string) {
    return this.users.get(id)?.profile ?? null;
  }

  updateProfile(id: string, patch: Partial<MemoryUserRecord["profile"]>): void {
    const user = this.users.get(id);
    if (!user) return;
    user.profile = { ...user.profile, ...patch };
  }

  // --- Auth.js adapter plumbing --------------------------------------

  getAccount(provider: string, providerAccountId: string): MemoryAccount | null {
    const id = this.accountIndex.get(`${provider}:${providerAccountId}`);
    return id ? (this.accounts.get(id) ?? null) : null;
  }

  linkAccount(input: Omit<MemoryAccount, "id">): MemoryAccount {
    const account: MemoryAccount = { id: uid(), ...input };
    this.accounts.set(account.id, account);
    this.accountIndex.set(`${account.provider}:${account.providerAccountId}`, account.id);
    return account;
  }

  unlinkAccount(provider: string, providerAccountId: string): void {
    const account = this.getAccount(provider, providerAccountId);
    if (!account) return;
    this.accounts.delete(account.id);
    this.accountIndex.delete(`${provider}:${providerAccountId}`);
  }

  getSession(sessionToken: string): MemorySession | null {
    return this.sessions.get(sessionToken) ?? null;
  }

  createSession(sessionToken: string, userId: string, expires: Date): MemorySession {
    const session: MemorySession = { id: uid(), sessionToken, userId, expires };
    this.sessions.set(sessionToken, session);
    this.sessionIndex.set(sessionToken, sessionToken);
    return session;
  }

  updateSession(sessionToken: string, expires: Date): MemorySession | null {
    const session = this.sessions.get(sessionToken);
    if (!session) return null;
    session.expires = expires;
    return session;
  }

  deleteSession(sessionToken: string): void {
    this.sessions.delete(sessionToken);
    this.sessionIndex.delete(sessionToken);
  }

  getVerificationToken(identifier: string, token: string): MemoryVerificationToken | null {
    const key = this.verificationIndex.get(`${identifier}:${token}`);
    return key ? (this.verificationTokens.get(key) ?? null) : null;
  }

  createVerificationToken(identifier: string, token: string, expires: Date): MemoryVerificationToken {
    const entry: MemoryVerificationToken = { identifier, token, expires };
    const key = `${identifier}:${token}`;
    this.verificationTokens.set(key, entry);
    this.verificationIndex.set(key, key);
    return entry;
  }

  useVerificationToken(identifier: string, token: string): MemoryVerificationToken | null {
    const key = `${identifier}:${token}`;
    const entry = this.verificationTokens.get(key);
    if (!entry) return null;
    this.verificationTokens.delete(key);
    this.verificationIndex.delete(key);
    return entry;
  }

  // --- Projects ------------------------------------------------------

  listProjectSummaries(filters: ProjectFilters = {}): ProjectListResult {
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 12;
    let items: ProjectSummary[] = [...this.projects.values()].map(toProjectSummary);

    if (filters.type) items = items.filter((p) => p.type === filters.type);
    if (filters.versions?.length) items = items.filter((p) => p.minecraftVersions.some((v) => filters.versions!.includes(v)));
    if (filters.loaders?.length) items = items.filter((p) => p.loaders.some((l) => filters.loaders!.includes(l)));
    if (filters.categories?.length) items = items.filter((p) => p.categories.some((c) => filters.categories!.includes(c.slug)));
    if (filters.platform === "curseforge") items = items.filter((p) => Boolean(p.curseforgeId));
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.tags.some((t) => t.name.includes(q)),
      );
    }

    const sort = filters.sort ?? "downloads";
    items.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "newest") return b.updatedAt.getTime() - a.updatedAt.getTime();
      if (sort === "updated") return b.updatedAt.getTime() - a.updatedAt.getTime();
      if (sort === "followers") return b.followers - a.followers;
      if (sort === "views") return b.views - a.views;
      return b.downloads - a.downloads;
    });

    const total = items.length;
    const totalPages = Math.max(1, Math.ceil(total / perPage));
    const start = (page - 1) * perPage;
    return { items: items.slice(start, start + perPage), total, page, perPage, totalPages };
  }

  getProjectDetail(slug: string, userId?: string | null): ProjectDetail | null {
    const id = this.slugIndex.get(slug);
    if (!id) return null;
    const base = this.projects.get(id);
    if (!base) return null;
    const override = this.overrides.get(id);
    const detail: ProjectDetail = {
      ...base,
      ...(override?.name ? { name: override.name } : {}),
      ...(override?.summary ? { summary: override.summary } : {}),
      ...(override?.description ? { description: override.description } : {}),
      ...(override?.iconUrl ? { iconUrl: override.iconUrl } : {}),
      ...(override?.bannerUrl ? { bannerUrl: override.bannerUrl } : {}),
      ...(override?.featured !== null && override?.featured !== undefined ? { featured: override.featured } : {}),
      ...(override?.status ? { status: override.status } : {}),
      ...(override?.downloads !== null && override?.downloads !== undefined ? { downloads: override.downloads } : {}),
      ...(override?.followers !== null && override?.followers !== undefined ? { followers: override.followers } : {}),
      ...(override?.views !== null && override?.views !== undefined ? { views: override.views } : {}),
      ...(override?.rating !== null && override?.rating !== undefined ? { rating: override.rating } : {}),
    };
    if (userId) {
      detail.isFavorite = this.isFavorite(userId, slug);
      detail.isFollowed = this.isFollowed(userId, slug);
    }
    return detail;
  }

  getFeaturedSummaries(limit = 6): ProjectSummary[] {
    const all = this.listProjectSummaries({ sort: "downloads", perPage: 100 }).items;
    const featured = all.filter((p) => p.featured);
    return (featured.length > 0 ? featured : all).slice(0, limit);
  }

  getSiteStats() {
    const projects = [...this.projects.values()];
    return {
      downloads: projects.reduce((sum, p) => sum + p.downloads, 0),
      followers: projects.reduce((sum, p) => sum + p.followers, 0),
      views: projects.reduce((sum, p) => sum + p.views, 0),
      projects: projects.length,
      versions: projects.reduce((sum, p) => sum + p.versions.length, 0),
      updatedAt: new Date(),
    };
  }

  recordProjectView(slug: string, userId?: string | null): void {
    const id = this.slugIndex.get(slug);
    if (!id) return;
    const project = this.projects.get(id);
    if (project) {
      project.views += 1;
      this.projects.set(id, project);
    }
    if (userId) {
      const list = this.recentlyViewed.get(userId) ?? [];
      const filtered = list.filter((entry) => entry.projectId !== id);
      filtered.unshift({ projectId: id, viewedAt: new Date() });
      this.recentlyViewed.set(userId, filtered.slice(0, 20));
    }
  }

  // --- Favorites / follows --------------------------------------------

  isFavorite(userId: string, slug: string): boolean {
    const id = this.slugIndex.get(slug);
    return id ? (this.favorites.get(userId)?.has(id) ?? false) : false;
  }

  isFollowed(userId: string, slug: string): boolean {
    const id = this.slugIndex.get(slug);
    return id ? (this.follows.get(userId)?.has(id) ?? false) : false;
  }

  toggleFavorite(userId: string, slug: string, add: boolean): boolean {
    const id = this.slugIndex.get(slug);
    if (!id) return false;
    const set = this.favorites.get(userId) ?? new Map<string, Date>();
    if (add) set.set(id, new Date());
    else set.delete(id);
    this.favorites.set(userId, set);
    return true;
  }

  toggleFollow(userId: string, slug: string, add: boolean): boolean {
    const id = this.slugIndex.get(slug);
    if (!id) return false;
    const set = this.follows.get(userId) ?? new Map<string, Date>();
    if (add) {
      set.set(id, new Date());
      const project = this.projects.get(id);
      if (project) {
        project.followers += 1;
        this.projects.set(id, project);
      }
    } else {
      if (!set.has(id)) return false;
      set.delete(id);
      const project = this.projects.get(id);
      if (project) {
        project.followers = Math.max(0, project.followers - 1);
        this.projects.set(id, project);
      }
    }
    this.follows.set(userId, set);
    return true;
  }

  listFavoriteSummaries(userId: string): ProjectSummary[] {
    const ids = [...(this.favorites.get(userId)?.keys() ?? [])];
    return ids.map((id) => this.projects.get(id)).filter(Boolean).map((p) => toProjectSummary(p as ProjectDetail));
  }

  listFollowSummaries(userId: string): ProjectSummary[] {
    const ids = [...(this.follows.get(userId)?.keys() ?? [])];
    return ids.map((id) => this.projects.get(id)).filter(Boolean).map((p) => toProjectSummary(p as ProjectDetail));
  }

  listRecentlyViewedSummaries(userId: string): ProjectSummary[] {
    const entries = this.recentlyViewed.get(userId) ?? [];
    return entries
      .map((entry) => this.projects.get(entry.projectId))
      .filter(Boolean)
      .map((p) => toProjectSummary(p as ProjectDetail));
  }

  recordUserDownload(userId: string, slug: string, fileId: string | null): void {
    const id = this.slugIndex.get(slug);
    if (!id) return;
    const list = this.userDownloads.get(userId) ?? [];
    list.unshift({ projectId: id, fileId, downloadedAt: new Date() });
    this.userDownloads.set(userId, list.slice(0, 100));
    const project = this.projects.get(id);
    if (project) {
      project.downloads += 1;
      this.projects.set(id, project);
    }
  }

  listUserDownloads(userId: string): Array<{ project: ProjectSummary; downloadedAt: Date; fileId: string | null }> {
    const entries = this.userDownloads.get(userId) ?? [];
    return entries
      .map((entry) => {
        const project = this.projects.get(entry.projectId);
        return project ? { project: toProjectSummary(project), downloadedAt: entry.downloadedAt, fileId: entry.fileId } : null;
      })
      .filter(Boolean) as Array<{ project: ProjectSummary; downloadedAt: Date; fileId: string | null }>;
  }

  // --- Notifications / prefs ------------------------------------------

  createNotification(userId: string, input: { type: NotificationType; title: string; body?: string; link?: string; projectId?: string }): void {
    const list = this.notifications.get(userId) ?? [];
    list.unshift({
      id: uid(),
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      projectId: input.projectId ?? null,
      readAt: null,
      createdAt: new Date(),
    });
    this.notifications.set(userId, list.slice(0, 200));
  }

  listNotifications(userId: string): NotificationDto[] {
    return this.notifications.get(userId) ?? [];
  }

  unreadCount(userId: string): number {
    return (this.notifications.get(userId) ?? []).filter((n) => !n.readAt).length;
  }

  markNotificationsRead(userId: string, ids?: string[]): void {
    const list = this.notifications.get(userId) ?? [];
    const now = new Date();
    for (const notification of list) {
      if (!ids || ids.includes(notification.id)) notification.readAt = now;
    }
    this.notifications.set(userId, list);
  }

  getPrefs(userId: string): NotificationPreferenceDto {
    return this.users.get(userId)?.prefs ?? defaultPrefs();
  }

  updatePrefs(userId: string, prefs: NotificationPreferenceDto): void {
    const user = this.users.get(userId);
    if (user) user.prefs = prefs;
  }

  // --- Login history ---------------------------------------------------

  recordLogin(entry: Omit<LoginHistoryDto, "id" | "createdAt">): void {
    const list = this.loginHistory.get(entry.userId) ?? [];
    list.unshift({ ...entry, id: uid(), createdAt: new Date() });
    this.loginHistory.set(entry.userId, list.slice(0, 100));
  }

  listLoginHistory(userId: string, limit = 50): LoginHistoryDto[] {
    return (this.loginHistory.get(userId) ?? []).slice(0, limit);
  }

  // --- Analytics ---------------------------------------------------------

  recordAnalytics(row: Omit<AnalyticsRow, "id" | "createdAt">): void {
    this.analytics.push({ ...row, id: uid(), createdAt: new Date() });
    if (this.analytics.length > 100_000) this.analytics.splice(0, this.analytics.length - 100_000);
  }

  queryAnalytics(options: { type?: EventType; from?: Date; to?: Date; projectId?: string; limit?: number } = {}): AnalyticsRow[] {
    return this.analytics
      .filter((row) => {
        if (options.type && row.type !== options.type) return false;
        if (options.projectId && row.projectId !== options.projectId) return false;
        if (options.from && row.createdAt < options.from) return false;
        if (options.to && row.createdAt > options.to) return false;
        return true;
      })
      .slice(-(options.limit ?? 5000));
  }

  // --- Announcements / sections / socials --------------------------------

  listActiveAnnouncements(): AnnouncementDto[] {
    const now = new Date();
    return [...this.announcements.values()]
      .filter((a) => a.active && (!a.startsAt || a.startsAt <= now) && (!a.endsAt || a.endsAt >= now))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  listCategories(): Array<{ slug: string; name: string }> {
    return [...this.categories.values()];
  }

  addComment(slug: string, userId: string, content: string): { id: string; content: string; authorName: string; createdAt: Date } | null {
    const id = this.slugIndex.get(slug);
    const project = id ? this.projects.get(id) : null;
    const user = this.getUserById(userId);
    if (!project || !user) return null;
    const comment = {
      id: uid(),
      content,
      authorName: user.displayName ?? user.name ?? "Player",
      createdAt: new Date(),
    };
    project.comments.unshift(comment);
    this.projects.set(project.id, project);
    return comment;
  }

  listAllAnnouncements(): AnnouncementDto[] {
    return [...this.announcements.values()].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  upsertAnnouncement(input: AnnouncementDto): void {
    this.announcements.set(input.slug, input);
  }

  deleteAnnouncement(slug: string): void {
    this.announcements.delete(slug);
  }

  listSections(): HomeSectionDto[] {
    return [...this.sections.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  upsertSection(section: HomeSectionDto): void {
    this.sections.set(section.key, section);
  }

  listSocials(): SocialLinkDto[] {
    return [...this.socials.values()].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  upsertSocial(social: SocialLinkDto): void {
    this.socials.set(social.platform, social);
  }

  deleteSocial(platform: string): void {
    this.socials.delete(platform);
  }

  // --- Sync / audit / errors ----------------------------------------------

  getSyncState(key: string): SyncStateDto {
    return (
      this.syncStates.get(key) ?? {
        key,
        status: "IDLE",
        message: null,
        projectsSynced: 0,
        durationMs: 0,
        lastRunAt: null,
        updatedAt: new Date(),
      }
    );
  }

  setSyncState(key: string, patch: Partial<SyncStateDto>): SyncStateDto {
    const current = this.getSyncState(key);
    const next: SyncStateDto = { ...current, ...patch, key, updatedAt: new Date() };
    this.syncStates.set(key, next);
    return next;
  }

  logAudit(entry: Omit<AuditLogDto, "id" | "createdAt">): void {
    this.auditLogs.unshift({ ...entry, id: uid(), createdAt: new Date() });
    if (this.auditLogs.length > 5000) this.auditLogs.length = 5000;
  }

  listAuditLogs(limit = 200): AuditLogDto[] {
    return this.auditLogs.slice(0, limit);
  }

  logApiError(input: { route: string; method: string; status: number; message: string | null; stack: string | null }): void {
    this.apiErrors.unshift({ id: uid(), createdAt: new Date(), ...input });
    if (this.apiErrors.length > 5000) this.apiErrors.length = 5000;
  }

  listApiErrors(limit = 100) {
    return this.apiErrors.slice(0, limit);
  }

  clearApiErrors(): void {
    this.apiErrors = [];
  }

  // --- Overrides ------------------------------------------------------------

  getOverride(projectId: string): ProjectOverrideDto | null {
    return this.overrides.get(projectId) ?? null;
  }

  upsertOverride(projectId: string, patch: Omit<ProjectOverrideDto, "id" | "projectId" | "updatedAt">): ProjectOverrideDto {
    const current = this.overrides.get(projectId);
    const next: ProjectOverrideDto = {
      id: current?.id ?? uid(),
      projectId,
      name: patch.name ?? current?.name ?? null,
      summary: patch.summary ?? current?.summary ?? null,
      description: patch.description ?? current?.description ?? null,
      iconUrl: patch.iconUrl ?? current?.iconUrl ?? null,
      bannerUrl: patch.bannerUrl ?? current?.bannerUrl ?? null,
      featured: patch.featured !== undefined ? patch.featured : (current?.featured ?? null),
      status: patch.status ?? current?.status ?? null,
      downloads: patch.downloads !== undefined ? patch.downloads : (current?.downloads ?? null),
      followers: patch.followers !== undefined ? patch.followers : (current?.followers ?? null),
      views: patch.views !== undefined ? patch.views : (current?.views ?? null),
      rating: patch.rating !== undefined ? patch.rating : (current?.rating ?? null),
      updatedAt: new Date(),
    };
    this.overrides.set(projectId, next);
    return next;
  }

  upsertCurseForgeProject(detail: ProjectDetail): void {
    const existingId = this.slugIndex.get(detail.slug);
    if (existingId && existingId !== detail.id) {
      this.projects.delete(existingId);
    }
    this.projects.set(detail.id, detail);
    this.slugIndex.set(detail.slug, detail.id);
    for (const category of detail.categories) {
      if (!this.categories.has(category.slug)) this.categories.set(category.slug, category);
    }
    for (const tag of detail.tags) {
      if (!this.tags.has(tag.slug)) this.tags.set(tag.slug, tag);
    }
  }
}

function defaultPrefs(): NotificationPreferenceDto {
  return {
    emailEnabled: true,
    digestEnabled: true,
    digestFrequency: "WEEKLY",
    projectNotifications: true,
    follows: true,
    comments: true,
    announcements: true,
  };
}

function toUserDto(user: MemoryUserRecord): UserDto {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    displayName: user.displayName,
    role: user.role,
    isBanned: user.isBanned,
    authVersion: user.authVersion,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

export function toProjectSummary(project: ProjectDetail): ProjectSummary {
  return {
    id: project.id,
    slug: project.slug,
    name: project.name,
    summary: project.summary,
    type: project.type,
    curseforgeId: project.curseforgeId ?? null,
    authorName: project.authorName,
    studioName: project.studioName,
    iconUrl: project.iconUrl,
    bannerUrl: project.bannerUrl,
    featured: project.featured,
    status: project.status,
    downloads: project.downloads,
    followers: project.followers,
    views: project.views,
    rating: project.rating,
    lastSyncedAt: project.lastSyncedAt,
    minecraftVersions: project.minecraftVersions,
    loaders: project.loaders,
    categories: project.categories,
    tags: project.tags,
    latestVersion: project.versions[0]?.version ?? null,
    updatedAt: project.updatedAt,
  };
}

export async function getCommunityStats(): Promise<CommunityStatsDto> {
  const env = getServerEnv();
  const youtubeSubscribers = (await getYouTubeSubscribers()) ?? env.COMMUNITY_YOUTUBE_SUBSCRIBERS;
  return {
    discordMembers: env.COMMUNITY_DISCORD_MEMBERS,
    youtubeSubscribers,
    githubStars: env.COMMUNITY_GITHUB_STARS,
    discordUrl: env.COMMUNITY_DISCORD_URL,
    youtubeUrl: env.COMMUNITY_YOUTUBE_URL,
    githubUrl: env.COMMUNITY_GITHUB_URL,
  };
}

export const memoryStore = new MemoryDataStore();

export function resetMemoryStore(): void {
  memoryStore.users.clear();
  memoryStore.accounts.clear();
  memoryStore.sessions.clear();
  memoryStore.verificationTokens.clear();
  memoryStore.projects.clear();
  memoryStore.categories.clear();
  memoryStore.tags.clear();
  memoryStore.notifications.clear();
  memoryStore.loginHistory.clear();
  memoryStore.analytics = [];
  memoryStore.announcements.clear();
  memoryStore.syncStates.clear();
  memoryStore.auditLogs = [];
  memoryStore.apiErrors = [];
  memoryStore.sections.clear();
  memoryStore.socials.clear();
  memoryStore.overrides.clear();
  memoryStore.emailIndex.clear();
  memoryStore.accountIndex.clear();
  memoryStore.sessionIndex.clear();
  memoryStore.verificationIndex.clear();
  memoryStore.slugIndex.clear();
  memoryStore.favorites.clear();
  memoryStore.follows.clear();
  memoryStore.recentlyViewed.clear();
  memoryStore.userDownloads.clear();
  memoryStore.seeded = false;
  memoryStore.seeding = null;
}
