// Minimal typed views of the CurseForge API v1 payloads we consume.

export interface CfGame {
  id: number;
  name: string;
  slug: string;
  status: number;
}

export interface CfAuthor {
  name: string;
  url: string;
}

export interface CfAsset {
  url: string;
  thumbnailUrl?: string;
}

export interface CfCategory {
  id: number;
  name: string;
  slug: string;
  classId: number;
  parentGameCategoryId?: number;
}

export interface CfFileHash {
  value: string;
  algo: number;
}

export interface CfSortableVersion {
  gameVersion: string;
  gameVersionName?: string;
  gameVersionTypeId?: number;
  gameVersionType?: string;
}

export interface CfFile {
  id: number;
  modId: number;
  isAvailable: boolean;
  displayName: string;
  fileName: string;
  releaseType: number; // 1 release, 2 beta, 3 alpha
  fileStatus: number;
  fileDate: string;
  fileLength: number;
  downloadCount: number;
  downloadUrl: string;
  gameVersions: string[];
  sortableGameVersion: CfSortableVersion[];
  hashes: CfFileHash[];
}

export interface CfScreenshot {
  id: number;
  modId: number;
  title: string;
  description: string;
  thumbnailUrl: string;
  url: string;
}

export interface CfMod {
  id: number;
  gameId: number;
  name: string;
  slug: string;
  summary: string;
  description: string;
  links: {
    websiteUrl?: string;
    wikiUrl?: string;
    issuesUrl?: string;
    sourceUrl?: string;
  };
  authors: CfAuthor[];
  logo?: CfAsset;
  screenshots: CfScreenshot[];
  mainFileId: number;
  latestFiles: CfFile[];
  latestFilesIndexes: Array<{
    gameVersion: string;
    fileId: number;
    filename: string;
    releaseType: number;
    modLoader?: string;
  }>;
  dateCreated: string;
  dateModified: string;
  dateReleased: string;
  isFeatured: boolean;
  popularityScore: number;
  gamePopularityRank: number;
  downloadCount: number;
  thumbsUpCount: number;
  categories: CfCategory[];
  status: number;
  classId: number;
}

export interface CfSearchResponse {
  data: CfMod[];
  pagination: {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
  };
}

export interface CfModResponse {
  data: CfMod;
}

export interface CfFilesResponse {
  data: CfFile[];
  pagination: {
    index: number;
    pageSize: number;
    resultCount: number;
    totalCount: number;
  };
}
