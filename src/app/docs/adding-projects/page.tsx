import type { Metadata } from "next";
import Link from "next/link";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { absoluteUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Adding project documentation",
  description:
    "How NightBeam Studio authors and publishes project documentation on the website — research the real project first, then seed, upsert, and preserve docs across CurseForge sync.",
  alternates: { canonical: absoluteUrl("/docs/adding-projects") },
};

export default function AddingProjectsDocsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-sm text-slate-500">
        <Link href="/docs" className="text-pixel-cyan hover:underline">
          Documentation
        </Link>{" "}
        / Platform
      </p>
      <PixelHeading as="h1" className="mt-3">
        Adding project documentation
      </PixelHeading>
      <p className="mt-4 text-slate-400">
        Project docs on nightbeam.dev are authored from the real mod repository and listings — not invented marketing
        copy. Follow this flow whenever you add a project to the platform documentation section.
      </p>

      <div className="nb-prose mt-8">
        <h2>1. Research the actual project</h2>
        <p>Before writing a single documentation page, gather facts from the source of truth:</p>
        <ul>
          <li>Local or GitHub repository (API classes, CHANGELOG, migration guides, LICENSE)</li>
          <li>Published metadata on CurseForge and Modrinth (loaders, versions, dependency roles)</li>
          <li>Release notes that match the version you are documenting</li>
        </ul>
        <p>
          Mark unknowns explicitly (for example unverified Maven coordinates or conflicting license labels). Prefer
          linking to upstream files over paraphrasing when accuracy matters.
        </p>

        <h2>2. Author a content pack in the website repo</h2>
        <ol>
          <li>
            Add <code>src/content/projects/&lt;slug&gt;.ts</code> exporting a <code>ProjectContentPack</code> with
            documentation pages (slug, title, sortOrder, markdown content).
          </li>
          <li>
            Register the pack in <code>src/content/projects/index.ts</code>.
          </li>
          <li>
            For memory / seed fallbacks, include the project (or at least its docs) in{" "}
            <code>src/lib/db/catalog.ts</code> so <code>DATA_BACKEND=memory</code> still works.
          </li>
        </ol>
        <p>
          Reference implementation: <strong>Jauml</strong> —{" "}
          <Link href="/projects/jauml">/projects/jauml</Link> docs are derived from{" "}
          <code>JaumlConfig.LIBRARY_VERSION</code>, <code>MIGRATION_GUIDE.md</code>, and <code>CHANGELOG.md</code> in
          the Jauml MultiLoader tree.
        </p>

        <h2>3. Ensure the project exists on the site</h2>
        <p>Documentation attaches to an existing Project row by slug:</p>
        <ul>
          <li>
            Production: CurseForge sync usually creates the project (for example <code>jauml</code>).
          </li>
          <li>
            Local seed: <code>npm run db:seed</code> or memory catalog seeding.
          </li>
        </ul>

        <h2>4. Publish docs into the database</h2>
        <p>
          Run <code>npm run docs:upsert</code>. The script calls <code>replaceProjectDocs</code> for every registered
          content pack. It skips packs whose project slug is missing.
        </p>

        <h2>5. Verify on the site</h2>
        <ul>
          <li>
            Project page <strong>Docs</strong> tab: <Link href="/projects/jauml">/projects/jauml</Link>
          </li>
          <li>
            Documentation hub: <Link href="/docs">/docs</Link>
          </li>
        </ul>

        <h2>Sync safety</h2>
        <p>
          CurseForge sync does <strong>not</strong> wipe authored documentation when the sync payload has an empty{" "}
          <code>docs</code> array. Re-run <code>npm run docs:upsert</code> after editing content packs; you do not need
          to disable sync.
        </p>

        <h2>Markdown support</h2>
        <p>
          Site docs use the lightweight renderer in <code>src/lib/utils/markdown.ts</code>: headings, lists, quotes,
          links, fenced code, and simple tables. Keep pages short and factual.
        </p>
      </div>
    </div>
  );
}
