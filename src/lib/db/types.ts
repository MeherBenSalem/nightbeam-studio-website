// Public domain types shared by the data layer, API routes, and UI.

export type ProjectType = "MOD" | "MODPACK" | "PLUGIN" | "DATAPACK" | "RESOURCEPACK" | "SHADER" | "TOOL";
export type Loader = "NEOFORGE" | "FABRIC" | "FORGE" | "QUILT" | "SPIGOT" | "PAPER" | "VELOCITY" | "VANILLA";
export type FileType = "RELEASE" | "BETA" | "ALPHA";
export type Role = "SUPER_ADMIN" | "ADMIN" | "CONTENT_MANAGER" | "SUPPORT_AGENT" | "USER";
export type NotificationType = "SYSTEM" | "PROJECT" | "FOLLOW" | "COMMENT" | "DOWNLOAD" | "DIGEST";
export type EventType = "VIEW" | "DOWNLOAD" | "REDIRECT" | "SEARCH" | "FAVORITE" | "FOLLOW" | "SIGNUP" | "LOGIN";
export type SocialPlatform = "DISCORD" | "YOUTUBE" | "GITHUB" | "TWITCH" | "X";

export interface CategoryDto {
  slug: string;
  name: string;
}

export interface TagDto {
  slug: string;
  name: string;
}

export interface ProjectFileDto {
  id: string;
  fileName: string;
  fileSize: number;
  downloads: number;
  downloadUrl: string | null;
  sha1: string | null;
  kind: string;
}

export interface ProjectVersionDto {
  id: string;
  version: string;
  minecraftVersions: string[];
  loaders: string[];
  changelog: string | null;
  releaseDate: Date;
  releaseType: FileType;
  isLatest: boolean;
  files: ProjectFileDto[];
}

export interface ProjectSummary {
  id: string;
  slug: string;
  name: string;
  summary: string;
  type: ProjectType;
  curseforgeId: number | null;
  authorName: string;
  studioName: string;
  iconUrl: string | null;
  bannerUrl: string | null;
  featured: boolean;
  status: string;
  downloads: number;
  followers: number;
  views: number;
  rating: number;
  lastSyncedAt: Date | null;
  minecraftVersions: string[];
  loaders: Loader[];
  categories: CategoryDto[];
  tags: TagDto[];
  latestVersion: string | null;
  updatedAt: Date;
}

export interface ProjectDetail extends ProjectSummary {
  description: string;
  curseforgeUrl: string | null;
  githubUrl: string | null;
  isFavorite?: boolean;
  isFollowed?: boolean;
  versions: ProjectVersionDto[];
  screenshots: { id: string; url: string; title: string | null; alt: string | null; sortOrder: number }[];
  changelogs: { id: string; version: string; title: string; content: string; publishedAt: Date }[];
  docs: { id: string; slug: string; title: string; content: string; sortOrder: number }[];
  dependencies: { id: string; name: string; slug: string | null; required: boolean; kind: string }[];
  comments: { id: string; content: string; authorName: string; createdAt: Date }[];
}

export interface ProjectCommentDto {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
}

export interface ProjectFilters {
  type?: ProjectType;
  versions?: string[];
  loaders?: Loader[];
  categories?: string[];
  platform?: string;
  category?: string;
  loader?: Loader;
  version?: string;
  search?: string;
  sort?: "downloads" | "followers" | "views" | "updated" | "name" | "newest";
  page?: number;
  perPage?: number;
  view?: "grid" | "list";
}

export interface ProjectListResult {
  items: ProjectSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface AnnouncementDto {
  id: string;
  slug: string;
  title: string;
  body: string;
  active: boolean;
  dismissible: boolean;
  startsAt: Date | null;
  endsAt: Date | null;
  createdAt: Date;
}

export interface CommunityStatsDto {
  discordMembers: number;
  youtubeSubscribers: number;
  githubStars: number;
  discordUrl: string;
  youtubeUrl: string;
  githubUrl: string;
}

export interface SiteStatsDto {
  downloads: number;
  followers: number;
  views: number;
  projects: number;
  versions: number;
  updatedAt: Date;
}

export interface UserDto {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  displayName: string | null;
  role: Role;
  isBanned: boolean;
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripeSubscriptionStatus: string | null;
  authVersion: number;
  emailVerified: Date | null;
  createdAt: Date;
}

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  projectId: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export interface LoginHistoryDto {
  id: string;
  userId: string;
  provider: string;
  ip: string | null;
  userAgent: string | null;
  success: boolean;
  reason: string | null;
  createdAt: Date;
}

export interface AnalyticsRow {
  id: string;
  type: EventType;
  userId: string | null;
  projectId: string | null;
  sessionId: string | null;
  path: string | null;
  referrer: string | null;
  createdAt: Date;
}

export interface SyncStateDto {
  key: string;
  status: "IDLE" | "RUNNING" | "SUCCESS" | "ERROR";
  message: string | null;
  projectsSynced: number;
  durationMs: number;
  lastRunAt: Date | null;
  updatedAt: Date;
}

export interface NotificationPreferenceDto {
  emailEnabled: boolean;
  digestEnabled: boolean;
  digestFrequency: string;
  projectNotifications: boolean;
  follows: boolean;
  comments: boolean;
  announcements: boolean;
}

export interface ProjectOverrideDto {
  id: string;
  projectId: string;
  name: string | null;
  summary: string | null;
  description: string | null;
  iconUrl: string | null;
  bannerUrl: string | null;
  featured: boolean | null;
  status: string | null;
  downloads: number | null;
  followers: number | null;
  views: number | null;
  rating: number | null;
  updatedAt: Date;
}

export interface AuditLogDto {
  id: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface HomeSectionDto {
  id: string;
  key: string;
  title: string;
  subtitle: string | null;
  enabled: boolean;
  sortOrder: number;
  content: Record<string, unknown> | null;
}

export interface SocialLinkDto {
  id: string;
  platform: SocialPlatform;
  label: string | null;
  url: string;
  sortOrder: number;
}

export interface ProfileDto {
  displayName: string | null;
  bio: string | null;
  website: string | null;
  preferredVersions: string[];
  preferredLoaders: string[];
}

export interface ApiErrorDto {
  id: string;
  route: string;
  method: string;
  status: number;
  message: string | null;
  stack: string | null;
  createdAt: Date;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string | null;
  userId: string | null;
  guestId: string | null;
  role: string;
  content: string;
  topic: string | null;
  pinned: boolean;
  model: string;
  promptTokens: number;
  completionTokens: number;
  durationMs: number;
  createdAt: Date;
}

export interface ChatConversationSummaryDto {
  id: string;
  title: string;
  messageCount: number;
  pinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatbotKnowledgeDocDto {
  id: string;
  source: string;
  projectId: string | null;
  slug: string;
  title: string;
  content: string;
  filePath: string | null;
  updatedAt: Date;
}

export type StoreCategory = "plugins" | "models" | "configs" | "setups" | "other";

export interface StoreProductVersionDto {
  id: string;
  builtbybitId: number;
  version: string;
  downloadCount: number;
  releaseDate: Date;
  isLatest: boolean;
}

export interface StoreProductSummary {
  id: string;
  builtbybitId: number;
  slug: string;
  name: string;
  summary: string;
  category: StoreCategory;
  categoryLabel: string | null;
  url: string;
  iconUrl: string | null;
  bannerUrl: string | null;
  listPrice: number;
  finalPrice: number;
  currency: string;
  purchases: number;
  downloads: number;
  rating: number;
  reviewCount: number;
  isFree: boolean;
  latestVersion: string | null;
  status: string;
  featured: boolean;
  lastSyncedAt: Date | null;
  publishedAt: Date | null;
  updatedAt: Date;
}

export interface StoreProductDetail extends StoreProductSummary {
  description: string;
  versions: StoreProductVersionDto[];
  isOwned?: boolean;
}

export interface StoreFilters {
  category?: StoreCategory;
  search?: string;
  sort?: "purchases" | "price" | "updated" | "name" | "downloads";
  page?: number;
  perPage?: number;
}

export interface StoreListResult {
  items: StoreProductSummary[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}
