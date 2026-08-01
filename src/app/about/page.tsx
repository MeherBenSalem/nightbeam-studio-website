import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardBody } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";

export const metadata: Metadata = {
  title: "About",
  description: "NightBeam Studio is a story-first mod studio. Meet Mahou and the values behind The Birth of Steve.",
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

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <PixelHeading as="h1">About NightBeam</PixelHeading>
      <p className="mt-4 max-w-2xl text-slate-300">
        NightBeam Studio is a small, story-first game studio founded around a simple question:{" "}
        <em className="text-white">where did Steve come from?</em>
      </p>

      <section className="mt-10">
        <Card className="p-6">
          <h2 className="font-pixel text-sm text-pixel-cyan">MAHOU</h2>
          <p className="mt-3 text-slate-300">
            Mahou is the developer behind <strong className="text-white">The Birth of Steve</strong> — a narrative
            Minecraft mod available for Minecraft 26.1.2 and 26.2 on NeoForge and Fabric. Current release: v0.4.0.
          </p>
          <p className="mt-3 text-slate-400">
            The mod is developed openly; the source and issue tracker live on{" "}
            <Link href="https://github.com/MeherBenSalem" className="text-pixel-cyan hover:underline" target="_blank" rel="noopener noreferrer">
              GitHub
            </Link>
            .
          </p>
        </Card>
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
            The Birth of Steve is in active development. Future chapters, content updates, and more Minecraft version
            support are on the way. Follow the project to get notified of every release.
          </p>
          <Link href="/community" className="mt-4 inline-block text-sm text-pixel-cyan hover:underline">
            Join the community →
          </Link>
        </Card>
      </section>
    </div>
  );
}
