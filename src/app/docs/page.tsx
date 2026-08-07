import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { getRepo } from "@/lib/db/repo";
import type { ProjectDetail } from "@/lib/db/types";
import { absoluteUrl, faqPageJsonLd } from "@/lib/seo/site";
import { renderMarkdown } from "@/lib/utils/markdown";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Install and configure NightBeam Studio projects — platform guides plus project docs authored from the real repositories.",
  alternates: { canonical: absoluteUrl("/docs") },
};

const FAQ = [
  {
    question: "Where do project docs come from?",
    answer:
      "Documentation pages are authored from each project's repository and public listings, then attached by slug. CurseForge sync preserves those pages.",
  },
  {
    question: "How do I add a new project to the docs section?",
    answer:
      "Follow the Adding project documentation guide: research the real project, add a content pack under src/content/projects, ensure the project exists, then run npm run docs:upsert.",
  },
  {
    question: "Do players need Jauml by itself?",
    answer:
      "Usually only when another mod lists Jauml as a required dependency. Installers typically pull the matching loader jar automatically.",
  },
];

async function listProjectsWithDocs(repo: Awaited<ReturnType<typeof getRepo>>): Promise<ProjectDetail[]> {
  const documented: ProjectDetail[] = [];
  let page = 1;
  for (;;) {
    const result = await repo.listProjects({ perPage: 100, page });
    const details = await Promise.all(result.items.map((project) => repo.getProjectBySlug(project.slug)));
    for (const detail of details) {
      if (detail && detail.docs.length > 0) documented.push(detail);
    }
    if (page >= result.totalPages) break;
    page += 1;
  }
  return documented;
}

export default async function DocsPage() {
  const repo = await getRepo();
  const documented = await listProjectsWithDocs(repo);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(FAQ)) }}
      />
      <PixelHeading as="h1">Documentation</PixelHeading>
      <p className="mt-4 text-slate-400">
        Platform guides and project documentation authored from the real NightBeam repositories.
      </p>

      <section className="mt-10" aria-labelledby="platform-guides-heading">
        <PixelHeading as="h2" id="platform-guides-heading">
          Platform
        </PixelHeading>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Card>
            <CardBody>
              <h3 className="font-semibold text-white">
                <Link href="/docs/adding-projects" className="text-pixel-cyan hover:underline">
                  Adding project documentation
                </Link>
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">
                Research the real project, author a content pack, upsert docs, and keep them safe across CurseForge sync.
              </p>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="font-semibold text-white">
                <Link href="/docs/privacy" className="text-pixel-cyan hover:underline">
                  Privacy
                </Link>
              </h3>
              <p className="mt-1.5 text-sm text-slate-400">What we collect, how accounts work, and how to contact the studio.</p>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="mt-12 space-y-8" aria-label="Project guides">
        <PixelHeading as="h2">Projects</PixelHeading>
        {documented.length === 0 ? (
          <Card>
            <CardBody>
              <p className="text-sm text-slate-400">
                No project documentation is loaded yet. After seeding or syncing projects, run{" "}
                <code className="text-pixel-cyan">npm run docs:upsert</code>.
              </p>
            </CardBody>
          </Card>
        ) : (
          documented.map((project) => (
            <div key={project.id} className="space-y-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="font-pixel text-sm text-white">{project.name.toUpperCase()}</h3>
                <Link href={`/projects/${project.slug}`} className="text-sm text-pixel-cyan hover:underline">
                  Open project →
                </Link>
              </div>
              {project.docs.map((doc) => (
                <Card key={doc.id}>
                  <CardHeader>
                    <CardTitle>{doc.title}</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="nb-prose text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }} />
                  </CardBody>
                </Card>
              ))}
            </div>
          ))
        )}
      </section>

      <section className="mt-12" aria-labelledby="faq-heading">
        <PixelHeading as="h2" id="faq-heading">
          FAQ
        </PixelHeading>
        <div className="mt-6 space-y-4">
          {FAQ.map((item) => (
            <Card key={item.question}>
              <CardBody>
                <h3 className="font-semibold text-white">{item.question}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{item.answer}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <Card className="p-6">
          <h2 className="font-pixel text-sm text-pixel-cyan">NEED HELP?</h2>
          <p className="mt-3 text-sm text-slate-400">
            Join the{" "}
            <Link href="/community" className="text-pixel-cyan hover:underline">
              community
            </Link>{" "}
            and ask — the NightBeam team and players hang out on Discord.
          </p>
        </Card>
      </section>
    </div>
  );
}
