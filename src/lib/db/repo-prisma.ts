import "server-only";
import {
  EventType as PrismaEventType,
  FileType as PrismaFileType,
  NotificationType as PrismaNotificationType,
  Prisma,
  ProjectType as PrismaProjectType,
  Role as PrismaRole,
  SocialPlatform as PrismaSocialPlatform,
} from "@prisma/client";
import { getCommunityStats } from "@/lib/db/memory-store";
import type { DataRepo, UserPatch } from "@/lib/db/data-repo";
import { detailInclude, mapDetail, mapSummary, summaryInclude } from "@/lib/db/mappers";
import { getPrisma } from "@/lib/db/prisma";
import type {
  AnnouncementDto,
  ApiErrorDto,
  AuditLogDto,
  ChatbotKnowledgeDocDto,
  HomeSectionDto,
  LoginHistoryDto,
  NotificationDto,
  NotificationPreferenceDto,
  ProfileDto,
  ProjectDetail,
  ProjectFilters,
  ProjectListResult,
  ProjectOverrideDto,
  ProjectSummary,
  Role,
  SiteStatsDto,
  SocialLinkDto,
  SyncStateDto,
  UserDto,
} from "@/lib/db/types";

function requireDb(): NonNullable<ReturnType<typeof getPrisma>> {
  const prisma = getPrisma();
  if (!prisma) throw new Error("PostgreSQL is not reachable but DATA_BACKEND is set to prisma");
  return prisma;
}

function mapHomeSection(row: {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  enabled: boolean;
  sortOrder: number;
  content: Prisma.JsonValue | null;
}): HomeSectionDto {
  const content = row.content && typeof row.content === "object" && !Array.isArray(row.content)
    ? (row.content as Record<string, unknown>)
    : null;
  return { id: row.id, key: row.key, title: row.title, subtitle: row.subtitle, enabled: row.enabled, sortOrder: row.sortOrder, content };
}

function toUserDto(row: {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  displayName: string | null;
  role: Role;
  isBanned: boolean;
  isPro: boolean;
  authVersion: number;
  emailVerified: Date | null;
  createdAt: Date;
}): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    image: row.image,
    displayName: row.displayName,
    role: row.role,
    isBanned: row.isBanned,
    isPro: row.isPro,
    authVersion: row.authVersion,
    emailVerified: row.emailVerified,
    createdAt: row.createdAt,
  };
}

const DEFAULT_PREFS: NotificationPreferenceDto = {
  emailEnabled: true,
  digestEnabled: true,
  digestFrequency: "WEEKLY",
  projectNotifications: true,
  follows: true,
  comments: true,
  announcements: true,
};

export const prismaRepo: DataRepo = {
  async listProjects(filters: ProjectFilters = {}): Promise<ProjectListResult> {
    const prisma = requireDb();
    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 12;
    const where: Prisma.ProjectWhereInput = {};

    if (filters.type) where.type = filters.type as PrismaProjectType;
    if (filters.search) {
      const q = filters.search;
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { summary: { contains: q, mode: "insensitive" } },
        { authorName: { contains: q, mode: "insensitive" } },
        { tags: { some: { tag: { name: { contains: q, mode: "insensitive" } } } } },
      ];
    }
    if (filters.versions?.length || filters.loaders?.length) {
      const versionWhere: Prisma.ProjectVersionWhereInput = {};
      if (filters.versions?.length) versionWhere.minecraftVersions = { hasSome: filters.versions };
      if (filters.loaders?.length) versionWhere.loaders = { hasSome: filters.loaders };
      where.versions = { some: versionWhere };
    }
    if (filters.categories?.length) where.categories = { some: { category: { slug: { in: filters.categories } } } };
    if (filters.platform === "curseforge") where.curseforgeId = { not: null };

    const orderBy: Prisma.ProjectOrderByWithRelationInput[] =
      filters.sort === "name"
        ? [{ name: "asc" }]
        : filters.sort === "newest"
          ? [{ createdAt: "desc" }]
          : filters.sort === "updated"
            ? [{ updatedAt: "desc" }]
            : filters.sort === "followers"
              ? [{ followers: "desc" }]
              : filters.sort === "views"
                ? [{ views: "desc" }]
                : [{ downloads: "desc" }];

    const rows = await prisma.project.findMany({
      where,
      include: summaryInclude,
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    });
    const total = await prisma.project.count({ where });
    return {
      items: rows.map(mapSummary),
      total,
      page,
      perPage,
      totalPages: Math.max(1, Math.ceil(total / perPage)),
    };
  },

  async getProjectBySlug(slug: string, userId?: string | null): Promise<ProjectDetail | null> {
    const prisma = requireDb();
    const row = await prisma.project.findUnique({ where: { slug }, include: detailInclude });
    if (!row) return null;
    let isFavorite: boolean | undefined;
    let isFollowed: boolean | undefined;
    if (userId) {
      const [favorite, follow] = await Promise.all([
        prisma.favorite.findUnique({ where: { userId_projectId: { userId, projectId: row.id } }, select: { id: true } }),
        prisma.follow.findUnique({ where: { userId_projectId: { userId, projectId: row.id } }, select: { id: true } }),
      ]);
      isFavorite = Boolean(favorite);
      isFollowed = Boolean(follow);
    }
    return mapDetail(row, { isFavorite, isFollowed });
  },

  async upsertCurseForgeProject(detail) {
    const prisma = requireDb();
    const desiredId = detail.id;
    const baseData = {
      slug: detail.slug,
      name: detail.name,
      summary: detail.summary,
      description: detail.description,
      type: detail.type as PrismaProjectType,
      authorName: detail.authorName,
      studioName: detail.studioName,
      curseforgeId: detail.curseforgeId,
      githubUrl: detail.githubUrl,
      curseforgeUrl: detail.curseforgeUrl,
      iconUrl: detail.iconUrl,
      bannerUrl: detail.bannerUrl,
      featured: detail.featured,
      status: detail.status,
      downloads: detail.downloads,
      followers: detail.followers,
      views: detail.views,
      rating: detail.rating,
      lastSyncedAt: new Date(),
    };
    await prisma.$transaction(async (tx) => {
      const projectRow = await tx.project.upsert({
        where: { slug: detail.slug },
        create: { id: desiredId, ...baseData },
        update: baseData,
      });
      const projectId = projectRow.id;
      await tx.projectCategory.deleteMany({ where: { projectId } });
      for (const category of detail.categories) {
        const row = await tx.category.upsert({
          where: { slug: category.slug },
          create: { slug: category.slug, name: category.name },
          update: { name: category.name },
        });
        await tx.projectCategory.create({ data: { projectId, categoryId: row.id } });
      }
      await tx.projectTag.deleteMany({ where: { projectId } });
      for (const tag of detail.tags) {
        const row = await tx.tag.upsert({
          where: { slug: tag.slug },
          create: { slug: tag.slug, name: tag.name },
          update: { name: tag.name },
        });
        await tx.projectTag.create({ data: { projectId, tagId: row.id } });
      }
      await tx.projectVersion.deleteMany({ where: { projectId } });
      for (const version of detail.versions) {
        await tx.projectVersion.create({
          data: {
            projectId,
            version: version.version,
            minecraftVersions: version.minecraftVersions,
            loaders: version.loaders,
            changelog: version.changelog,
            releaseDate: version.releaseDate,
            releaseType: version.releaseType as PrismaFileType,
            isLatest: version.isLatest,
            files: {
              create: version.files.map((file) => ({
                fileName: file.fileName,
                fileSize: file.fileSize,
                downloads: file.downloads,
                downloadUrl: file.downloadUrl,
                sha1: file.sha1,
                kind: file.kind,
              })),
            },
          },
        });
      }
      await tx.screenshot.deleteMany({ where: { projectId } });
      for (const screenshot of detail.screenshots) {
        await tx.screenshot.create({
          data: { projectId, url: screenshot.url, title: screenshot.title, alt: screenshot.alt, sortOrder: screenshot.sortOrder },
        });
      }
      await tx.projectDependency.deleteMany({ where: { projectId } });
      for (const dependency of detail.dependencies) {
        await tx.projectDependency.create({
          data: { projectId, name: dependency.name, slug: dependency.slug, required: dependency.required, kind: dependency.kind },
        });
      }
      await tx.changelogEntry.deleteMany({ where: { projectId } });
      for (const changelog of detail.changelogs) {
        await tx.changelogEntry.create({
          data: { projectId, version: changelog.version, title: changelog.title, content: changelog.content, publishedAt: changelog.publishedAt },
        });
      }
      await tx.documentationPage.deleteMany({ where: { projectId } });
      for (const doc of detail.docs) {
        await tx.documentationPage.create({
          data: { projectId, slug: doc.slug, title: doc.title, content: doc.content, sortOrder: doc.sortOrder },
        });
      }
    });
  },

  async getFeaturedProjects(limit = 6): Promise<ProjectSummary[]> {
    const prisma = requireDb();
    let rows = await prisma.project.findMany({
      where: { featured: true },
      include: summaryInclude,
      orderBy: { downloads: "desc" },
      take: limit,
    });
    if (rows.length === 0) {
      rows = await prisma.project.findMany({
        include: summaryInclude,
        orderBy: { downloads: "desc" },
        take: limit,
      });
    }
    return rows.map(mapSummary);
  },

  async getSiteStats(): Promise<SiteStatsDto> {
    const prisma = requireDb();
    const [aggregate, versions] = await Promise.all([
      prisma.project.aggregate({
        _sum: { downloads: true, followers: true, views: true },
        _count: { _all: true },
      }),
      prisma.projectVersion.count(),
    ]);
    return {
      downloads: aggregate._sum.downloads ?? 0,
      followers: aggregate._sum.followers ?? 0,
      views: aggregate._sum.views ?? 0,
      projects: aggregate._count._all,
      versions,
      updatedAt: new Date(),
    };
  },

  async getCommunityStats() {
    return getCommunityStats();
  },

  async getActiveAnnouncements(): Promise<AnnouncementDto[]> {
    const prisma = requireDb();
    const now = new Date();
    const rows = await prisma.announcement.findMany({
      where: {
        active: true,
        OR: [{ startsAt: null }, { startsAt: { lte: now } }],
        AND: [{ OR: [{ endsAt: null }, { endsAt: { gte: now } }] }],
      },
      orderBy: { createdAt: "desc" },
    });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      body: row.body,
      active: row.active,
      dismissible: row.dismissible,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
    }));
  },

  async getEnabledSections(): Promise<HomeSectionDto[]> {
    const prisma = requireDb();
    const rows = await prisma.homeSection.findMany({
      where: { enabled: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map(mapHomeSection);
  },

  async getSocialLinks(): Promise<SocialLinkDto[]> {
    const prisma = requireDb();
    const rows = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((row) => ({ id: row.id, platform: row.platform, label: row.label, url: row.url, sortOrder: row.sortOrder }));
  },

  async listCategories() {
    const prisma = requireDb();
    const rows = await prisma.category.findMany({ orderBy: { name: "asc" } });
    return rows.map((row) => ({ slug: row.slug, name: row.name }));
  },

  async addComment(slug, userId, content) {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return null;
    const row = await prisma.projectComment.create({
      data: { projectId: project.id, userId, content },
      include: { user: { select: { name: true, displayName: true } } },
    });
    return {
      id: row.id,
      content: row.content,
      authorName: row.user.displayName ?? row.user.name ?? "Player",
      createdAt: row.createdAt,
    };
  },

  async recordProjectView(slug: string, userId?: string | null): Promise<void> {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return;
    await prisma.project.update({ where: { id: project.id }, data: { views: { increment: 1 } } });
    if (userId) {
      await prisma.recentlyViewed.upsert({
        where: { userId_projectId: { userId, projectId: project.id } },
        create: { userId, projectId: project.id },
        update: { viewedAt: new Date() },
      });
    }
  },

  async recordAnalyticsEvent(input) {
    const prisma = requireDb();
    await prisma.analyticsEvent.create({
      data: {
        type: input.type as PrismaEventType,
        userId: input.userId ?? null,
        projectId: input.projectId ?? null,
        sessionId: input.sessionId ?? null,
        path: input.path ?? null,
        referrer: input.referrer ?? null,
      },
    });
  },

  async queryAnalytics(input) {
    const prisma = requireDb();
    const rows = await prisma.analyticsEvent.findMany({
      where: {
        ...(input.type ? { type: input.type as PrismaEventType } : {}),
        ...(input.projectId ? { projectId: input.projectId } : {}),
        ...(input.from || input.to
          ? { createdAt: { ...(input.from ? { gte: input.from } : {}), ...(input.to ? { lte: input.to } : {}) } }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: input.limit ?? 5000,
    });
    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      userId: row.userId,
      projectId: row.projectId,
      sessionId: row.sessionId,
      path: row.path,
      referrer: row.referrer,
      createdAt: row.createdAt,
    }));
  },

  async createUser(input) {
    const prisma = requireDb();
    const row = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        passwordHash: input.passwordHash,
        emailVerified: input.emailVerified ?? null,
        displayName: input.name,
      },
    });
    return toUserDto(row);
  },

  async getUserAuthByEmail(email) {
    const prisma = requireDb();
    const row = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!row) return null;
    return { user: toUserDto(row), passwordHash: row.passwordHash };
  },

  async getUserById(id) {
    const prisma = requireDb();
    const row = await prisma.user.findUnique({ where: { id } });
    return row ? toUserDto(row) : null;
  },

  async updateUser(id: string, patch: UserPatch) {
    const prisma = requireDb();
    const data: Prisma.UserUpdateInput = {};
    if (patch.name !== undefined) data.name = patch.name;
    if (patch.email !== undefined) data.email = patch.email?.toLowerCase() ?? null;
    if (patch.emailVerified !== undefined) data.emailVerified = patch.emailVerified;
    if (patch.image !== undefined) data.image = patch.image;
    if (patch.passwordHash !== undefined) data.passwordHash = patch.passwordHash;
    if (patch.role !== undefined) data.role = patch.role as PrismaRole;
    if (patch.isBanned !== undefined) data.isBanned = patch.isBanned;
    if (patch.isPro !== undefined) data.isPro = patch.isPro;
    if (patch.authVersion !== undefined) data.authVersion = patch.authVersion;
    if (patch.displayName !== undefined) data.displayName = patch.displayName;
    if (patch.avatar !== undefined) data.avatar = patch.avatar;
    const row = await prisma.user.update({ where: { id }, data });
    return toUserDto(row);
  },

  async deleteUser(id) {
    const prisma = requireDb();
    await prisma.user.delete({ where: { id } });
  },

  async revokeUserSessions(userId) {
    const prisma = requireDb();
    await prisma.user.update({ where: { id: userId }, data: { authVersion: { increment: 1 } } });
  },

  async createVerificationToken(identifier, token, expires) {
    const prisma = requireDb();
    await prisma.verificationToken.create({ data: { identifier, token, expires } });
  },

  async useVerificationToken(identifier, token) {
    const prisma = requireDb();
    const row = await prisma.verificationToken.findUnique({ where: { identifier_token: { identifier, token } } });
    if (!row) return false;
    await prisma.verificationToken.delete({ where: { identifier_token: { identifier, token } } });
    return true;
  },

  async listUsers(search, page, perPage) {
    const prisma = requireDb();
    const where: Prisma.UserWhereInput = search
      ? {
          OR: [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
            { displayName: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};
    const [rows, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * perPage, take: perPage }),
      prisma.user.count({ where }),
    ]);
    return { items: rows.map(toUserDto), total };
  },

  async getProfile(userId): Promise<ProfileDto | null> {
    const prisma = requireDb();
    const row = await prisma.profile.findUnique({ where: { userId } });
    if (!row) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { displayName: true, name: true } });
      if (!user) return null;
      return { displayName: user.displayName ?? user.name, bio: null, website: null, preferredVersions: [], preferredLoaders: [] };
    }
    return {
      displayName: row.displayName,
      bio: row.bio,
      website: row.website,
      preferredVersions: row.preferredVersions,
      preferredLoaders: row.preferredLoaders,
    };
  },

  async updateProfile(userId, patch) {
    const prisma = requireDb();
    await prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        displayName: patch.displayName ?? null,
        bio: patch.bio ?? null,
        website: patch.website ?? null,
        preferredVersions: patch.preferredVersions ?? [],
        preferredLoaders: patch.preferredLoaders ?? [],
      },
      update: {
        ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
        ...(patch.bio !== undefined ? { bio: patch.bio } : {}),
        ...(patch.website !== undefined ? { website: patch.website || null } : {}),
        ...(patch.preferredVersions !== undefined ? { preferredVersions: patch.preferredVersions } : {}),
        ...(patch.preferredLoaders !== undefined ? { preferredLoaders: patch.preferredLoaders } : {}),
      },
    });
    if (patch.displayName !== undefined) {
      await prisma.user.update({ where: { id: userId }, data: { displayName: patch.displayName } });
    }
  },

  async recordLogin(userId, input) {
    const prisma = requireDb();
    await prisma.loginHistory.create({
      data: {
        userId,
        provider: input.provider,
        ip: input.ip ?? null,
        userAgent: input.userAgent ?? null,
        success: input.success ?? true,
        reason: input.reason ?? null,
      },
    });
  },

  async listLoginHistory(userId): Promise<LoginHistoryDto[]> {
    const prisma = requireDb();
    const rows = await prisma.loginHistory.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
    return rows.map((row) => ({
      id: row.id,
      userId: row.userId,
      provider: row.provider,
      ip: row.ip,
      userAgent: row.userAgent,
      success: row.success,
      reason: row.reason,
      createdAt: row.createdAt,
    }));
  },

  async getNotificationPrefs(userId): Promise<NotificationPreferenceDto> {
    const prisma = requireDb();
    const row = await prisma.notificationPreference.findUnique({ where: { userId } });
    if (!row) return DEFAULT_PREFS;
    return {
      emailEnabled: row.emailEnabled,
      digestEnabled: row.digestEnabled,
      digestFrequency: row.digestFrequency,
      projectNotifications: row.projectNotifications,
      follows: row.follows,
      comments: row.comments,
      announcements: row.announcements,
    };
  },

  async updateNotificationPrefs(userId, prefs) {
    const prisma = requireDb();
    await prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...prefs },
      update: prefs,
    });
  },

  async listNotifications(userId): Promise<NotificationDto[]> {
    const prisma = requireDb();
    const rows = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 50 });
    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      link: row.link,
      projectId: row.projectId,
      readAt: row.readAt,
      createdAt: row.createdAt,
    }));
  },

  async getUnreadCount(userId) {
    const prisma = requireDb();
    return prisma.notification.count({ where: { userId, readAt: null } });
  },

  async markNotificationsRead(userId, ids) {
    const prisma = requireDb();
    await prisma.notification.updateMany({
      where: { userId, ...(ids ? { id: { in: ids } } : {}), readAt: null },
      data: { readAt: new Date() },
    });
  },

  async createNotification(userId, input) {
    const prisma = requireDb();
    await prisma.notification.create({
      data: {
        userId,
        type: input.type as PrismaNotificationType,
        title: input.title,
        body: input.body ?? null,
        link: input.link ?? null,
        projectId: input.projectId ?? null,
      },
    });
  },

  async toggleFavorite(userId, slug, add) {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return false;
    if (add) {
      await prisma.favorite.upsert({
        where: { userId_projectId: { userId, projectId: project.id } },
        create: { userId, projectId: project.id },
        update: {},
      });
    } else {
      await prisma.favorite.deleteMany({ where: { userId, projectId: project.id } });
    }
    return true;
  },

  async toggleFollow(userId, slug, add) {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return false;
    if (add) {
      await prisma.follow.upsert({
        where: { userId_projectId: { userId, projectId: project.id } },
        create: { userId, projectId: project.id },
        update: {},
      });
      await prisma.project.update({ where: { id: project.id }, data: { followers: { increment: 1 } } });
    } else {
      const deleted = await prisma.follow.deleteMany({ where: { userId, projectId: project.id } });
      if (deleted.count > 0) {
        await prisma.project.update({ where: { id: project.id }, data: { followers: { decrement: 1 } } });
      }
    }
    return true;
  },

  async isFavorite(userId, slug) {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return false;
    const row = await prisma.favorite.findUnique({ where: { userId_projectId: { userId, projectId: project.id } }, select: { id: true } });
    return Boolean(row);
  },

  async isFollowed(userId, slug) {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return false;
    const row = await prisma.follow.findUnique({ where: { userId_projectId: { userId, projectId: project.id } }, select: { id: true } });
    return Boolean(row);
  },

  async listFavorites(userId): Promise<ProjectSummary[]> {
    const prisma = requireDb();
    const rows = await prisma.favorite.findMany({
      where: { userId },
      include: { project: { include: summaryInclude } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((row) => mapSummary(row.project));
  },

  async listFollows(userId): Promise<ProjectSummary[]> {
    const prisma = requireDb();
    const rows = await prisma.follow.findMany({
      where: { userId },
      include: { project: { include: summaryInclude } },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    return rows.map((row) => mapSummary(row.project));
  },

  async listRecentlyViewed(userId): Promise<ProjectSummary[]> {
    const prisma = requireDb();
    const rows = await prisma.recentlyViewed.findMany({
      where: { userId },
      include: { project: { include: summaryInclude } },
      orderBy: { viewedAt: "desc" },
      take: 20,
    });
    return rows.map((row) => mapSummary(row.project));
  },

  async recordUserDownload(userId, slug, fileId = null) {
    const prisma = requireDb();
    const project = await prisma.project.findUnique({ where: { slug }, select: { id: true } });
    if (!project) return;
    await Promise.all([
      prisma.project.update({ where: { id: project.id }, data: { downloads: { increment: 1 } } }),
      prisma.userDownload.create({ data: { userId, projectId: project.id, fileId } }),
    ]);
  },

  async listUserDownloads(userId) {
    const prisma = requireDb();
    const rows = await prisma.userDownload.findMany({
      where: { userId },
      include: { project: { include: summaryInclude } },
      orderBy: { downloadedAt: "desc" },
      take: 100,
    });
    return rows.map((row) => ({ project: mapSummary(row.project), downloadedAt: row.downloadedAt, fileId: row.fileId }));
  },

  async getSyncState(key): Promise<SyncStateDto> {
    const prisma = requireDb();
    const row = await prisma.syncState.findUnique({ where: { key } });
    if (row) {
      return {
        key: row.key,
        status: row.status as SyncStateDto["status"],
        message: row.message,
        projectsSynced: row.projectsSynced,
        durationMs: row.durationMs,
        lastRunAt: row.lastRunAt,
        updatedAt: row.updatedAt,
      };
    }
    return {
      key,
      status: "IDLE",
      message: null,
      projectsSynced: 0,
      durationMs: 0,
      lastRunAt: null,
      updatedAt: new Date(),
    };
  },

  async setSyncState(key, patch) {
    const prisma = requireDb();
    const row = await prisma.syncState.upsert({
      where: { key },
      create: { key, status: patch.status ?? "IDLE", message: patch.message ?? null, projectsSynced: patch.projectsSynced ?? 0, durationMs: patch.durationMs ?? 0, lastRunAt: patch.lastRunAt ?? null },
      update: {
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.message !== undefined ? { message: patch.message } : {}),
        ...(patch.projectsSynced !== undefined ? { projectsSynced: patch.projectsSynced } : {}),
        ...(patch.durationMs !== undefined ? { durationMs: patch.durationMs } : {}),
        ...(patch.lastRunAt !== undefined ? { lastRunAt: patch.lastRunAt } : {}),
      },
    });
    return {
      key: row.key,
      status: row.status as SyncStateDto["status"],
      message: row.message,
      projectsSynced: row.projectsSynced,
      durationMs: row.durationMs,
      lastRunAt: row.lastRunAt,
      updatedAt: row.updatedAt,
    };
  },

  async logAudit(input) {
    const prisma = requireDb();
    await prisma.auditLog.create({
      data: {
        actorId: input.actorId ?? null,
        action: input.action,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null,
        details: (input.details as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  },

  async listAuditLogs(limit = 200): Promise<AuditLogDto[]> {
    const prisma = requireDb();
    const rows = await prisma.auditLog.findMany({
      include: { actor: { select: { name: true, displayName: true } } },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.map((row) => ({
      id: row.id,
      actorId: row.actorId,
      actorName: row.actor ? (row.actor.displayName ?? row.actor.name) : null,
      action: row.action,
      targetType: row.targetType,
      targetId: row.targetId,
      details: row.details as Record<string, unknown> | null,
      createdAt: row.createdAt,
    }));
  },

  async logApiError(input) {
    const prisma = requireDb();
    await prisma.apiErrorLog.create({
      data: { route: input.route, method: input.method, status: input.status, message: input.message, stack: input.stack },
    });
  },

  async listApiErrors(limit = 100): Promise<ApiErrorDto[]> {
    const prisma = requireDb();
    const rows = await prisma.apiErrorLog.findMany({ orderBy: { createdAt: "desc" }, take: limit });
    return rows.map((row) => ({
      id: row.id,
      route: row.route,
      method: row.method,
      status: row.status,
      message: row.message,
      stack: row.stack,
      createdAt: row.createdAt,
    }));
  },

  async clearApiErrors() {
    const prisma = requireDb();
    await prisma.apiErrorLog.deleteMany({});
  },

  async getProjectOverride(projectId) {
    const prisma = requireDb();
    const row = await prisma.customProject.findUnique({ where: { projectId } });
    if (!row) return null;
    return {
      id: row.id,
      projectId: row.projectId,
      name: row.name,
      summary: row.summary,
      description: row.description,
      iconUrl: row.iconUrl,
      bannerUrl: row.bannerUrl,
      featured: row.featured,
      status: row.status,
      downloads: row.downloads,
      followers: row.followers,
      views: row.views,
      rating: row.rating,
      updatedAt: row.updatedAt,
    };
  },

  async upsertProjectOverride(projectId, patch): Promise<ProjectOverrideDto> {
    const prisma = requireDb();
    const data = {
      name: patch.name ?? null,
      summary: patch.summary ?? null,
      description: patch.description ?? null,
      iconUrl: patch.iconUrl ?? null,
      bannerUrl: patch.bannerUrl ?? null,
      featured: patch.featured ?? null,
      status: patch.status ?? null,
      downloads: patch.downloads ?? null,
      followers: patch.followers ?? null,
      views: patch.views ?? null,
      rating: patch.rating ?? null,
    };
    const row = await prisma.customProject.upsert({
      where: { projectId },
      create: { projectId, ...data },
      update: data,
    });
    return { id: row.id, projectId: row.projectId, updatedAt: row.updatedAt, ...data };
  },

  async listAllAnnouncements(): Promise<AnnouncementDto[]> {
    const prisma = requireDb();
    const rows = await prisma.announcement.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      body: row.body,
      active: row.active,
      dismissible: row.dismissible,
      startsAt: row.startsAt,
      endsAt: row.endsAt,
      createdAt: row.createdAt,
    }));
  },

  async upsertAnnouncement(input) {
    const prisma = requireDb();
    await prisma.announcement.upsert({
      where: { slug: input.slug },
      create: { slug: input.slug, title: input.title, body: input.body, active: input.active, dismissible: input.dismissible, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null },
      update: { title: input.title, body: input.body, active: input.active, dismissible: input.dismissible, startsAt: input.startsAt ?? null, endsAt: input.endsAt ?? null },
    });
  },

  async deleteAnnouncement(slug) {
    const prisma = requireDb();
    await prisma.announcement.deleteMany({ where: { slug } });
  },

  async listAllSections(): Promise<HomeSectionDto[]> {
    const prisma = requireDb();
    const rows = await prisma.homeSection.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map(mapHomeSection);
  },

  async upsertSection(input) {
    const prisma = requireDb();
    await prisma.homeSection.upsert({
      where: { key: input.key },
      create: { key: input.key, title: input.title, subtitle: input.subtitle, enabled: input.enabled, sortOrder: input.sortOrder, content: input.content ? (input.content as Prisma.InputJsonValue) : Prisma.DbNull },
      update: { title: input.title, subtitle: input.subtitle, enabled: input.enabled, sortOrder: input.sortOrder, content: input.content ? (input.content as Prisma.InputJsonValue) : Prisma.DbNull },
    });
  },

  async listAllSocials(): Promise<SocialLinkDto[]> {
    const prisma = requireDb();
    const rows = await prisma.socialLink.findMany({ orderBy: { sortOrder: "asc" } });
    return rows.map((row) => ({ id: row.id, platform: row.platform, label: row.label, url: row.url, sortOrder: row.sortOrder }));
  },

  async upsertSocial(input) {
    const prisma = requireDb();
    const existing = await prisma.socialLink.findFirst({ where: { platform: input.platform as PrismaSocialPlatform } });
    if (existing) {
      await prisma.socialLink.update({ where: { id: existing.id }, data: { label: input.label, url: input.url, sortOrder: input.sortOrder } });
    } else {
      await prisma.socialLink.create({ data: { platform: input.platform as PrismaSocialPlatform, label: input.label, url: input.url, sortOrder: input.sortOrder } });
    }
  },

  async deleteSocial(platform) {
    const prisma = requireDb();
    await prisma.socialLink.deleteMany({ where: { platform: platform as PrismaSocialPlatform } });
  },

  async countChatMessagesByUser(userId, since) {
    const prisma = requireDb();
    return prisma.chatMessage.count({ where: { userId, role: "user", createdAt: { gte: since } } });
  },

  async countChatMessagesByGuest(guestId) {
    const prisma = requireDb();
    return prisma.chatMessage.count({ where: { guestId, role: "user" } });
  },

  async listChatMessages({ userId = null, guestId = null, limit = 50 }) {
    const prisma = requireDb();
    const rows = await prisma.chatMessage.findMany({
      where: {
        AND: [{ ...(userId ? { userId } : { userId: null }) }, { ...(guestId ? { guestId } : { guestId: null }) }],
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
    return rows.reverse().map((row) => ({
      id: row.id,
      userId: row.userId,
      guestId: row.guestId,
      role: row.role,
      content: row.content,
      topic: row.topic,
      model: row.model,
      promptTokens: row.promptTokens,
      completionTokens: row.completionTokens,
      durationMs: row.durationMs,
      createdAt: row.createdAt,
    }));
  },

  async addChatMessage(input) {
    const prisma = requireDb();
    await prisma.chatMessage.create({
      data: {
        userId: input.userId ?? null,
        guestId: input.guestId ?? null,
        role: input.role,
        content: input.content,
        topic: input.topic ?? null,
        model: input.model ?? "deepseek-chat",
        promptTokens: input.promptTokens ?? 0,
        completionTokens: input.completionTokens ?? 0,
        durationMs: input.durationMs ?? 0,
      },
    });
  },

  async listKnowledgeDocs(): Promise<ChatbotKnowledgeDocDto[]> {
    const prisma = requireDb();
    const rows = await prisma.chatbotKnowledgeDoc.findMany({ orderBy: [{ source: "asc" }, { slug: "asc" }] });
    return rows.map((row) => ({
      id: row.id,
      source: row.source,
      projectId: row.projectId,
      slug: row.slug,
      title: row.title,
      content: row.content,
      filePath: row.filePath,
      updatedAt: row.updatedAt,
    }));
  },

  async upsertKnowledgeDoc(input) {
    const prisma = requireDb();
    await prisma.chatbotKnowledgeDoc.upsert({
      where: { source_slug: { source: input.source, slug: input.slug } },
      create: {
        source: input.source,
        slug: input.slug,
        title: input.title,
        content: input.content,
        projectId: input.projectId ?? null,
        filePath: input.filePath ?? null,
      },
      update: {
        title: input.title,
        content: input.content,
        projectId: input.projectId ?? null,
        filePath: input.filePath ?? null,
      },
    });
  },
};
