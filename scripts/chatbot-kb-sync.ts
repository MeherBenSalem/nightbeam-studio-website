// Syncs markdown documentation from CHATBOT_KB_ROOTS (comma-separated repo
// roots) into the chatbot knowledge base. Idempotent — safe to re-run.
//
//   npm run kb:sync
//
// Reads docs/**/*.md plus root-level *.md (e.g. PATCH_NOTES.md) from each
// root and upserts them into ChatbotKnowledgeDoc via the data layer.

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { getRepo } from "../src/lib/db/repo";
import { getServerEnv } from "../src/lib/config/env";

function extractTitle(content: string): string | null {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim().replace(/[`*_]/g, "").slice(0, 120) : null;
}

async function collectDocs(root: string): Promise<Array<{ slug: string; title: string; content: string; filePath: string }>> {
  const docs: Array<{ slug: string; title: string; content: string; filePath: string }> = [];
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true, recursive: true });
  } catch (error) {
    console.error(`[kb:sync] Cannot read root "${root}": ${error instanceof Error ? error.message : error}`);
    return docs;
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
    const content = await readFile(path.join(root, relPath), "utf8");
    docs.push({
      slug: relPath.toLowerCase().replace(/\.md$/i, ""),
      title: extractTitle(content) ?? entry.name.replace(/\.md$/i, ""),
      content,
      filePath: relPath,
    });
  }
  return docs;
}

async function main() {
  const roots = getServerEnv()
    .CHATBOT_KB_ROOTS.split(",")
    .map((root) => root.trim())
    .filter(Boolean);
  if (roots.length === 0) {
    console.error("[kb:sync] CHATBOT_KB_ROOTS is not set. Add repo roots (comma-separated) to your .env.");
    process.exit(1);
  }

  const repo = await getRepo();
  let synced = 0;
  let skipped = 0;

  for (const root of roots) {
    const source = path.basename(root).toLowerCase().replace(/[^a-z0-9-]+/g, "-") || "knowledge";
    const docs = await collectDocs(root);
    for (const doc of docs) {
      await repo.upsertKnowledgeDoc({
        source,
        slug: doc.slug,
        title: doc.title,
        content: doc.content,
        filePath: doc.filePath,
      });
      synced += 1;
    }
    console.log(`[kb:sync] ${source}: ${docs.length} documents`);
    if (docs.length === 0) skipped += 1;
  }

  console.log(`[kb:sync] Done — ${synced} documents synced.`);
  if (skipped > 0) {
    console.warn(`[kb:sync] ${skipped} root(s) yielded no documents — check CHATBOT_KB_ROOTS.`);
  }
  process.exit(0);
}

main().catch((error) => {
  console.error("[kb:sync] Failed:", error);
  process.exit(1);
});
