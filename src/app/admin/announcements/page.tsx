import { AnnouncementForm, DeleteAnnouncementButton } from "@/components/admin/announcement-forms";
import { Card, CardBody } from "@/components/ui/card";
import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { timeAgo } from "@/lib/utils/format";

export default async function AdminAnnouncementsPage() {
  const user = await requirePermission("announcements.manage");
  if (!user) return null;
  const repo = await getRepo();
  const announcements = await repo.listAllAnnouncements();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-semibold text-white">Announcements</h2>
        <p className="mt-2 text-sm text-slate-400">Active announcements appear at the top of the homepage.</p>
        <Card className="mt-4">
          <CardBody>
            <AnnouncementForm />
          </CardBody>
        </Card>
      </div>
      <div>
        <h2 className="font-semibold text-white">Existing announcements</h2>
        <ul className="mt-4 space-y-3">
          {announcements.map((announcement) => (
            <li key={announcement.id} className="pixel-panel flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
              <div>
                <div className="font-medium text-white">{announcement.title}</div>
                <div className="text-xs text-slate-500">
                  {announcement.slug} · {announcement.active ? "active" : "inactive"} · {timeAgo(announcement.createdAt)}
                </div>
              </div>
              <DeleteAnnouncementButton slug={announcement.slug} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
