import "server-only";
import type {
  CfFile,
  CfMod,
} from "@/lib/curseforge/types";
import type {
  Loader,
  ProjectDetail,
  ProjectSummary,
  ProjectVersionDto,
} from "@/lib/db/types";

export const CF_RELEASE_TYPES: Record<number, "RELEASE" | "BETA" | "ALPHA"> = {
  1: "RELEASE",
  2: "BETA",
  3: "ALPHA",
};

const LOADER_MAP: Record<string, Loader> = {
  neoforge: "NEOFORGE",
  fabric: "FABRIC",
  forge: "FORGE",
  quilt: "QUILT",
  spigot: "SPIGOT",
  paper: "PAPER",
  velocity: "VELOCITY",
};

export function mapCfLoader(value: string | undefined): Loader | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase().replace(/[^a-z]/g, "");
  return LOADER_MAP[normalized];
}

function mapVersion(file: CfFile): ProjectVersionDto {
  const loaders = (file.sortableGameVersion ?? [])
    .map((v) => v.gameVersionType)
    .map((t) => mapCfLoader(t))
    .filter((l): l is Loader => Boolean(l));
  const minecraftVersions = (file.gameVersions ?? [])
    .filter((v) => /^\d/.test(v) && !loaders.includes(v as Loader))
    .slice(0, 8);
  return {
    id: `cf-file-${file.id}`,
    version: file.displayName,
    minecraftVersions,
    loaders: [...new Set(loaders)],
    changelog: null,
    releaseDate: new Date(file.fileDate),
    releaseType: CF_RELEASE_TYPES[file.releaseType] ?? "RELEASE",
    isLatest: false,
    files: [
      {
        id: `cf-file-${file.id}`,
        fileName: file.fileName,
        fileSize: file.fileLength,
        downloads: file.downloadCount,
        downloadUrl: file.downloadUrl,
        sha1: (file.hashes ?? []).find((h) => h.algo === 1)?.value ?? null,
        kind: "primary",
      },
    ],
  };
}

export function mapCfModToSummary(mod: CfMod): ProjectSummary {
  const latestFile = (mod.latestFiles ?? [])[0];
  const minecraftVersions = latestFile
    ? (latestFile.gameVersions ?? []).filter((v) => /^\d/.test(v)).slice(0, 8)
    : [];
  const loaders = (mod.latestFiles ?? []).flatMap((f) =>
    (f.sortableGameVersion ?? []).map((v) => v.gameVersionType).map((t) => mapCfLoader(t)),
  );
  return {
    id: `cf-${mod.id}`,
    slug: mod.slug,
    name: mod.name,
    summary: mod.summary,
    type: "MOD",
    curseforgeId: mod.id,
    authorName: (mod.authors ?? [])[0]?.name ?? "NightBeam Studio",
    studioName: "NightBeam Studio",
    iconUrl: mod.logo?.url ?? null,
    bannerUrl: (mod.screenshots ?? [])[0]?.url ?? null,
    featured: mod.isFeatured,
    status: mod.status === 4 ? "ACTIVE" : mod.status === 5 ? "ARCHIVED" : "ACTIVE",
    downloads: mod.downloadCount,
    followers: 0,
    views: 0,
    rating: 0,
    lastSyncedAt: new Date(),
    minecraftVersions,
    loaders: [...new Set(loaders.filter((l): l is Loader => Boolean(l)))],
    categories: (mod.categories ?? []).map((c) => ({ slug: c.slug, name: c.name })),
    tags: (mod.categories ?? []).map((c) => ({ slug: c.slug, name: c.name.toLowerCase() })),
    latestVersion: latestFile?.displayName ?? null,
    updatedAt: new Date(mod.dateModified),
  };
}

export function mapCfModToDetail(mod: CfMod, files: CfFile[]): ProjectDetail {
  const summary = mapCfModToSummary(mod);
  const versions = (files.length > 0 ? files : (mod.latestFiles ?? []))
    .filter((f) => f.isAvailable)
    .sort((a, b) => b.fileDate.localeCompare(a.fileDate))
    .map(mapVersion);
  if (versions.length > 0) versions[0].isLatest = true;

  return {
    ...summary,
    description: mod.description,
    curseforgeUrl: mod.links?.websiteUrl ?? `https://www.curseforge.com/minecraft/mc-mods/${mod.slug}`,
    githubUrl: mod.links?.sourceUrl ?? null,
    versions,
    screenshots: (mod.screenshots ?? []).map((s, index) => ({
      id: `cf-shot-${s.id}`,
      url: s.url,
      title: s.title || null,
      alt: s.description || s.title || mod.name,
      sortOrder: index,
    })),
    changelogs: [],
    docs: [],
    dependencies: [],
    comments: [],
  };
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
