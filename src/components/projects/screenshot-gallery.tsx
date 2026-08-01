"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { EmptyState } from "@/components/ui/state";

interface Screenshot {
  id: string;
  url: string;
  title: string | null;
  alt: string | null;
}

export function ScreenshotGallery({ screenshots }: { screenshots: Screenshot[] }) {
  const [selected, setSelected] = useState<Screenshot | null>(null);

  if (screenshots.length === 0) {
    return <EmptyState title="No screenshots yet" body="Gameplay captures will appear here after CurseForge sync is live." />;
  }

  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {screenshots.map((screenshot) => (
          <li key={screenshot.id}>
            <button
              type="button"
              onClick={() => setSelected(screenshot)}
              className="group block w-full overflow-hidden rounded-lg border border-night-500/50"
              aria-label={`View screenshot: ${screenshot.title ?? "Untitled"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screenshot.url}
                alt={screenshot.alt ?? ""}
                className="aspect-video w-full object-cover transition-transform group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Screenshot"} wide>
        {selected ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.url} alt={selected.alt ?? ""} className="max-h-[70vh] w-full rounded-lg object-contain" />
        ) : null}
      </Dialog>
    </div>
  );
}
