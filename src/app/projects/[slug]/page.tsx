import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/state";
import { Tabs } from "@/components/ui/tabs";
import { DownloadButton, ProjectActions } from "@/components/projects/project-actions";
import { ScreenshotGallery } from "@/components/projects/screenshot-gallery";
import { ViewTracker } from "@/components/projects/view-tracker";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";
import { formatBytes, formatDate, formatNumber } from "@/lib/utils/format";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepo();
  const project = await repo.getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return {
    title: project.name,
    description: project.summary,
    openGraph: {
      title: `${project.name} — NightBeam Studio`,
      description: project.summary,
      type: "website",
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getRepo();
  const user = await requireUser();
  const project = await repo.getProjectBySlug(slug, user?.id);
  if (!project) notFound();

  await repo.recordProjectView(slug, user?.id);

  const latestVersion = project.versions[0];
  const primaryFile = latestVersion?.files.find((file) => file.kind === "primary") ?? latestVersion?.files[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    applicationCategory: "GameApplication",
    operatingSystem: "Minecraft Java Edition",
    description: project.summary,
    author: { "@type": "Organization", name: project.studioName },
    creator: { "@type": "Person", name: project.authorName },
    softwareVersion: project.latestVersion ?? undefined,
    dateModified: project.updatedAt.toISOString(),
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  const tabs = [
    {
      id: "downloads",
      label: "Downloads",
      content: (
        <div className="space-y-5">
          {project.versions.length === 0 ? (
            <EmptyState title="No downloads yet" body="Files will appear once CurseForge sync is live." />
          ) : (
            project.versions.map((version) => (
              <Card key={version.id}>
                <CardHeader>
                  <CardTitle>v{version.version}</CardTitle>
                  <Badge tone={version.releaseType === "ALPHA" ? "amber" : version.releaseType === "BETA" ? "blue" : "green"}>
                    {version.releaseType}
                  </Badge>
                </CardHeader>
                <CardBody>
                  <ul className="divide-y divide-night-600/40">
                    {version.files.map((file) => (
                      <li key={file.id} className="flex flex-wrap items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-slate-100">{file.fileName}</div>
                          <div className="mt-0.5 text-xs text-slate-500">
                            {formatBytes(file.fileSize)} · {formatNumber(file.downloads)} downloads
                          </div>
                        </div>
                        <DownloadButton slug={slug} fileId={file.id} />
                      </li>
                    ))}
                  </ul>
                </CardBody>
              </Card>
            ))
          )}
        </div>
      ),
    },
    {
      id: "versions",
      label: "Versions",
      content: (
        <div className="overflow-x-auto">
          <table className="w-full min-w-130 text-left text-sm">
            <thead>
              <tr className="border-b border-night-600/50 text-xs uppercase tracking-wide text-slate-500">
                <th scope="col" className="px-3 py-2">Version</th>
                <th scope="col" className="px-3 py-2">Minecraft</th>
                <th scope="col" className="px-3 py-2">Loaders</th>
                <th scope="col" className="px-3 py-2">Type</th>
                <th scope="col" className="px-3 py-2">Released</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-night-600/40">
              {project.versions.map((version) => (
                <tr key={version.id}>
                  <td className="px-3 py-3 font-semibold text-white">
                    v{version.version}
                    {version.isLatest ? <Badge tone="cyan" className="ml-2">Latest</Badge> : null}
                  </td>
                  <td className="px-3 py-3 text-slate-300">{version.minecraftVersions.join(", ")}</td>
                  <td className="px-3 py-3 text-slate-300">{version.loaders.join(", ")}</td>
                  <td className="px-3 py-3 text-slate-300">{version.releaseType}</td>
                  <td className="px-3 py-3 text-slate-400">{formatDate(version.releaseDate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: "gallery",
      label: "Gallery",
      content: <ScreenshotGallery screenshots={project.screenshots} />,
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ViewTracker slug={slug} />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-wrap items-start gap-6">
          {project.iconUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={project.iconUrl} alt="" className="h-20 w-20 rounded-xl border border-night-500/60 object-cover" />
          ) : (
            <div className="grid h-20 w-20 place-items-center rounded-xl border border-night-500/60 bg-gradient-to-br from-purple-600/40 via-night-800 to-cyan-500/30 font-pixel text-2xl text-white">
              {project.name.slice(0, 1)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-pixel text-lg text-white sm:text-xl">{project.name.toUpperCase()}</h1>
              <Badge tone="purple">{project.type}</Badge>
              <Badge tone={project.status === "ACTIVE" ? "green" : "default"}>{project.status}</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-slate-400">
              by <Link href="/about" className="text-pixel-cyan hover:underline">{project.authorName}</Link> · {project.studioName}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.loaders.map((loader) => (
                <Badge key={loader} tone="blue">{loader}</Badge>
              ))}
              {project.minecraftVersions.map((version) => (
                <Badge key={version} tone="cyan">MC {version}</Badge>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end gap-3">
            <ProjectActions
              slug={slug}
              initialFavorite={project.isFavorite ?? false}
              initialFollow={project.isFollowed ?? false}
              loggedIn={Boolean(user)}
              downloadFileId={primaryFile?.id}
            />
            <div className="flex gap-5 text-xs text-slate-500">
              <span>⬇ {formatNumber(project.downloads)} downloads</span>
              <span>★ {formatNumber(project.followers)} followers</span>
              <span>👁 {formatNumber(project.views)} views</span>
            </div>
          </div>
        </div>

        <div className="mt-10">
          <Tabs tabs={tabs} initialTab="downloads" />
        </div>
      </div>
    </>
  );
}
