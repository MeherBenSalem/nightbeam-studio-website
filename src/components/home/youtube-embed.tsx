import { ExternalLinkIcon } from "@/components/icons";

export function YouTubeEmbed({ videoId, channelUrl }: { videoId: string | null; channelUrl: string }) {
  if (!videoId) {
    return (
      <div className="pixel-panel flex h-[380px] w-full flex-col items-center justify-center gap-5 rounded-2xl text-center sm:h-[440px]">
        <p className="font-pixel text-sm text-white">WATCH US ON YOUTUBE</p>
        <p className="max-w-xs text-sm text-slate-400">Gameplay, trailers, and behind-the-scenes from NightBeam Studio.</p>
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-white/60 px-4 py-2 text-sm font-medium text-white hover:bg-white hover:text-black"
        >
          Open the channel <ExternalLinkIcon />
        </a>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-night-500/60 bg-black shadow-[0_0_40px_rgb(255_255_255/0.1)]">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title="NightBeam Studio latest video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );
}
