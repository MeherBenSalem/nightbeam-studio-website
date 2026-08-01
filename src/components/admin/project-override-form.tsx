"use client";

import { useActionState } from "react";
import { saveProjectOverrideAction } from "@/lib/admin/actions";
import type { ActionState } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/input";
import type { ProjectOverrideDto } from "@/lib/db/types";

export function ProjectOverrideForm({ projectId, projectName, override }: { projectId: string; projectName: string; override: ProjectOverrideDto | null }) {
  const [state, action, pending] = useActionState(async (_prev: ActionState, formData: FormData) => saveProjectOverrideAction(formData), {});
  return (
    <form action={action} className="pixel-panel rounded-xl p-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-semibold text-white">{projectName}</h3>
        {override ? <span className="text-xs text-pixel-cyan">override active</span> : null}
      </div>
      <input type="hidden" name="projectId" value={projectId} />
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor={`name-${projectId}`}>Name</Label>
          <Input id={`name-${projectId}`} name="name" defaultValue={override?.name ?? ""} placeholder={projectName} />
        </div>
        <div>
          <Label htmlFor={`status-${projectId}`}>Status</Label>
          <select id={`status-${projectId}`} name="status" defaultValue={override?.status ?? ""} className="w-full rounded-md border border-night-500/60 bg-night-900 px-3 py-2 text-sm">
            <option value="">— default —</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="PLANNED">PLANNED</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`summary-${projectId}`}>Summary</Label>
          <Input id={`summary-${projectId}`} name="summary" defaultValue={override?.summary ?? ""} maxLength={300} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor={`description-${projectId}`}>Description</Label>
          <Textarea id={`description-${projectId}`} name="description" defaultValue={override?.description ?? ""} />
        </div>
        <div>
          <Label htmlFor={`icon-${projectId}`}>Icon URL</Label>
          <Input id={`icon-${projectId}`} name="iconUrl" type="url" defaultValue={override?.iconUrl ?? ""} />
        </div>
        <div>
          <Label htmlFor={`banner-${projectId}`}>Banner URL</Label>
          <Input id={`banner-${projectId}`} name="bannerUrl" type="url" defaultValue={override?.bannerUrl ?? ""} />
        </div>
        <div>
          <Label>Downloads</Label>
          <Input name="downloads" type="number" min={0} defaultValue={override?.downloads ?? ""} />
        </div>
        <div>
          <Label>Followers</Label>
          <Input name="followers" type="number" min={0} defaultValue={override?.followers ?? ""} />
        </div>
        <div>
          <Label>Views</Label>
          <Input name="views" type="number" min={0} defaultValue={override?.views ?? ""} />
        </div>
        <div>
          <Label>Rating (0–5)</Label>
          <Input name="rating" type="number" min={0} max={5} step={0.1} defaultValue={override?.rating ?? ""} />
        </div>
      </div>
      <label className="mt-3 flex items-center gap-2 text-sm text-slate-300">
        <Checkbox name="featured" defaultChecked={override?.featured === true} />
        Featured on homepage
      </label>
      {state.error ? <p className="mt-2 text-sm text-red-400">{state.error}</p> : null}
      {state.message ? <p className="mt-2 text-sm text-green-400">{state.message}</p> : null}
      <Button type="submit" size="sm" className="mt-4" disabled={pending}>
        {pending ? "Saving…" : "Save override"}
      </Button>
    </form>
  );
}
