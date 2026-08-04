import "server-only";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createCache } from "@/lib/curseforge/cache";
import { getServerEnv } from "@/lib/config/env";
import { getRepo } from "@/lib/db/repo";
import type { KnowledgeDoc } from "@/lib/chatbot/types";

const knowledgeCache = createCache({ prefix: "chat:kb:", ttl: 900 });

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  if (!match) return null;
  return match[1].trim().replace(/[`*_]/g, "").slice(0, 120);
}

/** Loads markdown docs from CHATBOT_KB_ROOTS (docs/** + root-level *.md). */
async function loadDocsFromDisk(roots: string[]): Promise<KnowledgeDoc[]> {
  const docs: KnowledgeDoc[] = [];
  for (const root of roots) {
    const source = path.basename(root).toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "knowledge";
    let entries;
    try {
      entries = await readdir(root, { withFileTypes: true, recursive: true });
    } catch {
      continue; // Unreadable root — skip (memory mode without the repo checked out).
    }
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) continue;
      const parent = entry.parentPath ?? "";
      const relDir = path.relative(root, parent).split(path.sep).join("/");
      const parts = relDir ? relDir.split("/") : [];
      // Only docs/** and root-level markdown (e.g. PATCH_NOTES.md).
      if (parts.length > 0 && parts[0] !== "docs") continue;
      if (parts.length === 0 && entry.name.startsWith(".")) continue;
      const relPath = relDir ? `${relDir}/${entry.name}` : entry.name;
      let content: string;
      try {
        content = await readFile(path.join(root, relPath), "utf8");
      } catch {
        continue;
      }
      const slug = relPath.toLowerCase().replace(/\.md$/i, "");
      docs.push({
        id: `${source}:${slug}`,
        source,
        slug,
        title: extractTitle(content) ?? entry.name.replace(/\.md$/i, ""),
        content,
        filePath: relPath,
      });
    }
  }
  return docs;
}

async function loadDocsFromRepo(): Promise<KnowledgeDoc[]> {
  const repo = await getRepo();
  const rows = await repo.listKnowledgeDocs();
  return rows.map((row) => ({
    id: row.id,
    source: row.source,
    slug: row.slug,
    title: row.title,
    content: row.content,
    filePath: row.filePath,
  }));
}

/** Merged corpus: synced knowledge docs + site project documentation. */
export async function getKnowledgeDocs(): Promise<KnowledgeDoc[]> {
  const cached = await knowledgeCache.get<KnowledgeDoc[]>("corpus");
  if (cached) return cached;

  let docs: KnowledgeDoc[] = [];
  const repo = await getRepo();
  try {
    docs = await loadDocsFromRepo();
  } catch {
    docs = [];
  }

  // Fallback for memory mode / fresh databases: read the repo docs directly.
  const env = getServerEnv();
  const roots = env.CHATBOT_KB_ROOTS.split(",").map((root) => root.trim()).filter(Boolean);
  if (docs.length === 0 && roots.length > 0) {
    docs = await loadDocsFromDisk(roots);
  }

  // Site project docs (DocumentationPage) join the corpus as source "site".
  try {
    const projects = await repo.getFeaturedProjects(10);
    const siteDocs: KnowledgeDoc[] = [];
    for (const project of projects) {
      const detail = await repo.getProjectBySlug(project.slug);
      for (const doc of detail?.docs ?? []) {
        siteDocs.push({
          id: `site:${project.slug}:${doc.slug}`,
          source: "site",
          slug: `${project.slug}/${doc.slug}`,
          title: `${project.name} — ${doc.title}`,
          content: doc.content,
          filePath: null,
        });
      }
    }
    docs = [...docs, ...siteDocs];
  } catch {
    // Site docs are optional; never fail the corpus on their account.
  }

  await knowledgeCache.set("corpus", docs, 900);
  return docs;
}

function firstParagraph(content: string, maxChars: number): string {
  const withoutTitle = content.replace(/^#\s+.+$/m, "").trim();
  const paragraph = withoutTitle.split(/\n{2,}/).find((block) => block.trim().length > 20) ?? withoutTitle;
  const clean = paragraph.replace(/[#*`_>|]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > maxChars ? `${clean.slice(0, maxChars)}…` : clean;
}

/** Compact always-injected index of every known project + its docs. */
export async function buildCatalogIndex(): Promise<string> {
  const docs = await getKnowledgeDocs();
  const bySource = new Map<string, KnowledgeDoc[]>();
  for (const doc of docs) {
    const list = bySource.get(doc.source) ?? [];
    list.push(doc);
    bySource.set(doc.source, list);
  }

  const lines: string[] = [];
  for (const [source, sourceDocs] of bySource) {
    const readme = sourceDocs.find((doc) => doc.slug === "readme" || doc.slug.endsWith("/readme"));
    const summary = readme
      ? firstParagraph(readme.content, 280)
      : firstParagraph(sourceDocs[0]?.content ?? "", 280);
    lines.push(`- ${source}: ${summary}`);
    lines.push(`  Available documentation: ${sourceDocs.map((doc) => doc.slug).sort().join(", ")}`);
  }
  return lines.join("\n") || "No projects are known yet.";
}

/** Site projects (from the website catalog) for the catalog index. */
export async function buildSiteProjectsIndex(): Promise<string> {
  try {
    const repo = await getRepo();
    const projects = await repo.getFeaturedProjects(10);
    if (projects.length === 0) return "";
    return projects
      .map((project) => `- ${project.name} (${project.slug}): ${firstParagraph(project.summary, 200)}`)
      .join("\n");
  } catch {
    return "";
  }
}
