/** Authored documentation pages attached to a catalog / synced project. */
export type ProjectDocSeed = {
  slug: string;
  title: string;
  sortOrder: number;
  content: string;
};

export type ProjectContentPack = {
  slug: string;
  /** Human-readable source note for maintainers (repo path, release, etc.). */
  source: string;
  docs: ProjectDocSeed[];
};
