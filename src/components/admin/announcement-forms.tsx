"use client";

import { useActionState } from "react";
import { deleteAnnouncementAction, upsertAnnouncementAction } from "@/lib/admin/actions";
import type { ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/input";

export function AnnouncementForm() {
  const [state, action, pending] = useActionState(async (_prev: ActionState, formData: FormData) => upsertAnnouncementAction(formData), {});
  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ann-slug">Slug</Label>
          <Input id="ann-slug" name="slug" placeholder="v050-release" required pattern="[a-z0-9-]+" />
        </div>
        <div>
          <Label htmlFor="ann-title">Title</Label>
          <Input id="ann-title" name="title" required maxLength={120} />
        </div>
      </div>
      <div>
        <Label htmlFor="ann-body">Body</Label>
        <Textarea id="ann-body" name="body" required maxLength={4000} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="ann-start">Starts at (optional)</Label>
          <Input id="ann-start" name="startsAt" type="datetime-local" />
        </div>
        <div>
          <Label htmlFor="ann-end">Ends at (optional)</Label>
          <Input id="ann-end" name="endsAt" type="datetime-local" />
        </div>
      </div>
      <div className="flex gap-4">
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <Checkbox name="active" defaultChecked />
          Active
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <Checkbox name="dismissible" defaultChecked />
          Dismissible
        </label>
      </div>
      {state.error ? <p className="text-sm text-red-400">{state.error}</p> : null}
      {state.message ? <p className="text-sm text-green-400">{state.message}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Create / update announcement"}
      </Button>
    </form>
  );
}

export function DeleteAnnouncementButton({ slug }: { slug: string }) {
  const [state, action, pending] = useActionState(async (_prev: ActionState, formData: FormData) => deleteAnnouncementAction(formData), {});
  return (
    <form action={action}>
      <input type="hidden" name="slug" value={slug} />
      <button type="submit" disabled={pending} className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-400 hover:bg-red-500/10">
        Delete
      </button>
      {state.error ? <span className="ml-2 text-xs text-red-400">{state.error}</span> : null}
    </form>
  );
}
