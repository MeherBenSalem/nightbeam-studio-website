import type {
  AnalyticsRow,
  AnnouncementDto,
  ApiErrorDto,
  AuditLogDto,
  ChatbotKnowledgeDocDto,
  ChatConversationSummaryDto,
  ChatMessageDto,
  CommunityStatsDto,
  ProjectCommentDto,
  EventType,
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

export interface UserPatch {
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  passwordHash?: string | null;
  role?: Role;
  isBanned?: boolean;
  isPro?: boolean;
  authVersion?: number;
  displayName?: string | null;
  avatar?: string | null;
}

export interface ApiErrorInput {
  route: string;
  method: string;
  status: number;
  message: string | null;
  stack: string | null;
}

export interface AuditLogInput {
  actorId?: string | null;
  actorName?: string | null;
  action: string;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
}

export interface DataRepo {
  listProjects(filters: ProjectFilters): Promise<ProjectListResult>;
  getProjectBySlug(slug: string, userId?: string | null): Promise<ProjectDetail | null>;
  upsertCurseForgeProject(detail: ProjectDetail): Promise<void>;
  getFeaturedProjects(limit?: number): Promise<ProjectSummary[]>;
  getSiteStats(): Promise<SiteStatsDto>;
  getCommunityStats(): Promise<CommunityStatsDto>;
  getActiveAnnouncements(): Promise<AnnouncementDto[]>;
  getEnabledSections(): Promise<HomeSectionDto[]>;
  getSocialLinks(): Promise<SocialLinkDto[]>;
  listCategories(): Promise<{ slug: string; name: string }[]>;
  addComment(slug: string, userId: string, content: string): Promise<ProjectCommentDto | null>;
  recordProjectView(slug: string, userId?: string | null): Promise<void>;

  recordAnalyticsEvent(input: {
    type: EventType;
    userId?: string | null;
    projectId?: string | null;
    sessionId?: string | null;
    path?: string | null;
    referrer?: string | null;
  }): Promise<void>;
  queryAnalytics(input: { type?: EventType; from?: Date; to?: Date; projectId?: string; limit?: number }): Promise<AnalyticsRow[]>;

  createUser(input: {
    name: string;
    email: string;
    passwordHash: string;
    emailVerified?: Date | null;
    preferredVersions?: string[];
    preferredLoaders?: string[];
  }): Promise<UserDto>;
  getUserAuthByEmail(email: string): Promise<{ user: UserDto; passwordHash: string | null } | null>;
  getUserById(id: string): Promise<UserDto | null>;
  updateUser(id: string, patch: UserPatch): Promise<UserDto | null>;
  deleteUser(id: string): Promise<void>;
  listUsers(search: string, page: number, perPage: number): Promise<{ items: UserDto[]; total: number }>;
  revokeUserSessions(userId: string): Promise<void>;
  createVerificationToken(identifier: string, token: string, expires: Date): Promise<void>;
  useVerificationToken(identifier: string, token: string): Promise<boolean>;

  getProfile(userId: string): Promise<ProfileDto | null>;
  updateProfile(userId: string, patch: Partial<ProfileDto>): Promise<void>;

  recordLogin(userId: string, input: { provider: string; ip?: string | null; userAgent?: string | null; success?: boolean; reason?: string | null }): Promise<void>;
  listLoginHistory(userId: string): Promise<LoginHistoryDto[]>;

  getNotificationPrefs(userId: string): Promise<NotificationPreferenceDto>;
  updateNotificationPrefs(userId: string, prefs: NotificationPreferenceDto): Promise<void>;
  listNotifications(userId: string): Promise<NotificationDto[]>;
  getUnreadCount(userId: string): Promise<number>;
  markNotificationsRead(userId: string, ids?: string[]): Promise<void>;
  createNotification(userId: string, input: { type: NotificationDto["type"]; title: string; body?: string; link?: string; projectId?: string }): Promise<void>;

  toggleFavorite(userId: string, slug: string, add: boolean): Promise<boolean>;
  toggleFollow(userId: string, slug: string, add: boolean): Promise<boolean>;
  isFavorite(userId: string, slug: string): Promise<boolean>;
  isFollowed(userId: string, slug: string): Promise<boolean>;
  listFavorites(userId: string): Promise<ProjectSummary[]>;
  listFollows(userId: string): Promise<ProjectSummary[]>;
  listRecentlyViewed(userId: string): Promise<ProjectSummary[]>;
  recordUserDownload(userId: string, slug: string, fileId?: string | null): Promise<void>;
  listUserDownloads(userId: string): Promise<Array<{ project: ProjectSummary; downloadedAt: Date; fileId: string | null }>>;

  getSyncState(key: string): Promise<SyncStateDto>;
  setSyncState(key: string, patch: Partial<SyncStateDto>): Promise<SyncStateDto>;
  logAudit(input: AuditLogInput): Promise<void>;
  listAuditLogs(limit?: number): Promise<AuditLogDto[]>;
  logApiError(input: ApiErrorInput): Promise<void>;
  listApiErrors(limit?: number): Promise<ApiErrorDto[]>;
  clearApiErrors(): Promise<void>;

  getProjectOverride(projectId: string): Promise<ProjectOverrideDto | null>;
  upsertProjectOverride(projectId: string, patch: Omit<ProjectOverrideDto, "id" | "projectId" | "updatedAt">): Promise<ProjectOverrideDto>;
  listAllAnnouncements(): Promise<AnnouncementDto[]>;
  upsertAnnouncement(input: AnnouncementDto): Promise<void>;
  deleteAnnouncement(slug: string): Promise<void>;
  listAllSections(): Promise<HomeSectionDto[]>;
  upsertSection(input: HomeSectionDto): Promise<void>;
  listAllSocials(): Promise<SocialLinkDto[]>;
  upsertSocial(input: SocialLinkDto): Promise<void>;
  deleteSocial(platform: string): Promise<void>;

  countChatMessagesByUser(userId: string, since: Date): Promise<number>;
  countChatMessagesByGuest(guestId: string): Promise<number>;
  listChatConversations(input: { userId?: string | null; guestId?: string | null }): Promise<ChatConversationSummaryDto[]>;
  listChatMessages(input: {
    userId?: string | null;
    guestId?: string | null;
    conversationId?: string | null;
    limit?: number;
  }): Promise<ChatMessageDto[]>;
  addChatMessage(input: {
    conversationId?: string | null;
    userId?: string | null;
    guestId?: string | null;
    role: string;
    content: string;
    topic?: string | null;
    model?: string;
    promptTokens?: number;
    completionTokens?: number;
    durationMs?: number;
  }): Promise<void>;
  listKnowledgeDocs(): Promise<ChatbotKnowledgeDocDto[]>;
  upsertKnowledgeDoc(input: {
    source: string;
    slug: string;
    title: string;
    content: string;
    projectId?: string | null;
    filePath?: string | null;
  }): Promise<void>;
}
