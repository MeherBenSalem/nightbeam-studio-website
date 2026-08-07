import { JAUML_CONTENT } from "@/content/projects/jauml";
import type { ProjectContentPack, ProjectDocSeed } from "@/content/projects/types";

/** Authored project documentation packs (sourced from real project repos before publish). */
export const PROJECT_CONTENT_PACKS: ProjectContentPack[] = [JAUML_CONTENT];

const bySlug = new Map(PROJECT_CONTENT_PACKS.map((pack) => [pack.slug, pack]));

export function getProjectContentPack(slug: string): ProjectContentPack | undefined {
  return bySlug.get(slug);
}

export function getProjectDocSeeds(slug: string): ProjectDocSeed[] {
  return bySlug.get(slug)?.docs ?? [];
}

export function listDocumentedProjectSlugs(): string[] {
  return PROJECT_CONTENT_PACKS.map((pack) => pack.slug);
}
