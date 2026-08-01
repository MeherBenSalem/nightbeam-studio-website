import "server-only";
import { Prisma } from "@prisma/client";
import type {
  ProjectDetail,
  ProjectSummary,
  ProjectVersionDto,
} from "@/lib/db/types";

export const summaryInclude = {
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
  versions: {
    include: { files: true },
    orderBy: { releaseDate: "desc" as const },
    take: 1,
  },
  custom: true,
} satisfies Prisma.ProjectInclude;

export const detailInclude = {
  categories: { include: { category: true } },
  tags: { include: { tag: true } },
  versions: {
    include: { files: true },
    orderBy: { releaseDate: "desc" as const },
  },
  screenshots: { orderBy: { sortOrder: "asc" as const } },
  changelogs: { orderBy: { publishedAt: "desc" as const } },
  docs: { orderBy: { sortOrder: "asc" as const } },
  dependencies: true,
  comments: {
    include: {
      user: { select: { name: true, displayName: true, avatar: true } },
    },
    orderBy: { createdAt: "desc" as const },
  },
  custom: true,
} satisfies Prisma.ProjectInclude;

export type ProjectSummaryRow = Prisma.ProjectGetPayload<{ include: typeof summaryInclude }>;
export type ProjectDetailRow = Prisma.ProjectGetPayload<{ include: typeof detailInclude }>;

export function applyOverride<T extends ProjectSummary>(project: T, custom: { name?: string | null; summary?: string | null; iconUrl?: string | null; bannerUrl?: string | null; featured?: boolean | null; status?: string | null; downloads?: number | null; followers?: number | null; views?: number | null; rating?: number | null } | null): T {
  if (!custom) return project;
  return {
    ...project,
    ...(custom.name ? { name: custom.name } : {}),
    ...(custom.summary ? { summary: custom.summary } : {}),
    ...(custom.iconUrl ? { iconUrl: custom.iconUrl } : {}),
    ...(custom.bannerUrl ? { bannerUrl: custom.bannerUrl } : {}),
    ...(custom.featured !== null && custom.featured !== undefined ? { featured: custom.featured } : {}),
    ...(custom.status ? { status: custom.status } : {}),
    ...(custom.downloads !== null && custom.downloads !== undefined ? { downloads: custom.downloads } : {}),
    ...(custom.followers !== null && custom.followers !== undefined ? { followers: custom.followers } : {}),
    ...(custom.views !== null && custom.views !== undefined ? { views: custom.views } : {}),
    ...(custom.rating !== null && custom.rating !== undefined ? { rating: custom.rating } : {}),
  };
}

export function mapSummary(row: ProjectSummaryRow): ProjectSummary {
  const latest = row.versions[0];
  return applyOverride(
    {
      id: row.id,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      type: row.type,
      curseforgeId: row.curseforgeId,
      authorName: row.authorName,
      studioName: row.studioName,
      iconUrl: row.iconUrl,
      bannerUrl: row.bannerUrl,
      featured: row.featured,
      status: row.status,
      downloads: row.downloads,
      followers: row.followers,
      views: row.views,
      rating: row.rating,
      lastSyncedAt: row.lastSyncedAt,
      minecraftVersions: latest?.minecraftVersions ?? [],
      loaders: (latest?.loaders ?? []) as ProjectSummary["loaders"],
      categories: row.categories.map((c) => ({ slug: c.category.slug, name: c.category.name })),
      tags: row.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name })),
      latestVersion: latest?.version ?? null,
      updatedAt: row.updatedAt,
    },
    row.custom,
  );
}

function mapVersion(row: ProjectDetailRow["versions"][number]): ProjectVersionDto {
  return {
    id: row.id,
    version: row.version,
    minecraftVersions: row.minecraftVersions,
    loaders: row.loaders as ProjectVersionDto["loaders"],
    changelog: row.changelog,
    releaseDate: row.releaseDate,
    releaseType: row.releaseType,
    isLatest: row.isLatest,
    files: row.files.map((f) => ({
      id: f.id,
      fileName: f.fileName,
      fileSize: f.fileSize,
      downloads: f.downloads,
      downloadUrl: f.downloadUrl,
      sha1: f.sha1,
      kind: f.kind,
    })),
  };
}

export function mapDetail(row: ProjectDetailRow, extra?: { isFavorite?: boolean; isFollowed?: boolean }): ProjectDetail {
  const summary = applyOverride(
    {
      id: row.id,
      slug: row.slug,
      name: row.name,
      summary: row.summary,
      type: row.type,
      curseforgeId: row.curseforgeId,
      authorName: row.authorName,
      studioName: row.studioName,
      iconUrl: row.iconUrl,
      bannerUrl: row.bannerUrl,
      featured: row.featured,
      status: row.status,
      downloads: row.downloads,
      followers: row.followers,
      views: row.views,
      rating: row.rating,
      lastSyncedAt: row.lastSyncedAt,
      minecraftVersions: row.versions[0]?.minecraftVersions ?? [],
      loaders: (row.versions[0]?.loaders ?? []) as ProjectSummary["loaders"],
      categories: row.categories.map((c) => ({ slug: c.category.slug, name: c.category.name })),
      tags: row.tags.map((t) => ({ slug: t.tag.slug, name: t.tag.name })),
      latestVersion: row.versions[0]?.version ?? null,
      updatedAt: row.updatedAt,
    },
    row.custom,
  );
  return {
    ...summary,
    description: row.custom?.description ?? row.description,
    curseforgeUrl: row.curseforgeUrl,
    githubUrl: row.githubUrl,
    isFavorite: extra?.isFavorite,
    isFollowed: extra?.isFollowed,
    versions: row.versions.map(mapVersion),
    screenshots: row.screenshots.map((s) => ({ id: s.id, url: s.url, title: s.title, alt: s.alt, sortOrder: s.sortOrder })),
    changelogs: row.changelogs.map((c) => ({ id: c.id, version: c.version, title: c.title, content: c.content, publishedAt: c.publishedAt })),
    docs: row.docs.map((d) => ({ id: d.id, slug: d.slug, title: d.title, content: d.content, sortOrder: d.sortOrder })),
    dependencies: row.dependencies.map((d) => ({ id: d.id, name: d.name, slug: d.slug, required: d.required, kind: d.kind })),
    comments: row.comments.map((c) => ({
      id: c.id,
      content: c.content,
      authorName: c.user.displayName ?? c.user.name ?? "Player",
      createdAt: c.createdAt,
    })),
  };
}
