import { SettingsForm } from "@/components/dashboard/settings-form";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const [profile, prefs] = await Promise.all([repo.getProfile(user.id), repo.getNotificationPrefs(user.id)]);
  return <SettingsForm profile={profile ?? { displayName: null, bio: null, website: null, preferredVersions: [], preferredLoaders: [] }} prefs={prefs} />;
}
