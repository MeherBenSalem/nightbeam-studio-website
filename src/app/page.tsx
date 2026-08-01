import Link from "next/link";
import { AnnouncementBar } from "@/components/home/announcement-bar";
import { YouTubeEmbed } from "@/components/home/youtube-embed";
import { ProjectCard } from "@/components/projects/project-card";
import { ArrowRightIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { StatCounter } from "@/components/ui/stat-counter";
import { getRepo } from "@/lib/db/repo";
import { getLatestVideoId } from "@/lib/youtube";
import { selectHomepageVideoId } from "@/lib/utils/youtube";
import { formatNumber } from "@/lib/utils/format";

export const revalidate = 60;

export default async function HomePage() {
  const repo = await getRepo();
  const [announcements, projects, stats, community, sections] = await Promise.all([
    repo.getActiveAnnouncements(),
    repo.getFeaturedProjects(6),
    repo.getSiteStats(),
    repo.getCommunityStats(),
    repo.getEnabledSections(),
  ]);
  const heroSection = sections.find((section) => section.key === "hero");
  const configuredVideoId = typeof heroSection?.content?.youtubeVideoId === "string" ? heroSection.content.youtubeVideoId : null;
  const videoId = selectHomepageVideoId(configuredVideoId, await getLatestVideoId());

  const sectionsEnabled = new Set(sections.map((section) => section.key));
  const heroProject = projects[0];

  return (
    <>
      {announcements.map((announcement) => (
        <AnnouncementBar key={announcement.id} title={announcement.title} body={announcement.body} dismissible={announcement.dismissible} />
      ))}

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid" aria-hidden />
        <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-purple-700/20 blur-3xl animate-pulse-glow" aria-hidden />
        <div className="absolute -right-24 top-40 h-80 w-80 rounded-full bg-cyan-600/15 blur-3xl animate-pulse-glow" aria-hidden />

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="font-pixel text-xs text-pixel-green">NIGHTBEAM STUDIO PRESENTS</p>
            <h1 className="mt-5 font-pixel text-2xl leading-relaxed text-white sm:text-3xl lg:text-4xl">
              THE BIRTH OF <span className="text-gradient">STEVE</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-300">
              A story-driven Minecraft mod by <strong className="text-white">NIGHTBEAM</strong>. Where did the first
              survivor come from? Uncover the origin — one block at a time.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg">
                <Link href={heroProject ? `/projects/${heroProject.slug}` : "/projects"} className="inline-flex items-center gap-2">
                  Download v{heroProject?.latestVersion ?? "0.4.0"} <ArrowRightIcon />
                </Link>
              </Button>
              <Button size="lg" variant="secondary">
                <Link href="/projects">Browse projects</Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs">
              {heroProject?.loaders.map((loader) => (
                <span key={loader} className="rounded border border-night-500/60 bg-night-900 px-2.5 py-1 uppercase tracking-wide text-slate-300">
                  {loader}
                </span>
              ))}
              {heroProject?.minecraftVersions.map((version) => (
                <span key={version} className="rounded border border-cyan-500/40 bg-cyan-500/5 px-2.5 py-1 text-pixel-cyan">
                  MC {version}
                </span>
              ))}
            </div>
          </div>

          <YouTubeEmbed videoId={videoId} channelUrl={community.youtubeUrl} />
        </div>
      </section>

      {sectionsEnabled.has("stats") ? (
        <section className="border-y border-night-600/40 bg-night-900/50">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
            <StatCounter value={stats.downloads} label="Downloads" accent="cyan" />
            <StatCounter value={stats.versions} label="Versions" accent="purple" />
            <StatCounter value={stats.projects} label="Projects" accent="green" />
            <StatCounter value={community.discordMembers} label="Discord Members" accent="blue" />
          </div>
        </section>
      ) : null}

      {sectionsEnabled.has("featured-projects") ? (
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6" aria-labelledby="featured-heading">
          <div className="flex items-end justify-between gap-4">
            <div>
              <PixelHeading as="h2" id="featured-heading">
                Featured Projects
              </PixelHeading>
              <p className="mt-3 text-sm text-slate-400">Hand-picked releases from the NightBeam catalog.</p>
            </div>
            <Link href="/projects" className="inline-flex items-center gap-1.5 text-sm text-pixel-cyan hover:underline">
              View all <ArrowRightIcon width={14} height={14} />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="border-t border-night-600/40 bg-night-900/40">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-2">
            <div>
              <PixelHeading as="h2">The Studio</PixelHeading>
              <p className="mt-4 text-slate-300">
                NightBeam Studio is a small, story-first game dev studio. We build Minecraft experiences with original
                mechanics, atmosphere, and worlds that feel lived-in.
              </p>
              <p className="mt-3 text-slate-400">
                Our key art is captured or commissioned — never AI-generated. Every block, texture, and note is made by
                hand.
              </p>
              <Button variant="secondary" className="mt-6">
                <Link href="/about">More about us</Link>
              </Button>
            </div>
            <div className="grid items-start gap-3 sm:grid-cols-3">
              <a href={community.discordUrl} target="_blank" rel="noopener noreferrer" className="pixel-panel group flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-pixel-cyan/60">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-night-500/60 bg-night-900 font-pixel text-sm text-pixel-purple">DC</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white group-hover:text-pixel-cyan">Discord</span>
                  <span className="block text-xs text-slate-500">{formatNumber(community.discordMembers)} members</span>
                </span>
              </a>
              <a href={community.youtubeUrl} target="_blank" rel="noopener noreferrer" className="pixel-panel group flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-pixel-cyan/60">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-night-500/60 bg-night-900 font-pixel text-sm text-pixel-pink">YT</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white group-hover:text-pixel-cyan">YouTube</span>
                  <span className="block text-xs text-slate-500">{formatNumber(community.youtubeSubscribers)} subscribers</span>
                </span>
              </a>
              <a href={community.githubUrl} target="_blank" rel="noopener noreferrer" className="pixel-panel group flex items-center gap-3 rounded-xl p-4 transition-colors hover:border-pixel-cyan/60">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-night-500/60 bg-night-900 font-pixel text-sm text-pixel-green">GH</span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white group-hover:text-pixel-cyan">GitHub</span>
                  <span className="block text-xs text-slate-500">View repositories</span>
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
