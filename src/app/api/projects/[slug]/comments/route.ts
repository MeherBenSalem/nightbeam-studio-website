import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { jsonError, parseJson, withErrorHandling } from "@/lib/api/helpers";
import { requireUser } from "@/lib/auth/guards";
import { getRepo } from "@/lib/db/repo";

const commentSchema = z.object({ content: z.string().trim().min(1).max(2000) });

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withErrorHandling(async () => {
    const { slug } = await params;
    const repo = await getRepo();
    const project = await repo.getProjectBySlug(slug);
    if (!project) return jsonError("Project not found", 404);
    return NextResponse.json({ items: project.comments });
  }, "/api/projects/[slug]/comments", "GET");
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  return withErrorHandling(async () => {
    const user = await requireUser();
    if (!user) return jsonError("Sign in required", 401);
    const { slug } = await params;
    const body = await parseJson(request);
    const parsed = commentSchema.safeParse(body);
    if (!parsed.success) return jsonError("Comment must be 1–2000 characters");
    const repo = await getRepo();
    const comment = await repo.addComment(slug, user.id, parsed.data.content);
    if (!comment) return jsonError("Project not found", 404);
    return NextResponse.json({ comment });
  }, "/api/projects/[slug]/comments", "POST");
}
