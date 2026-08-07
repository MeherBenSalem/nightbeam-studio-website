import { PROJECT_CONTENT_PACKS } from "../src/content/projects";
import { getRepo } from "../src/lib/db/repo";

/**
 * Upserts authored documentation for projects that already exist in the catalog
 * (memory seed or CurseForge-synced). Source packs live under src/content/projects/
 * and must be written from the real project before publishing.
 */
async function main() {
  const repo = await getRepo();
  let ok = 0;
  let missing = 0;

  for (const pack of PROJECT_CONTENT_PACKS) {
    const applied = await repo.replaceProjectDocs(
      pack.slug,
      pack.docs.map((doc) => ({
        slug: doc.slug,
        title: doc.title,
        content: doc.content,
        sortOrder: doc.sortOrder,
      })),
    );
    if (applied) {
      ok += 1;
      console.log(`docs upserted: ${pack.slug} (${pack.docs.length} pages) — ${pack.source}`);
    } else {
      missing += 1;
      console.warn(`project missing, skipped docs: ${pack.slug}`);
    }
  }

  console.log(`done — applied=${ok} missing=${missing}`);
  process.exit(missing > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
