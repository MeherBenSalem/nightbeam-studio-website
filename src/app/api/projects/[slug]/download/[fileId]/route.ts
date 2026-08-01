import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { withErrorHandling } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

const paramsSchema = z.object({ slug: z.string(), fileId: z.string() });

export async function POST(_request: NextRequest, { params }: { params: Promise<{ slug: string; fileId: string }> }) {
  return withErrorHandling(async () => {
    const { slug, fileId } = paramsSchema.parse(await params);
    const repo = await getRepo();
    const project = await repo.getProjectBySlug(slug);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    const file = project.versions.flatMap((version) => version.files).find((candidate) => candidate.id === fileId);
    if (!file) return NextResponse.json({ error: "File not found" }, { status: 404 });

    const user = await requireUser();
    await repo.recordAnalyticsEvent({
      type: "DOWNLOAD",
      projectId: project.id,
      userId: user?.id ?? null,
      path: `/projects/${slug}/download/${fileId}`,
    });
    if (user) await repo.recordUserDownload(user.id, slug, fileId);

    return NextResponse.json({
      available: Boolean(file.downloadUrl),
      url: file.downloadUrl,
      fileName: file.fileName,
    });
  }, "/api/projects/[slug]/download/[fileId]", "POST");
}
