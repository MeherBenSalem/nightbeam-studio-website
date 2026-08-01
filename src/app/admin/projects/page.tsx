import { ProjectOverrideForm } from "@/components/admin/project-override-form";
import { requirePermission } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export default async function AdminProjectsPage() {
  const user = await requirePermission("projects.manage");
  if (!user) return null;
  const repo = await getRepo();
  const result = await repo.listProjects({ perPage: 100, sort: "name" });
  const overrides = await Promise.all(result.items.map((project) => repo.getProjectOverride(project.id)));

  return (
    <div>
      <h2 className="font-semibold text-white">Projects &amp; overrides</h2>
      <p className="mt-2 text-sm text-slate-400">
        Overrides layer on top of synced CurseForge data. Clear a field to fall back to the synced value.
      </p>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {result.items.map((project, index) => (
          <ProjectOverrideForm key={project.id} projectId={project.id} projectName={project.name} override={overrides[index]} />
        ))}
      </div>
    </div>
  );
}
