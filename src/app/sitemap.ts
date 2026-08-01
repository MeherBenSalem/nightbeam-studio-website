import type { MetadataRoute } from "next";
import { getRepo } from "@/lib/db/repo";

const siteUrl = process.env.APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepo();
  const projects = await repo.listProjects({ perPage: 100 });
  const today = new Date();
  return [
    { url: siteUrl, lastModified: today, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/projects`, lastModified: today, changeFrequency: "daily", priority: 0.9 },
    { url: `${siteUrl}/docs`, lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/about`, lastModified: today, changeFrequency: "monthly", priority: 0.5 },
    { url: `${siteUrl}/community`, lastModified: today, changeFrequency: "weekly", priority: 0.6 },
    ...projects.items.map((project) => ({
      url: `${siteUrl}/projects/${project.slug}`,
      lastModified: project.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
