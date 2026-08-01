import { ProjectCard } from "@/components/projects/project-card";
import { EmptyState } from "@/components/ui/state";
import { PixelHeading } from "@/components/ui/pixel-heading";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export const metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const user = await requireUser();
  if (!user) return null;
  const repo = await getRepo();
  const items = await repo.listFavorites(user.id);
  return (
    <div>
      <PixelHeading as="h1">Favorites</PixelHeading>
      <p className="mt-2 text-sm text-slate-400">Mods you have starred.</p>
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="No favorites yet" body="Star a project to keep it one click away." />
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
