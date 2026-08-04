import fs from "node:fs";
// Build the knowledge block + catalog the way the route does, then run the prompt test.
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
const { chunkAll, retrieveChunks, buildRetrievalQuery, expandQueryTokens } = await import("./.retrieval-mod.mjs");

const root = "C:/Users/mahou/OneDrive/Documents/GitHub/RPG-Attribute-System";
const docs = [];
const walk = (dir, rel) => {
  for (const e of readdirSync(path.join(root, dir), { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(dir, e.name), rel ? `${rel}/${e.name}` : e.name);
    else if (e.name.toLowerCase().endsWith(".md")) {
      const rp = rel ? `${rel}/${e.name}` : e.name;
      const parts = rp.split("/");
      if (parts[0] !== "docs") continue;
      const content = readFileSync(path.join(root, dir, e.name), "utf8");
      const title = (content.match(/^#\s+(.+)$/m) ?? [])[1]?.trim() ?? e.name;
      docs.push({ id: rp, source: "ras", slug: rp.toLowerCase().replace(/\.md$/i, ""), title, content, filePath: rp });
    }
  }
};
walk("", "");
const chunks = chunkAll(docs);
const q = buildRetrievalQuery("How Can I Setup a RPG Mana Stats With another mod", undefined);
const hits = retrieveChunks(q, chunks, 8);
const kb = hits.map((c, i) => `Source: ${c.slug} — ${c.title}\n### ${c.heading || c.title}\n${c.content}`).join("\n\n");
console.log("=== HIT SLUGS ===");
for (const h of hits) console.log(" -", h.slug, "#", h.heading);
console.log("KB tokens:", Math.round(kb.length / 4));
fs.writeFileSync(".kb-block.txt", kb);
