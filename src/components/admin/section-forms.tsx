"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { deleteSocialAction, saveHomepageVideoAction, upsertSectionAction, upsertSocialAction } from "@/lib/admin/actions";
import type { ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label } from "@/components/ui/input";
import type { HomeSectionDto, SocialLinkDto } from "@/lib/db/types";

export function SectionForm({ section }: { section: HomeSectionDto }) {
  const [state, action, pending] = useActionState(async (_prev: ActionState, formData: FormData) => upsertSectionAction(formData), {});
  return (
    <form action={action} className="pixel-panel flex flex-wrap items-end gap-3 rounded-xl p-4">
      <input type="hidden" name="key" value={section.key} />
      <div>
        <Label>Key</Label>
        <div className="rounded-md border border-night-500/60 bg-night-900 px-3 py-2 text-xs text-slate-500">{section.key}</div>
      </div>
      <div className="flex-1 min-w-48">
        <Label htmlFor={`title-${section.key}`}>Title</Label>
        <Input id={`title-${section.key}`} name="title" defaultValue={section.title} />
      </div>
      <div className="flex-1 min-w-48">
        <Label htmlFor={`subtitle-${section.key}`}>Subtitle</Label>
        <Input id={`subtitle-${section.key}`} name="subtitle" defaultValue={section.subtitle ?? ""} />
      </div>
      <label className="flex items-center gap-2 pb-2 text-sm text-slate-300">
        <Checkbox name="enabled" defaultChecked={section.enabled} />
        Enabled
      </label>
      <Button type="submit" size="sm" disabled={pending}>
        Save
      </Button>
      {state.message ? <span className="text-xs text-green-400">{state.message}</span> : null}
    </form>
  );
}

export function HomepageVideoForm({ section }: { section: HomeSectionDto | null }) {
  const [state, action, pending] = useActionState(async (_prev: ActionState, formData: FormData) => saveHomepageVideoAction(formData), {});
  const savedVideo = typeof section?.content?.youtubeVideoId === "string" ? section.content.youtubeVideoId : "";

  return (
    <form action={action} className="pixel-panel rounded-xl p-4">
      <div>
        <h3 className="font-pixel text-xs text-pixel-cyan">Homepage video</h3>
        <p className="mt-2 text-sm text-slate-400">Set a YouTube video URL or ID. Leave it empty to use the configured/latest channel video.</p>
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Label htmlFor="homepage-video-id">YouTube URL or video ID</Label>
          <Input id="homepage-video-id" name="videoId" defaultValue={savedVideo} placeholder="https://youtu.be/…" />
        </div>
        <Button type="submit" size="sm" disabled={pending}>{pending ? "Saving…" : "Save video"}</Button>
      </div>
      {state.error ? <p className="mt-3 text-xs text-red-300">{state.error}</p> : null}
      {state.message ? <p className="mt-3 text-xs text-green-400">{state.message}</p> : null}
    </form>
  );
}

export function SocialForm({ social }: { social: SocialLinkDto }) {
  const [state, action, pending] = useActionState(async (_prev: ActionState, formData: FormData) => upsertSocialAction(formData), {});
  const router = useRouter();
  async function remove() {
    const formData = new FormData();
    formData.set("platform", social.platform);
    const result = await deleteSocialAction(formData);
    if (result.ok) router.refresh();
  }
  return (
    <form action={action} className="pixel-panel rounded-xl p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-xs text-pixel-cyan">{social.platform}</h3>
        <button type="button" onClick={() => void remove()} className="text-xs text-red-400 hover:underline">
          Remove
        </button>
      </div>
      <input type="hidden" name="platform" value={social.platform} />
      <div className="mt-3">
        <Label htmlFor={`label-${social.platform}`}>Label</Label>
        <Input id={`label-${social.platform}`} name="label" defaultValue={social.label ?? ""} />
      </div>
      <div className="mt-3">
        <Label htmlFor={`url-${social.platform}`}>URL</Label>
        <Input id={`url-${social.platform}`} name="url" type="url" defaultValue={social.url} />
      </div>
      <Button type="submit" size="sm" className="mt-3" disabled={pending}>
        Save
      </Button>
      {state.message ? <span className="ml-2 text-xs text-green-400">{state.message}</span> : null}
    </form>
  );
}
