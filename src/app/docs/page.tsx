import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { getRepo } from "@/lib/db/repo";
import { absoluteUrl, faqPageJsonLd } from "@/lib/seo/site";
import { renderMarkdown } from "@/lib/utils/markdown";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Install and play NightBeam Studio mods — guides for The Birth of Steve, server setup, configuration, and troubleshooting.",
  alternates: { canonical: absoluteUrl("/docs") },
};

const FAQ = [
  {
    question: "Which Minecraft versions are supported?",
    answer: "The Birth of Steve currently targets Minecraft 26.1.2 and 26.2 on NeoForge and Fabric.",
  },
  {
    question: "Does it work on a server?",
    answer: "Yes. Install the mod on both client and server, then start the world. Server owners can tune story pacing in the config file.",
  },
  {
    question: "Will my existing world break?",
    answer: "The mod is designed to integrate with vanilla worlds. Keep a backup before enabling story progression on an established save.",
  },
];

export default async function DocsPage() {
  const repo = await getRepo();
  const projects = await repo.getFeaturedProjects(6);
  const projectDocs = await Promise.all(
    projects.map(async (project) => {
      const detail = await repo.getProjectBySlug(project.slug);
      return detail?.docs ?? [];
    }),
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd(FAQ)) }}
      />
      <PixelHeading as="h1">Documentation</PixelHeading>
      <p className="mt-4 text-slate-400">
        Everything you need to install, play, and configure NightBeam Studio mods.
      </p>

      <section className="mt-10 space-y-5" aria-label="Project guides">
        {projectDocs.flat().map((doc) => (
          <Card key={doc.id}>
            <CardHeader>
              <CardTitle>{doc.title}</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="nb-prose text-sm" dangerouslySetInnerHTML={{ __html: renderMarkdown(doc.content) }} />
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="mt-12" aria-labelledby="faq-heading">
        <PixelHeading as="h2" id="faq-heading">FAQ</PixelHeading>
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
            Join the <Link href="/community" className="text-pixel-cyan hover:underline">community</Link> and ask — the
            NightBeam team and players hang out on Discord.
          </p>
        </Card>
      </section>
    </div>
  );
}
