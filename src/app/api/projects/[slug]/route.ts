import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withErrorHandling(async () => {
    const { slug } = await params;
    const repo = await getRepo();
    const user = await requireUser();
    const project = await repo.getProjectBySlug(slug, user?.id);
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
    return NextResponse.json(project);
  }, "/api/projects/[slug]", "GET");
}
