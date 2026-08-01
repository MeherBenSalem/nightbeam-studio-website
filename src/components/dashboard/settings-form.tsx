"use client";

import { useActionState, useState } from "react";
import { deleteAccountAction, updatePrefsAction, updateProfileAction } from "@/lib/dashboard/actions";
import { Button } from "@/components/ui/button";
import { Checkbox, Input, Label, Textarea } from "@/components/ui/input";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { PixelHeading } from "@/components/ui/pixel-heading";
import type { NotificationPreferenceDto, ProfileDto } from "@/lib/db/types";
import { LOADERS, MC_VERSIONS } from "@/lib/utils/url-filters";

export function SettingsForm({ profile, prefs }: { profile: ProfileDto; prefs: NotificationPreferenceDto }) {
  const [profileState, profileAction, profilePending] = useActionState(updateProfileAction, {});
  const [prefsState, prefsAction, prefsPending] = useActionState(updatePrefsAction, {});
  const [deleteState, deleteAction, deletePending] = useActionState(deleteAccountAction, {});
  const [password, setPassword] = useState("");

  return (
    <div className="space-y-8">
      <PixelHeading as="h1">Settings</PixelHeading>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardBody>
          <form action={profileAction} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" name="displayName" defaultValue={profile.displayName ?? ""} maxLength={48} />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" name="bio" defaultValue={profile.bio ?? ""} maxLength={280} />
            </div>
            <div>
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" type="url" defaultValue={profile.website ?? ""} />
            </div>
            <div>
              <Label>Preferred Minecraft versions</Label>
              <div className="flex flex-wrap gap-2">
                {MC_VERSIONS.slice(0, 8).map((version) => (
                  <label key={version} className="flex items-center gap-1.5 rounded border border-night-500/50 px-2 py-1 text-xs text-slate-300">
                    <Checkbox name="preferredVersions" value={version} defaultChecked={profile.preferredVersions.includes(version)} />
                    {version}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label>Preferred loaders</Label>
              <div className="flex flex-wrap gap-2">
                {LOADERS.map((loader) => (
                  <label key={loader} className="flex items-center gap-1.5 rounded border border-night-500/50 px-2 py-1 text-xs text-slate-300">
                    <Checkbox name="preferredLoaders" value={loader} defaultChecked={profile.preferredLoaders.includes(loader)} />
                    {loader.charAt(0) + loader.slice(1).toLowerCase()}
                  </label>
                ))}
              </div>
            </div>
            {profileState.error ? <p className="text-sm text-red-400">{profileState.error}</p> : null}
            {profileState.message ? <p className="text-sm text-green-400">{profileState.message}</p> : null}
            <Button type="submit" disabled={profilePending}>
              {profilePending ? "Saving…" : "Save profile"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
        </CardHeader>
        <CardBody>
          <form action={prefsAction} className="space-y-4">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox name="emailEnabled" defaultChecked={prefs.emailEnabled} />
              Email notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox name="digestEnabled" defaultChecked={prefs.digestEnabled} />
              Weekly digest email
            </label>
            <div>
              <Label htmlFor="digestFrequency">Digest frequency</Label>
              <select id="digestFrequency" name="digestFrequency" defaultValue={prefs.digestFrequency} className="w-full rounded-md border border-night-500/60 bg-night-900 px-3 py-2 text-sm">
                <option value="WEEKLY">Weekly</option>
                <option value="DAILY">Daily</option>
                <option value="NEVER">Never</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox name="projectNotifications" defaultChecked={prefs.projectNotifications} />
              Project release notifications
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox name="follows" defaultChecked={prefs.follows} />
              Follow activity
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox name="comments" defaultChecked={prefs.comments} />
              Comments
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <Checkbox name="announcements" defaultChecked={prefs.announcements} />
              Studio announcements
            </label>
            {prefsState.error ? <p className="text-sm text-red-400">{prefsState.error}</p> : null}
            {prefsState.message ? <p className="text-sm text-green-400">{prefsState.message}</p> : null}
            <Button type="submit" disabled={prefsPending}>
              {prefsPending ? "Saving…" : "Save preferences"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card className="border-red-500/40">
        <CardHeader>
          <CardTitle>Danger zone</CardTitle>
        </CardHeader>
        <CardBody>
          <form action={deleteAction} className="space-y-4">
            <p className="text-sm text-slate-400">
              Deleting your account removes favorites, follows, history, and notifications. This cannot be undone.
            </p>
            <div>
              <Label htmlFor="delete-password">Enter your password to confirm</Label>
              <Input
                id="delete-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            <Input type="hidden" name="confirm" value={password} readOnly />
            {deleteState.error ? <p className="text-sm text-red-400">{deleteState.error}</p> : null}
            <Button type="submit" variant="danger" disabled={deletePending || password.length < 8}>
              {deletePending ? "Deleting…" : "Delete account"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
