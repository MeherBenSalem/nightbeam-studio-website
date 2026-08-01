"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { DownloadIcon, HeartIcon, StarIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

export function ProjectActions({
  slug,
  initialFavorite,
  initialFollow,
  loggedIn,
  downloadFileId,
}: {
  slug: string;
  initialFavorite: boolean;
  initialFollow: boolean;
  loggedIn: boolean;
  downloadFileId?: string;
}) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [follow, setFollow] = useState(initialFollow);
  const [busy, setBusy] = useState(false);

  function requireAuth() {
    if (!loggedIn) {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/projects/${slug}`)}`);
      return false;
    }
    return true;
  }

  async function toggle(kind: "favorite" | "follow") {
    if (!requireAuth()) return;
    setBusy(true);
    try {
      const isFav = kind === "favorite" ? favorite : follow;
      const response = await fetch(`/api/${kind}s`, {
        method: isFav ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      if (response.ok) {
        if (kind === "favorite") setFavorite(!isFav);
        else setFollow(!isFav);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" size="sm" onClick={() => void toggle("favorite")} disabled={busy} aria-pressed={favorite}>
        <StarIcon className={cn(favorite && "fill-pixel-amber text-pixel-amber")} />
        {favorite ? "Favorited" : "Favorite"}
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => void toggle("follow")}
        disabled={busy}
        aria-pressed={follow}
        className={cn(follow && "border-pixel-cyan/60 text-pixel-cyan")}
      >
        <HeartIcon className={cn(follow && "fill-pixel-cyan text-pixel-cyan")} />
        {follow ? "Following" : "Follow"}
      </Button>
      <DownloadButton slug={slug} fileId={downloadFileId} />
    </div>
  );
}

export function DownloadButton({ slug, fileId }: { slug: string; fileId?: string }) {
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch(`/api/projects/${slug}/download/${fileId ?? "latest"}`, { method: "POST" });
      if (!response.ok) {
        setNotice("Download is temporarily unavailable.");
        return;
      }
      const data = (await response.json()) as { available: boolean; url: string | null; fileName?: string };
      if (data.available && data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer");
      } else {
        setNotice("File will be available here as soon as CurseForge sync is configured.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex items-center gap-2">
      <Button size="sm" onClick={() => void download()} disabled={busy}>
        <DownloadIcon /> Download
      </Button>
      {notice ? <span className="text-xs text-amber-300">{notice}</span> : null}
    </span>
  );
}
