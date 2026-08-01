import type { Metadata } from "next";
import { Card, CardBody } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { getRepo } from "@/lib/db/repo";
import { formatNumber } from "@/lib/utils/format";

export const metadata: Metadata = {
  title: "Community",
  description: "Join the NightBeam Studio community on Discord, YouTube, and GitHub.",
};

const RULES = [
  "Be kind — this is a small studio and every player matters.",
  "Report bugs with version, loader, and what you were doing.",
  "Share screenshots and stories; credit the mod when posting elsewhere.",
  "No pirated copies, no harassment, no spoilers outside spoiler channels.",
];

export default async function CommunityPage() {
  const repo = await getRepo();
  const community = await repo.getCommunityStats();

  const channels = [
    { name: "Discord", initial: "DC", url: community.discordUrl, stat: `${formatNumber(community.discordMembers)} members`, tone: "text-pixel-purple" },
    { name: "YouTube", initial: "YT", url: community.youtubeUrl, stat: `${formatNumber(community.youtubeSubscribers)} subscribers`, tone: "text-pixel-pink" },
    { name: "GitHub", initial: "GH", url: community.githubUrl, stat: "Repositories", tone: "text-pixel-green" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <PixelHeading as="h1">Community</PixelHeading>
      <p className="mt-4 max-w-2xl text-slate-400">
        The Birth of Steve is a story told together. Join the conversation, share your playthrough, and help shape what
        comes next.
      </p>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {channels.map((channel) => (
          <a key={channel.name} href={channel.url} target="_blank" rel="noopener noreferrer" className="pixel-panel group rounded-xl p-6 text-center transition-colors hover:border-pixel-cyan/60">
            <div className={`font-pixel text-3xl ${channel.tone}`}>{channel.initial}</div>
            <div className="mt-3 font-semibold text-white group-hover:text-pixel-cyan">{channel.name}</div>
            <div className="mt-1 text-sm text-slate-500">{channel.stat}</div>
          </a>
        ))}
      </div>

      <section className="mt-12" aria-labelledby="rules-heading">
        <PixelHeading as="h2" id="rules-heading">House rules</PixelHeading>
        <Card className="mt-6">
          <CardBody>
            <ul className="space-y-3">
              {RULES.map((rule, index) => (
                <li key={rule} className="flex gap-3 text-sm text-slate-300">
                  <span className="font-pixel text-xs text-pixel-cyan">{String(index + 1).padStart(2, "0")}</span>
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </CardBody>
        </Card>
      </section>

      <section className="mt-12">
        <Card className="p-6">
          <h2 className="font-pixel text-sm text-pixel-cyan">FIND US</h2>
          <p className="mt-3 text-sm text-slate-400">
            The fastest way to get help is the Discord server — the studio reads every message.
          </p>
        </Card>
      </section>
    </div>
  );
}
