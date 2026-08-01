import type { Metadata } from "next";
import Link from "next/link";
import { ProjectCard } from "@/components/projects/project-card";
import { Card, CardBody } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { getRepo } from "@/lib/db/repo";

export const metadata: Metadata = {
  title: "About",
  description: "NightBeam Studio is a story-first studio building Minecraft mods and worlds.",
};

const VALUES = [
  {
    title: "Story first",
    body: "Every mechanic exists to serve the story. If it doesn't move the narrative, it doesn't ship.",
  },
  {
    title: "Hand-made art",
    body: "Logos, banners, textures, and captures are made or commissioned by humans. No AI-generated key art — ever.",
  },
  {
    title: "Open dialogue",
    body: "We read feedback, publish changelogs, and talk with the community like neighbors.",
  },
];

export default async function AboutPage() {
  const repo = await getRepo();
  const projects = await repo.listProjects({ perPage: 100, sort: "downloads" });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PixelHeading as="h1">About NightBeam</PixelHeading>
      <p className="mt-4 max-w-2xl text-slate-300">
        NightBeam Studio is a small, story-first studio building Minecraft mods and worlds — original mechanics,
        atmosphere, and places that feel lived-in.
      </p>

      <section className="mt-10">
        <Card className="p-6">
          <h2 className="font-pixel text-sm text-pixel-cyan">THE STUDIO</h2>
          <p className="mt-3 text-slate-300">
            We started with a single question — <em className="text-white">where did Steve come from?</em> — and turned
            it into a story-driven mod. Today NightBeam is home to a growing catalog of Minecraft projects, from
            dungeon adventures to worlds and tools.
          </p>
          <p className="mt-3 text-slate-400">
            Development happens openly; project sources and issue trackers live on{" "}
            <Link href="https://github.com/MeherBenSalem?tab=repositories" className="text-pixel-cyan hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
            .
          </p>
        </Card>
      </section>

      <section className="mt-10" aria-labelledby="catalog-heading">
        <PixelHeading as="h2" id="catalog-heading">The catalog</PixelHeading>
        <p className="mt-3 text-slate-400">Everything NightBeam has released, straight from the live catalog.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {projects.items.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>

      <section className="mt-10" aria-labelledby="values-heading">
        <PixelHeading as="h2" id="values-heading">What we believe</PixelHeading>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {VALUES.map((value) => (
            <Card key={value.title}>
              <CardBody>
                <h3 className="font-pixel text-xs text-pixel-purple">{value.title.toUpperCase()}</h3>
                <p className="mt-3 text-sm text-slate-400">{value.body}</p>
              </CardBody>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <Card className="p-6">
          <h2 className="font-pixel text-sm text-pixel-cyan">THE ROAD AHEAD</h2>
          <p className="mt-3 text-sm text-slate-400">
            New projects and content updates are always in motion. Follow the studio to get notified about every
            release.
          </p>
          <Link href="/community" className="mt-4 inline-block text-sm text-pixel-cyan hover:underline">
            Join the community →
          </Link>
        </Card>
      </section>
    </div>
  );
}
