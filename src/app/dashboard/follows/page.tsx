import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/state";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export const metadata = { title: "Following" };

export default async function FollowsPage() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const items = await repo.listFollows(user.id);
  return (
    <div>
      <PixelHeading as="h1">Following</PixelHeading>
      <p className="mt-2 text-sm text-slate-400">Projects you follow for release updates.</p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="Not following anything yet" body="Follow a project to get notified about new versions." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {items.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
