import "server-only";
import type { DataRepo, UserPatch } from "@/lib/db/data-repo";
import { getCommunityStats, memoryStore, type MemoryUserRecord } from "@/lib/db/memory-store";
import type {
  AnnouncementDto,
  ApiErrorDto,
  AuditLogDto,
  HomeSectionDto,
  NotificationDto,
  ProfileDto,
  ProjectDetail,
  ProjectListResult,
  ProjectOverrideDto,
  SocialLinkDto,
  SyncStateDto,
  UserDto,
} from "@/lib/db/types";

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

export const memoryRepo: DataRepo = {
  async listProjects(filters): Promise<ProjectListResult> {
    await memoryStore.ensureSeeded();
    return memoryStore.listProjectSummaries(filters);
  },

  async getProjectBySlug(slug, userId?): Promise<ProjectDetail | null> {
    await memoryStore.ensureSeeded();
    return memoryStore.getProjectDetail(slug, userId);
  },

  async upsertCurseForgeProject(detail) {
    await memoryStore.ensureSeeded();
    memoryStore.upsertCurseForgeProject(detail);
  },

  async getFeaturedProjects(limit = 6) {
    await memoryStore.ensureSeeded();
    return memoryStore.getFeaturedSummaries(limit);
  },

  async getSiteStats() {
    await memoryStore.ensureSeeded();
    return memoryStore.getSiteStats();
  },

  async getCommunityStats() {
    await memoryStore.ensureSeeded();
    return getCommunityStats();
  },

  async getActiveAnnouncements(): Promise<AnnouncementDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listActiveAnnouncements();
  },

  async getEnabledSections(): Promise<HomeSectionDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listSections().filter((s) => s.enabled);
  },

  async getSocialLinks(): Promise<SocialLinkDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listSocials();
  },

  async listCategories() {
    await memoryStore.ensureSeeded();
    return memoryStore.listCategories();
  },

  async addComment(slug, userId, content) {
    await memoryStore.ensureSeeded();
    return memoryStore.addComment(slug, userId, content);
  },

  async recordProjectView(slug, userId?) {
    await memoryStore.ensureSeeded();
    memoryStore.recordProjectView(slug, userId);
  },

  async recordAnalyticsEvent(input) {
    await memoryStore.ensureSeeded();
    memoryStore.recordAnalytics({
      type: input.type,
      userId: input.userId ?? null,
      projectId: input.projectId ?? null,
      sessionId: input.sessionId ?? null,
      path: input.path ?? null,
      referrer: input.referrer ?? null,
    });
  },

  async queryAnalytics(input) {
    await memoryStore.ensureSeeded();
    return memoryStore.queryAnalytics(input);
  },

  async createUser(input) {
    await memoryStore.ensureSeeded();
    return toUserDto(
      memoryStore.createUser({
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        emailVerified: input.emailVerified ?? null,
      }),
    );
  },

  async getUserAuthByEmail(email) {
    await memoryStore.ensureSeeded();
    const user = memoryStore.getUserByEmail(email);
    return user ? { user: toUserDto(user), passwordHash: user.passwordHash } : null;
  },

  async getUserById(id) {
    await memoryStore.ensureSeeded();
    const user = memoryStore.getUserById(id);
    return user ? toUserDto(user) : null;
  },

  async updateUser(id, patch: UserPatch) {
    await memoryStore.ensureSeeded();
    const updated = memoryStore.updateUser(id, patch);
    return updated ? toUserDto(updated) : null;
  },

  async deleteUser(id) {
    await memoryStore.ensureSeeded();
    memoryStore.deleteUser(id);
  },

  async revokeUserSessions(userId) {
    await memoryStore.ensureSeeded();
    const user = memoryStore.getUserById(userId);
    if (user) memoryStore.updateUser(userId, { authVersion: user.authVersion + 1 });
  },

  async createVerificationToken(identifier, token, expires) {
    await memoryStore.ensureSeeded();
    memoryStore.createVerificationToken(identifier, token, expires);
  },

  async useVerificationToken(identifier, token) {
    await memoryStore.ensureSeeded();
    return Boolean(memoryStore.useVerificationToken(identifier, token));
  },

  async listUsers(search, page, perPage) {
    await memoryStore.ensureSeeded();
    return memoryStore.listUsers(search, page, perPage);
  },

  async getProfile(userId): Promise<ProfileDto | null> {
    await memoryStore.ensureSeeded();
    const user = memoryStore.getUserById(userId);
    if (!user) return null;
    return { ...user.profile };
  },

  async updateProfile(userId, patch) {
    await memoryStore.ensureSeeded();
    memoryStore.updateProfile(userId, patch);
    if (patch.displayName !== undefined) memoryStore.updateUser(userId, { displayName: patch.displayName });
  },

  async recordLogin(userId, input) {
    await memoryStore.ensureSeeded();
    memoryStore.recordLogin({
      userId,
      provider: input.provider,
      ip: input.ip ?? null,
      userAgent: input.userAgent ?? null,
      success: input.success ?? true,
      reason: input.reason ?? null,
    });
  },

  async listLoginHistory(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.listLoginHistory(userId);
  },

  async getNotificationPrefs(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.getPrefs(userId);
  },

  async updateNotificationPrefs(userId, prefs) {
    await memoryStore.ensureSeeded();
    memoryStore.updatePrefs(userId, prefs);
  },

  async listNotifications(userId): Promise<NotificationDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listNotifications(userId);
  },

  async getUnreadCount(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.unreadCount(userId);
  },

  async markNotificationsRead(userId, ids) {
    await memoryStore.ensureSeeded();
    memoryStore.markNotificationsRead(userId, ids);
  },

  async createNotification(userId, input) {
    await memoryStore.ensureSeeded();
    memoryStore.createNotification(userId, input);
  },

  async toggleFavorite(userId, slug, add) {
    await memoryStore.ensureSeeded();
    return memoryStore.toggleFavorite(userId, slug, add);
  },

  async toggleFollow(userId, slug, add) {
    await memoryStore.ensureSeeded();
    return memoryStore.toggleFollow(userId, slug, add);
  },

  async isFavorite(userId, slug) {
    await memoryStore.ensureSeeded();
    return memoryStore.isFavorite(userId, slug);
  },

  async isFollowed(userId, slug) {
    await memoryStore.ensureSeeded();
    return memoryStore.isFollowed(userId, slug);
  },

  async listFavorites(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.listFavoriteSummaries(userId);
  },

  async listFollows(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.listFollowSummaries(userId);
  },

  async listRecentlyViewed(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.listRecentlyViewedSummaries(userId);
  },

  async recordUserDownload(userId, slug, fileId = null) {
    await memoryStore.ensureSeeded();
    memoryStore.recordUserDownload(userId, slug, fileId);
  },

  async listUserDownloads(userId) {
    await memoryStore.ensureSeeded();
    return memoryStore.listUserDownloads(userId);
  },

  async getSyncState(key): Promise<SyncStateDto> {
    await memoryStore.ensureSeeded();
    return memoryStore.getSyncState(key);
  },

  async setSyncState(key, patch) {
    await memoryStore.ensureSeeded();
    return memoryStore.setSyncState(key, patch);
  },

  async logAudit(input) {
    await memoryStore.ensureSeeded();
    memoryStore.logAudit({
      actorId: input.actorId ?? null,
      actorName: input.actorName ?? null,
      action: input.action,
      targetType: input.targetType ?? null,
      targetId: input.targetId ?? null,
      details: input.details ?? null,
    });
  },

  async listAuditLogs(limit = 200): Promise<AuditLogDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listAuditLogs(limit);
  },

  async logApiError(input) {
    await memoryStore.ensureSeeded();
    memoryStore.logApiError(input);
  },

  async listApiErrors(limit = 100): Promise<ApiErrorDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listApiErrors(limit);
  },

  async clearApiErrors() {
    await memoryStore.ensureSeeded();
    memoryStore.clearApiErrors();
  },

  async getProjectOverride(projectId): Promise<ProjectOverrideDto | null> {
    await memoryStore.ensureSeeded();
    return memoryStore.getOverride(projectId);
  },

  async upsertProjectOverride(projectId, patch): Promise<ProjectOverrideDto> {
    await memoryStore.ensureSeeded();
    return memoryStore.upsertOverride(projectId, patch);
  },

  async listAllAnnouncements(): Promise<AnnouncementDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listAllAnnouncements();
  },

  async upsertAnnouncement(input) {
    await memoryStore.ensureSeeded();
    memoryStore.upsertAnnouncement(input);
  },

  async deleteAnnouncement(slug) {
    await memoryStore.ensureSeeded();
    memoryStore.deleteAnnouncement(slug);
  },

  async listAllSections(): Promise<HomeSectionDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listSections();
  },

  async upsertSection(input) {
    await memoryStore.ensureSeeded();
    memoryStore.upsertSection(input);
  },

  async listAllSocials(): Promise<SocialLinkDto[]> {
    await memoryStore.ensureSeeded();
    return memoryStore.listSocials();
  },

  async upsertSocial(input) {
    await memoryStore.ensureSeeded();
    memoryStore.upsertSocial(input);
  },

  async deleteSocial(platform) {
    await memoryStore.ensureSeeded();
    memoryStore.deleteSocial(platform);
  },
};
